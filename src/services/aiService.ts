import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface AiEvaluationRequest {
  missionId: string;
  missionTitle: string;
  userText: string;
  promptGoal: string;
  targetTopics: string[];
  expectedLevel?: "A1" | "A2";
  isDemoMode?: boolean;
}

export interface AiEvaluationResponse {
  isAcceptable: boolean;
  score: number; // 0-100
  pedagogicalFeedback: string;
  grammaticalTips?: string;
  encouragement: string;
  correctedSentence?: string;
  isDemo: boolean;
  error?: string;
}

export interface AiRoleplayFeedback {
  strengths: string;
  correction?: string;
  improvedExample?: string;
  usedTargetPhrases?: string[];
}

export interface AiRoleplayTurnRequest {
  missionId: string;
  blockId?: string;
  characterName: string;
  characterRole: string;
  userRole?: string;
  languageLevel?: "A1" | "A2";
  scenario: string;
  userMessage: string;
  conversationHistory: Array<{ sender: "ai" | "user"; text: string }>;
  goalDescription: string;
  allowedTopics: string[];
  suggestedPhrases?: string[];
  maxTurns?: number;
  generateFeedback?: boolean;
  isDemoMode?: boolean;
}

export interface AiRoleplayTurnResponse {
  aiReply: string;
  goalAccomplished: boolean;
  hintForNextTurn?: string;
  feedback?: AiRoleplayFeedback;
  turnsCount?: number;
  maxTurns?: number;
  isDemo: boolean;
  error?: string;
  isRateLimit?: boolean;
  isTimeout?: boolean;
}

class AiService {
  /**
   * Evaluates student's free text input with pedagogical feedback.
   */
  async evaluateFreeText(
    request: AiEvaluationRequest,
  ): Promise<AiEvaluationResponse> {
    const trimmed = request.userText.trim();
    if (!trimmed) {
      return {
        isAcceptable: false,
        score: 0,
        pedagogicalFeedback:
          "Skriv en hel mening på svenska för att få återkoppling.",
        encouragement: "Försök igen med några av orden du nyss lärt dig!",
        isDemo: true,
      };
    }

    if (isSupabaseConfigured() && !request.isDemoMode) {
      try {
        const { data, error } = await supabase.functions.invoke(
          "ai-evaluator",
          {
            body: request,
          },
        );

        if (!error && data) {
          if (data.error) {
            return {
              isAcceptable: false,
              score: 0,
              pedagogicalFeedback: data.error,
              encouragement: "Ett fel uppstod vid AI-bedömningen.",
              isDemo: Boolean(data.isDemo),
              error: data.error,
            };
          }
          return {
            ...data,
            isDemo: false,
          };
        }
      } catch (err: any) {
        console.warn("Backend AI evaluator function unavailable:", err);
      }
    }

    // High quality local deterministic pedagogical feedback engine (Swedish A1)
    const lower = trimmed.toLowerCase();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const hasVerb =
      /^(jag|vi|han|hon|man)\s+[a-zåäö]+(er|ar|r|t)/i.test(trimmed) ||
      /\b(heter|bor|kommer|talar|pratar|är|har|arbetar|jobbar|köper|vill|tar|äter|dricker)\b/i.test(
        lower,
      );

    const isGoodLength = wordCount >= 3;
    const isAcceptable = hasVerb && isGoodLength;

    let pedagogicalFeedback = "Bra försök! ";
    let grammaticalTips = "";
    let encouragement = "Fortsätt öva för att bli ännu säkrare!";

    if (!hasVerb) {
      pedagogicalFeedback +=
        'Kom ihåg att en fullständig mening på svenska behöver ett verb (t.ex. "heter", "bor", "är", "arbetar").';
      grammaticalTips =
        "Verb står oftast på plats 2 i en vanlig svensk påståendesats.";
    } else if (isAcceptable) {
      pedagogicalFeedback += `Du har byggt en tydlig och begriplig mening på A1-nivå som svarar mot uppdraget "${request.missionTitle}".`;
      encouragement =
        "Snyggt jobbat! Din svenska mening är grammatiskt begriplig och relevant.";
    }

    return {
      isAcceptable,
      score: isAcceptable ? 90 : 50,
      pedagogicalFeedback,
      grammaticalTips,
      encouragement,
      isDemo: true,
    };
  }

  /**
   * Generates next turn in an interactive AI roleplay dialogue.
   * In student production mode, strictly returns server AI response or explicit error.
   * Never silently substitutes fake AI responses for real students.
   */
  async getRoleplayResponse(
    request: AiRoleplayTurnRequest,
  ): Promise<AiRoleplayTurnResponse> {
    const configuredMax = request.maxTurns || 8;
    const history = request.conversationHistory || [];
    const currentTurnCount =
      history.filter((h) => h.sender === "user").length + 1;
    const isTurnLimitReached = currentTurnCount >= configuredMax;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke("ai-roleplay", {
          body: {
            missionId: request.missionId,
            blockId: request.blockId,
            userMessage: request.userMessage,
            conversationHistory: request.conversationHistory,
            isDemoMode: request.isDemoMode,
            generateFeedback: request.generateFeedback,
            // Fallback parameters if database block is not yet seeded
            scenario: request.scenario,
            characterName: request.characterName,
            characterRole: request.characterRole,
            userRole: request.userRole,
            languageLevel: request.languageLevel,
            learningGoal: request.goalDescription,
            allowedTopics: request.allowedTopics,
            suggestedPhrases: request.suggestedPhrases,
            maxTurns: request.maxTurns,
          },
        });

        if (error) {
          console.warn("Supabase function error in ai-roleplay:", error);

          let serverErrorMsg: string | null = null;
          let isRateLimit = false;
          let isTimeout = false;

          // Attempt to extract structured error response from FunctionsHttpError context
          try {
            const context = (error as any).context;
            if (context) {
              const resClone =
                typeof context.clone === "function" ? context.clone() : context;
              if (typeof resClone.json === "function") {
                const parsedBody = await resClone.json();
                if (parsedBody && typeof parsedBody === "object") {
                  if (parsedBody.error)
                    serverErrorMsg = String(parsedBody.error);
                  if (
                    parsedBody.isRateLimit ||
                    parsedBody.errorCode === "GEMINI_RATE_LIMIT"
                  )
                    isRateLimit = true;
                  if (
                    parsedBody.isTimeout ||
                    parsedBody.errorCode === "GEMINI_TIMEOUT"
                  )
                    isTimeout = true;
                }
              }
            }
          } catch {
            // Context wasn't JSON or could not be read
          }

          if (!serverErrorMsg) {
            const status = (error as any)?.status;
            if (status === 429) {
              serverErrorMsg =
                "Servern är tillfälligt överbelastad (hastighetsgräns för AI). Försök igen om en liten stund.";
              isRateLimit = true;
            } else if (status === 504) {
              serverErrorMsg =
                "Anropet tog för lång tid (timeout). Försök igen.";
              isTimeout = true;
            } else if (status === 503) {
              serverErrorMsg =
                "AI-tjänsten är inte konfigurerad på servern (GEMINI_API_KEY saknas).";
            } else if (status === 401) {
              serverErrorMsg =
                "Obehörig: Logga in igen för att använda AI-rollspelet.";
            } else {
              serverErrorMsg =
                error.message ||
                "Ett fel uppstod vid kommunikation med AI-servern.";
            }
          }

          // If not in demo mode, do not silently fake responses
          if (!request.isDemoMode) {
            return {
              aiReply: "",
              goalAccomplished: false,
              isDemo: false,
              error:
                serverErrorMsg ||
                "Ett fel uppstod vid kommunikation med AI-servern.",
              isRateLimit,
              isTimeout,
            };
          }
        } else if (data) {
          if (data.error) {
            return {
              aiReply: "",
              goalAccomplished: false,
              isDemo: Boolean(data.isDemo),
              error: data.error,
              isRateLimit: Boolean(data.isRateLimit),
              isTimeout: Boolean(data.isTimeout),
            };
          }
          return {
            ...data,
            turnsCount: data.turnsCount ?? currentTurnCount,
            maxTurns: data.maxTurns ?? configuredMax,
            isDemo: Boolean(data.isDemo),
          };
        }
      } catch (err: any) {
        console.warn("Backend AI roleplay invoke error:", err);
        if (!request.isDemoMode) {
          return {
            aiReply: "",
            goalAccomplished: false,
            isDemo: false,
            error:
              err?.message ||
              "Ett anslutningsfel uppstod vid kontakt med AI-tjänsten.",
          };
        }
      }
    }

    // Only reached in explicit demo mode (or offline dev environment)
    const userText = request.userMessage.toLowerCase();
    let reply = `Trevligt att samtala med dig! Jag är ${request.characterName || request.characterRole}.`;
    let goalAccomplished = isTurnLimitReached;
    let hint = "Svara vänligt och ställ gärna en enkel fråga.";

    if (
      userText.includes("hej") ||
      userText.includes("god morgon") ||
      userText.includes("god dag")
    ) {
      reply = `Hej! Välkommen. Hur mår du idag?`;
      hint = 'Berätta hur du mår (t.ex. "Jag mår bra, tack!").';
    } else if (userText.includes("mår bra") || userText.includes("bara bra")) {
      reply = "Vad roligt att höra! Vad vill du beställa eller fråga om idag?";
      hint = request.suggestedPhrases?.[0] || "Berätta vad du önskar.";
    } else if (
      userText.includes("kaffe") ||
      userText.includes("fika") ||
      userText.includes("bulle") ||
      userText.includes("te")
    ) {
      reply = "Absolut! Vill du ha något mer till det?";
      hint = 'Svara: "Nej tack, det är bra så. Vad kostar det?"';
    } else if (
      userText.includes("kostar") ||
      userText.includes("kronor") ||
      userText.includes("kr") ||
      userText.includes("betala")
    ) {
      reply = "Det blir 45 kronor. Vill du betala med kort eller kontant?";
      hint = 'Svara: "Med kort, tack."';
    } else if (userText.includes("heter") || userText.includes("jag är")) {
      reply = `Trevligt att träffas! Var kommer du ifrån?`;
      hint =
        'Berätta vilket land eller ort du kommer från ("Jag kommer från...").';
    } else if (userText.includes("kommer från")) {
      reply = "Spännande! Jag bor här i Sverige. Var bor du?";
      hint = 'Berätta var du bor ("Jag bor i...").';
    } else if (userText.includes("bor i") || userText.includes("bor på")) {
      reply =
        "Härligt! Det var mycket trevligt att samtala med dig. Ha en fin dag!";
      goalAccomplished = true;
      hint = 'Avsluta gärna med "Tack, detsamma! Hej då!"';
    } else if (
      userText.includes("kort") ||
      userText.includes("kontant") ||
      userText.includes("tack") ||
      userText.includes("hej då")
    ) {
      reply = "Tack så mycket och välkommen åter! Ha en trevlig dag!";
      goalAccomplished = true;
      hint = 'Avsluta gärna med "Tack, detsamma! Hej då!"';
    } else if (isTurnLimitReached) {
      reply = "Tack för ett bra samtal! Vi har nått målet för denna dialog.";
      goalAccomplished = true;
      hint = "Klicka på Slutför för att gå vidare.";
    } else {
      reply = `Tack för ditt svar! Kan du berätta lite mer på enkel svenska?`;
      hint =
        request.suggestedPhrases && request.suggestedPhrases.length > 0
          ? request.suggestedPhrases[0]
          : "Använd enkla fraser från uppdraget.";
    }

    const matchedPhrases = (request.suggestedPhrases || []).filter((p) =>
      userText.includes(p.toLowerCase()),
    );

    const feedback =
      goalAccomplished || isTurnLimitReached || request.generateFeedback
        ? {
            strengths:
              "Du höll igång samtalet och svarade på enkel och tydlig svenska.",
            correction:
              'Tänk på ordföljd och att använda artiga fraser som "tack".',
            improvedExample: request.suggestedPhrases?.[0] || "En kaffe, tack!",
            usedTargetPhrases: matchedPhrases,
          }
        : undefined;

    return {
      aiReply: reply,
      goalAccomplished,
      hintForNextTurn: hint,
      feedback,
      turnsCount: currentTurnCount,
      maxTurns: configuredMax,
      isDemo: true,
    };
  }

  /**
   * Diagnostic helper to test Gemini API key, endpoint access, models, quota and latency.
   */
  async diagnoseRoleplay(): Promise<{
    status: "success" | "error";
    rootCause: string;
    keyValid: boolean;
    quotaOk: boolean;
    workingModel: string | null;
    testedModels: string[];
    availableModels: string[];
    totalDurationMs: number;
    steps?: Record<string, any>;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        status: "error",
        rootCause: "Supabase är inte konfigurerat i klientmiljön.",
        keyValid: false,
        quotaOk: false,
        workingModel: null,
        testedModels: [],
        availableModels: [],
        totalDurationMs: 0,
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke("ai-roleplay", {
        body: { action: "diagnose" },
      });

      if (error) {
        let serverErrorMsg = error.message;
        try {
          const ctx = (error as any).context;
          if (ctx) {
            const body = await ctx.json();
            if (body?.error) serverErrorMsg = body.error;
            if (body?.rootCause) return body;
          }
        } catch {}

        return {
          status: "error",
          rootCause: `Diagnostikanropet misslyckades: ${serverErrorMsg}`,
          keyValid: false,
          quotaOk: false,
          workingModel: null,
          testedModels: [],
          availableModels: [],
          totalDurationMs: 0,
        };
      }

      return data;
    } catch (err: any) {
      return {
        status: "error",
        rootCause: `Klientfel vid diagnostik: ${err?.message}`,
        keyValid: false,
        quotaOk: false,
        workingModel: null,
        testedModels: [],
        availableModels: [],
        totalDurationMs: 0,
      };
    }
  }
}

export const aiService = new AiService();
