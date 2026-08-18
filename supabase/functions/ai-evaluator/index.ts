import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Enforce Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Obehörig: Giltig autentiseringstoken saknas.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Obehörig: Token är tom.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Server-side Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Serverkonfigurationsfel.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // 3. Verify user JWT token on server
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Obehörig: Ogiltig eller utgången session.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifiedUserId = user.id;

    // 4. Validate payload schema & size
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Felaktigt JSON-format i förfrågan.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { missionId, missionTitle, userText, promptGoal, targetTopics, expectedLevel } = body || {};

    if (!missionId || typeof missionId !== 'string' || !userText || typeof userText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Saknade obligatoriska fält (missionId, userText).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Payload size guard: max 500 characters for A1 language free-text
    const trimmedUserText = userText.trim();
    if (trimmedUserText.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Texten överskrider tillåten maxlängd (500 tecken).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Verify mission exists and is published (or user is admin)
    const { data: mission, error: missionError } = await supabaseUserClient
      .from('missions')
      .select('id, title, is_published')
      .eq('id', missionId)
      .maybeSingle();

    if (missionError || !mission) {
      return new Response(
        JSON.stringify({ error: 'Uppdraget kunde inte hittas.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check publication status
    if (!mission.is_published) {
      const { data: roleData } = await supabaseUserClient
        .from('user_roles')
        .select('role')
        .eq('user_id', verifiedUserId)
        .maybeSingle();

      if (roleData?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Uppdraget är inte publicerat.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 6. Pedagogical evaluation via Gemini (with fallback)
    if (geminiApiKey) {
      try {
        const prompt = `Du är en uppmuntrande och professionell SFI-lärare (Svenska för invandrare på A1-nivå).
Uppdrag: "${missionTitle || mission.title}"
Mål för övningen: "${promptGoal || 'Formulera en begriplig mening på svenska'}"
Fokusämnen/ord: ${Array.isArray(targetTopics) ? targetTopics.join(', ') : 'Vardagssvenska'}
Elevens svar: "${trimmedUserText}"

Utvärdera elevens svar pedagogiskt. Svara ENBART med ett giltigt JSON-objekt i följande format:
{
  "isAcceptable": boolean,
  "score": number (0-100),
  "pedagogicalFeedback": "Kort och stöttande förklaring på enkel svenska",
  "grammaticalTips": "Kort grammatiskt tips (eller tomt om helt korrekt)",
  "encouragement": "En varm uppmuntrande mening",
  "correctedSentence": "Rättad version om det fanns fel, annars samma mening"
}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 500,
                responseMimeType: 'application/json',
              },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return new Response(
              JSON.stringify({
                isAcceptable: Boolean(parsed.isAcceptable),
                score: Math.min(100, Math.max(0, Number(parsed.score) || 75)),
                pedagogicalFeedback: String(parsed.pedagogicalFeedback || 'Bra jobbat!'),
                grammaticalTips: parsed.grammaticalTips ? String(parsed.grammaticalTips) : '',
                encouragement: String(parsed.encouragement || 'Fortsätt så!'),
                correctedSentence: parsed.correctedSentence ? String(parsed.correctedSentence) : undefined,
                isDemo: false,
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (geminiErr) {
        console.error('Gemini evaluation error (falling back to deterministic rule):', geminiErr);
      }
    }

    // 7. Deterministic safe fallback (never leak errors or secrets)
    const lower = trimmedUserText.toLowerCase();
    const words = trimmedUserText.split(/\s+/).filter(Boolean);
    const hasVerb = /\b(heter|bor|kommer|talar|pratar|är|har|arbetar|jobbar|köper|vill|tar|äter|dricker|ska|mår)\b/i.test(lower);
    const isAcceptable = words.length >= 2 && (hasVerb || words.length >= 3);

    return new Response(
      JSON.stringify({
        isAcceptable,
        score: isAcceptable ? 85 : 50,
        pedagogicalFeedback: isAcceptable
          ? `Bra formulering på A1-nivå som passar uppdraget "${missionTitle || mission.title}".`
          : 'Bra försök! Se till att ha med ett verb (t.ex. "är", "heter", "bor") och minst två ord.',
        grammaticalTips: hasVerb ? '' : 'I svenska påståendesatser står verbet oftast på andra plats (V2-regeln).',
        encouragement: 'Fortsätt öva så bygger du upp ditt ordförråd snabbt!',
        isDemo: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Ett oväntat fel inträffade vid bedömningen.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
