import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ABSOLUTE_MAX_TURNS = 10;
const DEFAULT_MAX_TURNS = 8;
const MAX_MESSAGE_LENGTH = 300;
const MAX_HISTORY_TURNS = 10;
const TIMEOUT_MS = 15000;

// Verified active Gemini models supporting generateContent for the project API key
const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-3.1-flash-lite";

function sanitizeForLogs(text: string, apiKey?: string): string {
  let cleaned = String(text || "")
    .replace(/[\r\n\t]+/g, " ")
    .trim();
  if (apiKey) {
    cleaned = cleaned.split(apiKey).join("[REDACTED_API_KEY]");
  }
  return cleaned.slice(0, 1000);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Endast POST-anrop är tillåtna." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const reqStartTime = Date.now();

  try {
    // 1. Authorization header enforcement
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Obehörig: Giltig autentiseringstoken saknas.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Obehörig: Token är tom." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Server-side Supabase client with user JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const envModel = Deno.env.get("GEMINI_MODEL");

    // Selected model from env (if valid) or PRIMARY_MODEL
    const activePrimaryModel =
      envModel && !envModel.includes("2.5") && !envModel.includes("3.6")
        ? envModel.trim()
        : PRIMARY_MODEL;

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          error: "Serverkonfigurationsfel: Databasanslutning saknas.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // 3. Verify user JWT token on server
    const {
      data: { user },
      error: authError,
    } = await supabaseUserClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Obehörig: Ogiltig eller utgången session." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const verifiedUserId = user.id;

    // 4. Check if user is admin
    const { data: roleData } = await supabaseUserClient
      .from("user_roles")
      .select("role")
      .eq("user_id", verifiedUserId)
      .maybeSingle();

    const isAdmin = roleData?.role === "admin";

    // 5. Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Felaktigt JSON-format i anropet." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // -------------------------------------------------------------
    // DIAGNOSTIC SUITE: Strictly restricted to verified admins
    // -------------------------------------------------------------
    if (body?.action === "diagnose" || body?.isDiagnostic === true) {
      if (!isAdmin) {
        return new Response(
          JSON.stringify({
            error:
              "Obehörig: Endast administratörer har behörighet att köra AI-diagnostik.",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (!geminiApiKey) {
        return new Response(
          JSON.stringify({
            status: "error",
            rootCause: "GEMINI_API_KEY saknas i miljövariabler.",
            keyValid: false,
            quotaOk: false,
            workingModel: null,
            testedModels: [activePrimaryModel, FALLBACK_MODEL],
            totalDurationMs: Date.now() - reqStartTime,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Step 1: Query GET /v1beta/models
      const step1Start = Date.now();
      let modelsHttpStatus = 0;
      let availableGenerateContentModels: string[] = [];
      let step1Error: string | null = null;

      try {
        const listRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models",
          {
            method: "GET",
            headers: { "x-goog-api-key": geminiApiKey },
          },
        );
        modelsHttpStatus = listRes.status;
        const listText = await listRes.text();

        if (listRes.ok) {
          try {
            const parsedList = JSON.parse(listText);
            const rawModels = parsedList.models || [];
            availableGenerateContentModels = rawModels
              .filter(
                (m: any) =>
                  Array.isArray(m.supportedGenerationMethods) &&
                  m.supportedGenerationMethods.includes("generateContent"),
              )
              .map((m: any) => (m.name || "").replace("models/", ""));
          } catch {
            step1Error = "Kunde inte parsa modellistan.";
          }
        } else {
          step1Error = sanitizeForLogs(listText, geminiApiKey);
        }
      } catch (err: any) {
        step1Error = err?.message || "Nätverksfel vid hämtning av modeller.";
      }
      const step1Duration = Date.now() - step1Start;

      // Step 2: Minimal generateContent probe on chosen model
      const probeModel = availableGenerateContentModels.includes(
        activePrimaryModel,
      )
        ? activePrimaryModel
        : availableGenerateContentModels.includes(FALLBACK_MODEL)
          ? FALLBACK_MODEL
          : availableGenerateContentModels[0] || activePrimaryModel;

      const probeStart = Date.now();
      let probeHttpStatus = 0;
      let candidateText = "";
      let probeError: string | null = null;

      try {
        const probeRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${probeModel}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiApiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Svara med ett ord: "Hej"' }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 50,
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          },
        );

        probeHttpStatus = probeRes.status;
        const probeText = await probeRes.text();

        if (probeRes.ok) {
          try {
            const parsedProbe = JSON.parse(probeText);
            candidateText =
              parsedProbe.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
              "";
          } catch {
            probeError = "Kunde inte parsa generateContent JSON.";
          }
        } else {
          probeError = sanitizeForLogs(probeText, geminiApiKey);
        }
      } catch (err: any) {
        probeError = err?.message || "Nätverksfel vid probe.";
      }
      const probeDuration = Date.now() - probeStart;

      const isSuccess = probeHttpStatus === 200 && candidateText.length > 0;
      const totalDuration = Date.now() - reqStartTime;

      return new Response(
        JSON.stringify({
          status: isSuccess ? "success" : "error",
          step1_models: {
            httpStatus: modelsHttpStatus,
            durationMs: step1Duration,
            supportedModelsCount: availableGenerateContentModels.length,
            supportedModels: availableGenerateContentModels,
            error: step1Error,
          },
          step2_selectedModel: probeModel,
          step3_probe: {
            model: probeModel,
            httpStatus: probeHttpStatus,
            durationMs: probeDuration,
            candidateText: candidateText || undefined,
            error: probeError || undefined,
          },
          verification: {
            apiKeyValid: modelsHttpStatus === 200,
            modelAccessOk: probeHttpStatus === 200,
            quotaOk: probeHttpStatus !== 429 && modelsHttpStatus !== 429,
            adminOnlyEnforced: true,
            totalDurationMs: totalDuration,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // -------------------------------------------------------------
    // REGULAR ROLEPLAY EXECUTION
    // -------------------------------------------------------------
    const {
      missionId,
      blockId,
      userMessage,
      conversationHistory,
      isDemoMode,
      generateFeedback,
    } = body || {};

    if (
      !missionId ||
      typeof missionId !== "string" ||
      !userMessage ||
      typeof userMessage !== "string"
    ) {
      return new Response(
        JSON.stringify({
          error: "Saknade obligatoriska fält (missionId, userMessage).",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const trimmedMessage = userMessage.trim();
    if (trimmedMessage.length === 0) {
      return new Response(
        JSON.stringify({ error: "Meddelandet får inte vara tomt." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `Meddelandet överskrider tillåten maxlängd (${MAX_MESSAGE_LENGTH} tecken).`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 6. Verify mission exists and is published (or user is admin)
    const cleanMissionId = String(missionId).replace(/^u/i, "");
    const missionIdVariants = Array.from(
      new Set([missionId, cleanMissionId, `u${cleanMissionId}`]),
    );

    const { data: mission, error: missionError } = await supabaseUserClient
      .from("missions")
      .select("id, title, is_published")
      .in("id", missionIdVariants)
      .maybeSingle();

    if (missionError || !mission) {
      return new Response(
        JSON.stringify({ error: "Uppdraget kunde inte hittas." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!mission.is_published && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Uppdraget är inte publicerat." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 7. Authoritative server configuration from database block
    let serverScenario = body.scenario || "Ett enkelt vardagssamtal på svenska";
    let serverCharacterName = body.characterName || "Samtalspartner";
    let serverCharacterRole = body.characterRole || "Samtalspartner";
    let serverUserRole = body.userRole || "Kund";
    let serverLanguageLevel = body.languageLevel || "A1";
    let serverGoalDescription =
      body.goalDescription ||
      body.learningGoal ||
      "Ha en kort dialog på svenska";
    let serverAllowedTopics = body.allowedTopics || ["vardag", "presentation"];
    let serverSuggestedPhrases = body.suggestedPhrases || [];
    let serverMaxTurns =
      typeof body.maxTurns === "number" ? body.maxTurns : DEFAULT_MAX_TURNS;

    try {
      let blockQuery = supabaseUserClient
        .from("lesson_blocks")
        .select("id, block_type, content")
        .in("mission_id", missionIdVariants)
        .eq("block_type", "ai_roleplay");

      if (blockId && typeof blockId === "string") {
        blockQuery = blockQuery.eq("id", blockId);
      }

      const { data: dbBlock } = await blockQuery.maybeSingle();
      if (dbBlock?.content?.exercise) {
        const ex = dbBlock.content.exercise;
        if (ex.scenario) serverScenario = ex.scenario;
        if (ex.characterName) serverCharacterName = ex.characterName;
        if (ex.characterRole) serverCharacterRole = ex.characterRole;
        if (ex.userRole) serverUserRole = ex.userRole;
        if (ex.languageLevel) serverLanguageLevel = ex.languageLevel;
        if (ex.learningGoal || ex.goalDescription)
          serverGoalDescription = ex.learningGoal || ex.goalDescription;
        if (Array.isArray(ex.allowedTopics) && ex.allowedTopics.length > 0)
          serverAllowedTopics = ex.allowedTopics;
        if (
          Array.isArray(ex.suggestedPhrases) &&
          ex.suggestedPhrases.length > 0
        )
          serverSuggestedPhrases = ex.suggestedPhrases;
        if (typeof ex.maxTurns === "number" && ex.maxTurns > 0) {
          serverMaxTurns = ex.maxTurns;
        }
      }
    } catch {
      // Fall back to validated request values
    }

    const configuredMaxTurns = Math.min(
      Math.max(serverMaxTurns, 1),
      ABSOLUTE_MAX_TURNS,
    );

    // 8. Server-side history validation and turn counting
    const rawHistory = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];
    const history = rawHistory
      .filter(
        (h: any) =>
          h &&
          (h.sender === "user" || h.sender === "ai") &&
          typeof h.text === "string",
      )
      .slice(-MAX_HISTORY_TURNS);

    const userTurnCount =
      history.filter((h: any) => h.sender === "user").length + 1;
    const isTurnLimitReached = userTurnCount >= configuredMaxTurns;

    // 9. If in explicit demo mode or admin preview without Gemini key
    const isExplicitDemo = Boolean(isDemoMode) || (isAdmin && !geminiApiKey);

    if (!geminiApiKey && !isExplicitDemo) {
      return new Response(
        JSON.stringify({
          error:
            "AI-tjänsten är inte konfigurerad på servern (GEMINI_API_KEY saknas). Kontakta administratören.",
          isConfigError: true,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 10. Gemini Roleplay generation with header-based auth & controlled 404 fallback
    if (geminiApiKey && !isExplicitDemo) {
      const formattedHistory = history
        .map(
          (h: any) =>
            `${h.sender === "user" ? serverUserRole : serverCharacterName}: ${String(h.text || "").slice(0, 150)}`,
        )
        .join("\n");

      const promptText = `Du är rollspelskaraktären "${serverCharacterName}" (${serverCharacterRole}) i en svensk språkinlärningsapp för nivå ${serverLanguageLevel}.
Scenario: "${serverScenario}"
Mål för eleven (${serverUserRole}): "${serverGoalDescription}"
Tur: ${userTurnCount} av ${configuredMaxTurns}.

${formattedHistory ? `Tidigare samtal:\n${formattedHistory}\n` : ""}
Elevens senaste svar: "${trimmedMessage}"

Regler:
1. Svara i rollen på enkel svenska (1-2 korta meningar anpassade för A1).
2. Om målet är uppnått eller tur ${configuredMaxTurns} nås, avsluta vänligt och sätt goalAccomplished=true.
3. Svara strikt i följande format:
{"aiReply": "Ditt korta svar på svenska", "goalAccomplished": false, "hintForNextTurn": "Ett kort tips", "feedback": {"strengths": "Bra sak", "correction": "", "improvedExample": ""}}`;

      const executeGeminiCall = async (model: string) => {
        const stepStart = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": geminiApiKey,
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 600,
                  thinkingConfig: { thinkingBudget: 0 },
                },
              }),
              signal: controller.signal,
            },
          );

          const durationMs = Date.now() - stepStart;
          const upstreamStatus = geminiRes.status;
          const isOk = geminiRes.ok;
          const responseText = await geminiRes.text();

          console.log(
            `[ai-roleplay] Step: generateContent, Model: ${model}, HTTP: ${upstreamStatus}, Duration: ${durationMs}ms`,
          );

          return {
            status: upstreamStatus,
            ok: isOk,
            text: responseText,
            durationMs,
            isTimeout: false,
          };
        } catch (fetchErr: any) {
          const isAbort = fetchErr?.name === "AbortError";
          const durationMs = Date.now() - stepStart;
          console.error(
            `[ai-roleplay] Step: generateContent, Model: ${model}, Duration: ${durationMs}ms, Exception: ${fetchErr?.name || "Error"}`,
          );
          return {
            status: isAbort ? 504 : 502,
            ok: false,
            text: "",
            durationMs,
            isTimeout: isAbort,
          };
        } finally {
          clearTimeout(timeoutId);
        }
      };

      // 1. Try primary model first
      let currentModel = activePrimaryModel;
      let callResult = await executeGeminiCall(currentModel);

      // If timeout, abort immediately without retrying across other models
      if (callResult.isTimeout) {
        return new Response(
          JSON.stringify({
            error: "Anropet tog för lång tid (timeout). Försök igen.",
            errorCode: "GEMINI_TIMEOUT",
            isTimeout: true,
          }),
          {
            status: 504,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // If upstream explicitly returns 404, allow at most one fallback switch
      if (callResult.status === 404 && currentModel !== FALLBACK_MODEL) {
        console.warn(
          `[ai-roleplay] Model ${currentModel} returned 404. Switching once to fallback model ${FALLBACK_MODEL}.`,
        );
        currentModel = FALLBACK_MODEL;
        callResult = await executeGeminiCall(currentModel);

        if (callResult.isTimeout) {
          return new Response(
            JSON.stringify({
              error: "Anropet tog för lång tid (timeout). Försök igen.",
              errorCode: "GEMINI_TIMEOUT",
              isTimeout: true,
            }),
            {
              status: 504,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
      }

      // If rate limit (429)
      if (callResult.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Servern är tillfälligt överbelastad (hastighetsgräns för AI). Försök igen om en liten stund.",
            errorCode: "GEMINI_RATE_LIMIT",
            upstreamStatus: 429,
            isRateLimit: true,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // If model not found (404)
      if (callResult.status === 404) {
        const sanitizedErr = sanitizeForLogs(callResult.text, geminiApiKey);
        return new Response(
          JSON.stringify({
            error: `AI-modellen (${currentModel}) hittades inte hos leverantören.`,
            errorCode: "GEMINI_MODEL_NOT_FOUND",
            upstreamStatus: 404,
            rawError: sanitizedErr,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // If other non-2xx error
      if (!callResult.ok) {
        const sanitizedErr = sanitizeForLogs(callResult.text, geminiApiKey);
        console.error(
          `[ai-roleplay] Upstream error [model: ${currentModel}, status: ${callResult.status}, error: ${sanitizedErr}]`,
        );
        return new Response(
          JSON.stringify({
            error: "Ett fel uppstod vid kommunikation med AI-tjänsten.",
            errorCode: "GEMINI_UPSTREAM_ERROR",
            upstreamStatus: callResult.status,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Parse 2xx response
      let geminiData: any;
      try {
        geminiData = JSON.parse(callResult.text);
      } catch {
        return new Response(
          JSON.stringify({
            error: "Kunde inte tolka formatet på AI-svaret.",
            errorCode: "GEMINI_INVALID_JSON",
            isModelError: true,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const candidate = geminiData.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text;

      if (!candidate || !rawText) {
        const finishReason = candidate?.finishReason || "NO_CANDIDATE";
        console.error(
          `[ai-roleplay] Empty or blocked candidate [model: ${currentModel}, finishReason: ${finishReason}]`,
        );
        return new Response(
          JSON.stringify({
            error: "AI-modellen returnerade inget giltigt svar. Försök igen.",
            errorCode: "GEMINI_EMPTY_RESPONSE",
            finishReason,
            isModelError: true,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Extract JSON or text safely
      let cleaned = String(rawText).trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
      }

      let parsed: any = null;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // If strict JSON parse fails, attempt regex extraction for aiReply
        const replyMatch = cleaned.match(/"aiReply"\s*:\s*"([^"]+)"/);
        if (replyMatch && replyMatch[1]) {
          parsed = {
            aiReply: replyMatch[1],
            goalAccomplished: isTurnLimitReached,
          };
        } else {
          // Use whole text as fallback reply
          parsed = {
            aiReply: cleaned.replace(/[{}\[\]"]/g, "").trim(),
            goalAccomplished: isTurnLimitReached,
          };
        }
      }

      const finalReply =
        typeof parsed?.aiReply === "string" && parsed.aiReply.trim().length > 0
          ? parsed.aiReply.trim()
          : typeof cleaned === "string" && cleaned.length > 0
            ? cleaned.slice(0, 200)
            : "Tack för ditt svar!";

      const isAccomplished =
        Boolean(parsed?.goalAccomplished) || isTurnLimitReached;

      return new Response(
        JSON.stringify({
          aiReply: finalReply,
          goalAccomplished: isAccomplished,
          hintForNextTurn: parsed?.hintForNextTurn
            ? String(parsed.hintForNextTurn)
            : undefined,
          feedback:
            isAccomplished || generateFeedback
              ? {
                  strengths: String(
                    parsed?.feedback?.strengths ||
                      "Bra genomfört samtal på svenska!",
                  ),
                  correction: parsed?.feedback?.correction
                    ? String(parsed.feedback.correction)
                    : undefined,
                  improvedExample: parsed?.feedback?.improvedExample
                    ? String(parsed.feedback.improvedExample)
                    : undefined,
                  usedTargetPhrases: Array.isArray(
                    parsed?.feedback?.usedTargetPhrases,
                  )
                    ? parsed.feedback.usedTargetPhrases
                    : [],
                }
              : undefined,
          turnsCount: userTurnCount,
          maxTurns: configuredMaxTurns,
          modelUsed: currentModel,
          durationMs: callResult.durationMs,
          isDemo: false,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 11. Deterministic demo fallback (for explicitly marked Admin demo / Preview only)
    const lower = trimmedMessage.toLowerCase();
    let aiReply = `Hej! Jag är ${serverCharacterName} (${serverCharacterRole}).`;
    let goalAccomplished = isTurnLimitReached;
    let hintForNextTurn = "Berätta vad du heter eller vad du vill beställa.";

    if (
      lower.includes("hej") ||
      lower.includes("god morgon") ||
      lower.includes("god dag")
    ) {
      aiReply = `Hej! Välkommen. Hur mår du idag?`;
      hintForNextTurn = 'Svara till exempel: "Jag mår bra, tack!"';
    } else if (lower.includes("mår bra") || lower.includes("bara bra")) {
      aiReply = `Vad roligt att höra! Vad kan jag hjälpa dig med idag?`;
      hintForNextTurn =
        serverSuggestedPhrases && serverSuggestedPhrases.length > 0
          ? serverSuggestedPhrases[0]
          : "Berätta vad du vill ha eller göra.";
    } else if (
      lower.includes("kaffe") ||
      lower.includes("fika") ||
      lower.includes("bulle") ||
      lower.includes("te")
    ) {
      aiReply = `Absolut! Vill du ha något mer till det?`;
      hintForNextTurn =
        'Svara till exempel: "Nej tack, det är bra så. Vad kostar det?"';
    } else if (
      lower.includes("kostar") ||
      lower.includes("kronor") ||
      lower.includes("kr") ||
      lower.includes("betala")
    ) {
      aiReply = `Det blir 45 kronor. Vill du betala med kort eller kontant?`;
      hintForNextTurn = 'Svara: "Med kort, tack."';
    } else if (
      lower.includes("kort") ||
      lower.includes("kontant") ||
      lower.includes("tack") ||
      lower.includes("hej då")
    ) {
      aiReply = `Tack så mycket och välkommen åter! Ha en trevlig dag!`;
      goalAccomplished = true;
      hintForNextTurn = 'Avsluta gärna med: "Tack, detsamma! Hej då!"';
    } else if (isTurnLimitReached) {
      aiReply = `Tack för ett trevligt samtal! Vi har nått slutet på denna övning.`;
      goalAccomplished = true;
      hintForNextTurn = "Klicka på Slutför för att gå vidare.";
    } else {
      aiReply = `Tack! Kan du berätta lite mer på enkel svenska?`;
      hintForNextTurn =
        serverSuggestedPhrases && serverSuggestedPhrases.length > 0
          ? serverSuggestedPhrases[0]
          : "Använd en enkel mening på svenska.";
    }

    const matchedPhrases = (serverSuggestedPhrases || []).filter((p: string) =>
      lower.includes(p.toLowerCase()),
    );

    const feedback =
      goalAccomplished || isTurnLimitReached || generateFeedback
        ? {
            strengths:
              "Du höll igång samtalet och svarade på enkel och förståelig svenska.",
            correction:
              'Kom ihåg att använda artiga ord som "tack" och fullständiga verbformer.',
            improvedExample:
              serverSuggestedPhrases && serverSuggestedPhrases.length > 0
                ? serverSuggestedPhrases[0]
                : "En kaffe, tack!",
            usedTargetPhrases: matchedPhrases,
          }
        : undefined;

    return new Response(
      JSON.stringify({
        aiReply,
        goalAccomplished,
        hintForNextTurn,
        feedback,
        turnsCount: userTurnCount,
        maxTurns: configuredMaxTurns,
        isDemo: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Ett internt serverfel inträffade." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
