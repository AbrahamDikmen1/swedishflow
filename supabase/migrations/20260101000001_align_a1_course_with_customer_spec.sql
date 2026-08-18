-- ============================================================================
-- SWEDISHFLOW MIGRATION 20260101000001
-- Align A1 course missions, lesson blocks, and private grading keys with customer spec
-- ============================================================================

-- 1. UPSERT 12 A1 MISSIONS (Idempotent alignment with customer specification)
INSERT INTO public.missions (
    id,
    level_code,
    order_num,
    title,
    description,
    estimated_minutes,
    total_points,
    skills,
    goals,
    knowledge_outcomes,
    is_published
) VALUES
  (
    '1',
    'A1',
    1,
    'Hälsa och säga hej',
    'Lär dig vanliga hälsningsfraser, fråga hur någon mår och svara vänligt.',
    6,
    50,
    ARRAY['Vokabulär', 'Dialog', 'Uttal']::text[],
    ARRAY['Hälsa i olika vardagssituationer', 'Fråga "Hur mår du?" och svara "Bra, tack!"']::text[],
    ARRAY['Kan hälsa på morgonen, dagen och kvällen', 'Kan säga hej då på ett naturligt sätt']::text[],
    true
  ),
  (
    '2',
    'A1',
    2,
    'Berätta vad du heter',
    'Träna på att presentera ditt namn, stava och fråga vad andra heter.',
    6,
    50,
    ARRAY['Grammatik', 'Vokabulär', 'Meningsbyggnad']::text[],
    ARRAY['Använda verbet "heter" korrekt', 'Säga "Trevligt att träffas!"']::text[],
    ARRAY['Kan säga sitt eget namn och fråga efter andras namn', 'Förstår verbböjning i presens']::text[],
    true
  ),
  (
    '3',
    'A1',
    3,
    'Berätta var du kommer ifrån',
    'Lär dig berätta vilket land och vilken stad du kommer ifrån.',
    7,
    50,
    ARRAY['Grammatik', 'Geografi', 'Hörförståelse']::text[],
    ARRAY['Använda "kommer från"', 'Ställa frågan "Var kommer du ifrån?"']::text[],
    ARRAY['Kan berätta sitt ursprungsland', 'Känner till prepositionen "från"']::text[],
    true
  ),
  (
    '4',
    'A1',
    4,
    'Berätta var du bor',
    'Träna på att beskriva din ort, stadsdel och typ av boende.',
    7,
    50,
    ARRAY['Meningsbyggnad', 'Vokabulär', 'Skriva']::text[],
    ARRAY['Använda verbet "bor"', 'Känna till ord som lägenhet, hus och gata']::text[],
    ARRAY['Kan ange sin bostadsort och adress på enkel svenska']::text[],
    true
  ),
  (
    '5',
    'A1',
    5,
    'Berätta hur gammal du är',
    'Lär dig siffrorna 0–100, ålder och födelsedagsfraser på svenska.',
    8,
    50,
    ARRAY['Siffror', 'Grammatik', 'Uttal']::text[],
    ARRAY['Räkna och förstå tal', 'Säga "Jag är ... år gammal"']::text[],
    ARRAY['Kan uttrycka sin ålder och förstå siffror i vardagssituationer']::text[],
    true
  ),
  (
    '6',
    'A1',
    6,
    'Berätta vad du arbetar med',
    'Lär dig vanliga yrken, arbetsplatser och att berätta om dina studier.',
    8,
    50,
    ARRAY['Yrken', 'Vokabulär', 'Dialog']::text[],
    ARRAY['Använda "arbetar som" / "jobbar som"', 'Berätta om studier och yrke']::text[],
    ARRAY['Kan beskriva sin sysselsättning och ställa enkla yrkesfrågor']::text[],
    true
  ),
  (
    '7',
    'A1',
    7,
    'Berätta vilka språk du talar',
    'Träna på språknamn och att uttrycka hur bra du talar olika språk.',
    7,
    50,
    ARRAY['Språk', 'Grammatik', 'Fraser']::text[],
    ARRAY['Säga "Jag talar lite svenska"', 'Känna till språk som engelska, arabiska och spanska']::text[],
    ARRAY['Kan samtala enkelt om språkkunskaper']::text[],
    true
  ),
  (
    '8',
    'A1',
    8,
    'Berätta om din familj',
    'Lär dig familjeord som mamma, pappa, barn, syskon och husdjur.',
    8,
    50,
    ARRAY['Familj', 'Possessiva pronomen', 'Läsning']::text[],
    ARRAY['Använda min/mitt/mina', 'Beskriva sin familjesituation']::text[],
    ARRAY['Kan presentera nära familjemedlemmar och relationer']::text[],
    true
  ),
  (
    '9',
    'A1',
    9,
    'Prata om din vardag och tid',
    'Lär dig klockan, veckodagar och vanliga rutiner under dygnet.',
    9,
    50,
    ARRAY['Tid & Klockan', 'Rutiner', 'Verb']::text[],
    ARRAY['Fråga och svara vad klockan är', 'Beskriva en vanlig morgon eller kväll']::text[],
    ARRAY['Kan klockslag, veckodagar och tidsuttryck']::text[],
    true
  ),
  (
    '10',
    'A1',
    10,
    'Handla mat och andra vardagsvaror',
    'Träna på att fråga om priser, hitta varor i affären och betala i kassan.',
    8,
    50,
    ARRAY['Handla', 'Priser', 'Rollspel']::text[],
    ARRAY['Fråga "Vad kostar...?"', 'Förstå fraser i kassan som "Vill du ha kvitto?"']::text[],
    ARRAY['Klarar enkla inköp i matbutiken på svenska']::text[],
    true
  ),
  (
    '11',
    'A1',
    11,
    'Beställa på café/restaurang',
    'Lär dig beställa mat och fika, be om notan och uttrycka önskemål.',
    8,
    50,
    ARRAY['Beställa', 'Mat & Dryck', 'Höviska fraser']::text[],
    ARRAY['Säga "Kan jag få en kaffe, tack?"', 'Be om notan och fråga om ingredienser']::text[],
    ARRAY['Kan göra enkla beställningar på ett svenskt café eller matställe']::text[],
    true
  ),
  (
    '12',
    'A1',
    12,
    'Klara ett enkelt vardagssamtal – repetition av A1',
    'Slutuppdrag! Kombinera alla dina kunskaper i ett sammanhängande samtal.',
    10,
    60,
    ARRAY['Repetition', 'Samtal', 'Alla färdigheter']::text[],
    ARRAY['Genomföra ett fullständigt vardagsmöte på svenska', 'Repetera grundläggande ordföljd och fraser']::text[],
    ARRAY['Bemästrar grundläggande A1-konversationer i det svenska samhället']::text[],
    true
  )
ON CONFLICT (id) DO UPDATE SET
    level_code = EXCLUDED.level_code,
    order_num = EXCLUDED.order_num,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    estimated_minutes = EXCLUDED.estimated_minutes,
    total_points = EXCLUDED.total_points,
    skills = EXCLUDED.skills,
    goals = EXCLUDED.goals,
    knowledge_outcomes = EXCLUDED.knowledge_outcomes,
    is_published = EXCLUDED.is_published,
    updated_at = timezone('utc'::text, now());

-- 2. UPSERT LESSON BLOCKS FOR ALL 12 MISSIONS
INSERT INTO public.lesson_blocks (
    id,
    mission_id,
    order_num,
    block_type,
    skills,
    required,
    content
) VALUES
  (
    'u1_b1_intro',
    '1',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Välkommen till Uppdrag 1","introduction":"I detta uppdrag lär du dig hur man hälsar i Sverige vid olika tillfällen.","examples":[{"phrase":"Hej!"},{"phrase":"God morgon!"},{"phrase":"Hur mår du?"},{"phrase":"Bra, tack!"}],"grammaticalNote":"\"Hej\" kan användas till alla – både vänner, kollegor och i butiker."}'::jsonb
  ),
  (
    'u1_b2_dialogue',
    '1',
    2,
    'dialogue',
    ARRAY['listening', 'reading']::text[],
    true,
    '{"title":"Morgonhälsning vid bussen","scenario":"Sara och Peter möts vid busshållplatsen på morgonen.","lines":[{"speaker":"Sara","text":"God morgon, Peter! Hur mår du?"},{"speaker":"Peter","text":"God morgon! Jag mår bara bra, tack. Hur mår du själv?"},{"speaker":"Sara","text":"Tack, jag mår också bra!"},{"speaker":"Peter","text":"Härligt! Ha en bra dag!"},{"speaker":"Sara","text":"Tack, detsamma! Hej då!"}]}'::jsonb
  ),
  (
    'u1_b3_vocab',
    '1',
    3,
    'vocabulary',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Viktiga hälsningsfraser","phrases":[{"phrase":"Hej!","explanation":"Den vanligaste hälsningen, fungerar alltid."},{"phrase":"God morgon!","explanation":"Används på morgonen fram till lunch."},{"phrase":"God kväll!","explanation":"Hälsning under kvällstid."},{"phrase":"Hur mår du?","explanation":"Fråga om någons mående."},{"phrase":"Bra, tack!","explanation":"Standardartat positivt svar."},{"phrase":"Hej då!","explanation":"När du lämnar någon."}],"infoBox":"Svenskar hälsar ofta med ett leende och säger gärna \"Hej hej!\"."}'::jsonb
  ),
  (
    'u1_b4_mc1',
    '1',
    4,
    'multiple_choice',
    ARRAY['vocabulary']::text[],
    true,
    '{"exercise":{"question":"Vad säger du på morgonen när du träffar en kollega?","options":["God morgon!","God natt!","Hej då!"],"correctIndex":0,"explanationCorrect":"Rätt! \"God morgon!\" används under förmiddagen.","explanationIncorrect":"Tänk på vilken tid på dygnet det är."}}'::jsonb
  ),
  (
    'u1_b5_listen',
    '1',
    5,
    'listen_choice',
    ARRAY['listening']::text[],
    true,
    '{"exercise":{"prompt":"Lyssna och välj vad personen svarar på frågan \"Hur mår du?\":","audioPlaceholderText":"Bra, tack! Hur mår du själv?","options":["Bra, tack!","Jag heter Sara.","Jag bor i Malmö."],"correctIndex":0,"explanationCorrect":"Helt rätt! Personen svarar på frågan om sitt mående.","explanationIncorrect":"Lyssna igen – vad passar som svar på \"Hur mår du?\"?"}}'::jsonb
  ),
  (
    'u1_b6_matching',
    '1',
    6,
    'matching',
    ARRAY['reading']::text[],
    true,
    '{"exercise":{"instruction":"Matcha hälsningen med rätt svar:","pairs":[{"id":"p1","question":"Hur mår du?","answer":"Bra, tack!"},{"id":"p2","question":"Ha en bra dag!","answer":"Tack, detsamma!"},{"id":"p3","question":"Hej då!","answer":"Vi ses!"}],"explanationCorrect":"Snyggt! Alla par matchar perfekt."}}'::jsonb
  ),
  (
    'u1_b7_speak',
    '1',
    7,
    'speak',
    ARRAY['speaking']::text[],
    true,
    '{"exercise":{"instruction":"Träna på att säga hälsningsfrasen med gott uttal:","targetPhrase":"God morgon! Hur mår du?","translation":"Good morning! How are you?","phoneticHint":"Goo mårr-on! Hoor morr doo?","tips":"Betona \"morgon\" och håll ett mjukt \"o\"-ljud i \"God\"."}}'::jsonb
  ),
  (
    'u1_b8_summary',
    '1',
    8,
    'summary',
    ARRAY['reading', 'writing']::text[],
    true,
    '{"title":"Uppdrag 1 slutfört!","subtitle":"Du har bemästrat de grundläggande hälsningsfraserna i Sverige.","summaryPhrases":["Hälsa med \"Hej!\" och \"God morgon!\"","Fråga \"Hur mår du?\" och svara \"Bra, tack!\"","Avsluta med \"Hej då!\" och \"Vi ses!\""],"expectedOutcomes":["Kan hälsa artigt i vardagen","Kan svara på enkla artighetsfrågor"],"nextMissionId":"2","nextMissionTitle":"Berätta vad du heter"}'::jsonb
  ),
  (
    'u2_b1_intro',
    '2',
    1,
    'introduction',
    ARRAY['vocabulary', 'grammar']::text[],
    true,
    '{"title":"Presentera ditt namn","introduction":"Här tränar du på att säga vad du heter och fråga andra vad de heter.","examples":[{"phrase":"Jag heter Anna."},{"phrase":"Vad heter du?"},{"phrase":"Trevligt att träffas!"}],"grammaticalNote":"Verbet \"heter\" har samma form för alla personer: jag heter, du heter, han/hon heter."}'::jsonb
  ),
  (
    'u2_b2_dialogue',
    '2',
    2,
    'dialogue',
    ARRAY['listening', 'reading']::text[],
    true,
    '{"title":"Första mötet","scenario":"Erik och Elena träffas på en språkkurs.","lines":[{"speaker":"Erik","text":"Hej! Vad heter du?"},{"speaker":"Elena","text":"Hej! Jag heter Elena. Vad heter du?"},{"speaker":"Erik","text":"Jag heter Erik. Trevligt att träffas, Elena!"},{"speaker":"Elena","text":"Trevligt att träffas!"}]}'::jsonb
  ),
  (
    'u2_b3_sentence',
    '2',
    3,
    'sentence_builder',
    ARRAY['grammar', 'writing']::text[],
    true,
    '{"exercise":{"instruction":"Bygg meningen: \"Jag heter Elena.\"","initialWords":["Elena.","heter","Jag","du"],"correctSentence":"Jag heter Elena.","explanationCorrect":"Helt rätt! \"Jag heter Elena.\"","explanationIncorrect":"Ordföljden i påståendesats: Subjekt (Jag) + Verb (heter) + Namn."}}'::jsonb
  ),
  (
    'u2_b4_fill',
    '2',
    4,
    'fill_blank',
    ARRAY['grammar']::text[],
    true,
    '{"exercise":{"sentence":"Vad _____ du?","options":["heter","bor","kommer"],"correctAnswer":"heter","explanationCorrect":"Rätt! Frågan lyder \"Vad heter du?\".","explanationIncorrect":"Vi använder verbet \"heter\" när vi frågar om namn."}}'::jsonb
  ),
  (
    'u2_b5_roleplay',
    '2',
    5,
    'ai_roleplay',
    ARRAY['speaking', 'writing']::text[],
    true,
    '{"exercise":{"scenario":"Du möter Johan på svenskundervisningen.","characterName":"Johan","characterRole":"Kurskamrat","initialMessage":"Hej! Jag heter Johan. Vad heter du?","goalDescription":"Presentera ditt namn och hälsa tillbaka.","allowedTopics":["namn","hälsning","presentation"],"suggestedPhrases":["Hej Johan! Jag heter...","Trevligt att träffas!"]}}'::jsonb
  ),
  (
    'u2_b6_summary',
    '2',
    6,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 2 klart!","subtitle":"Nu kan du presentera dig själv och fråga vad någon heter.","summaryPhrases":["Använda \"Jag heter...\"","Fråga \"Vad heter du?\"","Säga \"Trevligt att träffas!\""],"expectedOutcomes":["Kan uppge sitt fullständiga namn","Kan ta emot andras namn och bekräfta"],"nextMissionId":"3","nextMissionTitle":"Berätta var du kommer ifrån"}'::jsonb
  ),
  (
    'u3_b1_intro',
    '3',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Länder och ursprung","introduction":"Lär dig berätta vilket land du kommer ifrån och fråga andra om deras hemland.","examples":[{"phrase":"Jag kommer från Sverige."},{"phrase":"Jag kommer från Syrien."},{"phrase":"Var kommer du ifrån?"}],"grammaticalNote":"Prepositionen \"från\" anger ursprung."}'::jsonb
  ),
  (
    'u3_b2_vocab',
    '3',
    2,
    'vocabulary',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Länder och fraser","phrases":[{"phrase":"Jag kommer från...","explanation":"Anger hemland eller hemstad."},{"phrase":"Var kommer du ifrån?","explanation":"Fråga om någons ursprung."},{"phrase":"Sverige","explanation":"Landet du studerar i."},{"phrase":"Norge / Finland / Danmark","explanation":"Nordiska grannländer."}],"infoBox":"I talspråk säger man ofta \"Var kommer du ifrån?\" med betoning på \"ifrån\"."}'::jsonb
  ),
  (
    'u3_b3_mc',
    '3',
    3,
    'multiple_choice',
    ARRAY['reading']::text[],
    true,
    '{"exercise":{"question":"Hur svarar du på frågan \"Var kommer du ifrån?\"","options":["Jag kommer från Italien.","Jag heter Italien.","Jag bor från Italien."],"correctIndex":0,"explanationCorrect":"Rätt! \"Jag kommer från [land].\"","explanationIncorrect":"Använd verbet \"kommer\" ihop med prepositionen \"från\"."}}'::jsonb
  ),
  (
    'u3_b4_free',
    '3',
    4,
    'free_text',
    ARRAY['writing']::text[],
    true,
    '{"exercise":{"instruction":"Skriv en mening om var du kommer ifrån (t.ex. \"Jag kommer från Spanien.\"):","prompt":"Var kommer du ifrån?","placeholder":"Jag kommer från...","regexPattern":"^jag\\s+kommer\\s+från\\s+[a-zåäö\\s]+","explanationCorrect":"Utmärkt! En korrekt svensk mening om ditt ursprung.","explanationIncorrect":"Börja med \"Jag kommer från...\" och skriv ditt land.","explanationEmpty":"Skriv en hel mening.","explanationIncomplete":"Glöm inte ordet \"från\"!"}}'::jsonb
  ),
  (
    'u3_b5_summary',
    '3',
    5,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 3 slutfört!","subtitle":"Du kan nu samtala om länder och ursprung.","summaryPhrases":["Uttrycket \"Jag kommer från...\"","Frågan \"Var kommer du ifrån?\""],"expectedOutcomes":["Kan berätta om sitt ursprung på svenska"],"nextMissionId":"4","nextMissionTitle":"Berätta var du bor"}'::jsonb
  ),
  (
    'u4_b1_intro',
    '4',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Bostad och ort","introduction":"I det här uppdraget lär du dig berätta om staden och boendet du har i Sverige.","examples":[{"phrase":"Jag bor i Stockholm."},{"phrase":"Jag bor i en lägenhet."},{"phrase":"Var bor du?"}],"grammaticalNote":"Prepositionen \"i\" används framför städer, länder och lägenheter: \"i Göteborg\", \"i en lägenhet\"."}'::jsonb
  ),
  (
    'u4_b2_dialogue',
    '4',
    2,
    'dialogue',
    ARRAY['reading', 'listening']::text[],
    true,
    '{"title":"Samtal om boende","scenario":"Maria och Ali pratar om var de bor.","lines":[{"speaker":"Ali","text":"Var bor du i Sverige, Maria?"},{"speaker":"Maria","text":"Jag bor i Uppsala. Och du?"},{"speaker":"Ali","text":"Jag bor i Stockholm, i en lägenhet nära centrum."},{"speaker":"Maria","text":"Vad trevligt!"}]}'::jsonb
  ),
  (
    'u4_b3_fill',
    '4',
    3,
    'fill_blank',
    ARRAY['grammar']::text[],
    true,
    '{"exercise":{"sentence":"Jag _____ i Malmö.","options":["bor","heter","talar"],"correctAnswer":"bor","explanationCorrect":"Rätt! \"Jag bor i Malmö.\"","explanationIncorrect":"Verbet \"bor\" används för bostadsort."}}'::jsonb
  ),
  (
    'u4_b4_speak',
    '4',
    4,
    'speak',
    ARRAY['speaking']::text[],
    true,
    '{"exercise":{"instruction":"Säg meningen högt:","targetPhrase":"Jag bor i en lägenhet i Stockholm.","translation":"I live in an apartment in Stockholm.","phoneticHint":"Jag boor i en läg-en-heet i Ståkk-hålm.","tips":"Tänk på att uttala \"lägenhet\" med betoning på första stavelsen."}}'::jsonb
  ),
  (
    'u4_b5_summary',
    '4',
    5,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 4 slutfört!","subtitle":"Bra jobbat! Du kan nu berätta var och hur du bor.","summaryPhrases":["Använda \"Jag bor i...\"","Känna till ord som lägenhet, hus och centrum"],"expectedOutcomes":["Kan ange adress och bostadsort"],"nextMissionId":"5","nextMissionTitle":"Berätta hur gammal du är"}'::jsonb
  ),
  (
    'u5_b1_intro',
    '5',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Siffror och ålder","introduction":"Här lär du dig siffrorna och hur du berättar din ålder på svenska.","examples":[{"phrase":"Jag är 25 år gammal."},{"phrase":"Hur gammal är du?"},{"phrase":"ett, två, tre, fyra, fem..."}],"grammaticalNote":"På svenska säger man \"Jag är ... år\" (med verbet \"är\", inte \"har\")."}'::jsonb
  ),
  (
    'u5_b2_vocab',
    '5',
    2,
    'vocabulary',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Siffrorna 10–50","phrases":[{"phrase":"tio, tjugo, trettio","explanation":"10, 20, 30"},{"phrase":"fyrtio, femtio","explanation":"40, 50"},{"phrase":"Hur gammal är du?","explanation":"Fråga om ålder."},{"phrase":"Jag är ... år.","explanation":"Svar på åldersfrågan."}],"infoBox":"I talspråk uttalas ofta \"tjugo\" som \"tjuve\" och \"trettio\" som \"tretti\"."}'::jsonb
  ),
  (
    'u5_b3_mc',
    '5',
    3,
    'multiple_choice',
    ARRAY['grammar']::text[],
    true,
    '{"exercise":{"question":"Vilken mening är korrekt på svenska?","options":["Jag är 30 år gammal.","Jag har 30 år.","Jag heter 30 år."],"correctIndex":0,"explanationCorrect":"Rätt! På svenska använder vi \"är\" för ålder.","explanationIncorrect":"Kom ihåg att verbet är \"är\", inte \"har\"."}}'::jsonb
  ),
  (
    'u5_b4_summary',
    '5',
    4,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 5 slutfört!","subtitle":"Du kan nu siffror och att berätta din ålder.","summaryPhrases":["Siffror och räkna på svenska","Uttrycka \"Jag är ... år\""],"expectedOutcomes":["Kan ange sin ålder och förstå tal i vardagliga sammanhang"],"nextMissionId":"6","nextMissionTitle":"Berätta vad du arbetar med"}'::jsonb
  ),
  (
    'u6_b1_intro',
    '6',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Yrken och arbete","introduction":"Lär dig berätta om ditt jobb, studier och vanliga yrkestitlar i Sverige.","examples":[{"phrase":"Jag arbetar som lärare."},{"phrase":"Jag jobbar på sjukhus."},{"phrase":"Jag studerar svenska."}],"grammaticalNote":"Man säger \"Jag jobbar som [yrke]\" eller \"Jag är [yrke]\". Ingen artikel behövs framför yrket på svenska (inte \"en lärare\")."}'::jsonb
  ),
  (
    'u6_b2_vocab',
    '6',
    2,
    'vocabulary',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Vanliga yrken","phrases":[{"phrase":"läkare / sjuksköterska","explanation":"Arbetar inom vården."},{"phrase":"lärare","explanation":"Undervisar i skola."},{"phrase":"ingenjör / programmerare","explanation":"Tekniska yrken."},{"phrase":"busschaufför","explanation":"Kör kollektivtrafik."},{"phrase":"Jag studerar / pluggar","explanation":"För elever och studenter."}],"infoBox":"Säger du \"Jag är läkare\" är det mer naturligt på svenska än \"Jag är en läkare\"."}'::jsonb
  ),
  (
    'u6_b3_sentence',
    '6',
    3,
    'sentence_builder',
    ARRAY['grammar']::text[],
    true,
    '{"exercise":{"instruction":"Bygg meningen: \"Jag jobbar som ingenjör.\"","initialWords":["ingenjör.","som","jobbar","Jag","lärare"],"correctSentence":"Jag jobbar som ingenjör.","explanationCorrect":"Rätt! \"Jag jobbar som ingenjör.\"","explanationIncorrect":"Följ strukturen: Subjekt + Verb + som + Yrke."}}'::jsonb
  ),
  (
    'u6_b4_summary',
    '6',
    4,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 6 klart!","subtitle":"Du kan nu prata om arbete och yrken.","summaryPhrases":["Berätta om yrke med \"jobbar som\"","Vanliga svenska yrkesord"],"expectedOutcomes":["Kan beskriva sin sysselsättning"],"nextMissionId":"7","nextMissionTitle":"Berätta vilka språk du talar"}'::jsonb
  ),
  (
    'u7_b1_intro',
    '7',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Språk och kunskaper","introduction":"Träna på att berätta vilka språk du talar och hur bra du förstår.","examples":[{"phrase":"Jag talar svenska och engelska."},{"phrase":"Jag pratar lite svenska."},{"phrase":"Talar du engelska?"}],"grammaticalNote":"Både \"talar\" och \"pratar\" betyder samma sak i vardagligt tal."}'::jsonb
  ),
  (
    'u7_b2_mc',
    '7',
    2,
    'multiple_choice',
    ARRAY['vocabulary']::text[],
    true,
    '{"exercise":{"question":"Hur säger du att du pratar en liten mängd svenska?","options":["Jag talar lite svenska.","Jag talar mycket svenska.","Jag talar inte svenska."],"correctIndex":0,"explanationCorrect":"Rätt! \"lite svenska\" betyder en begränsad mängd.","explanationIncorrect":"\"lite\" betyder en mindre mängd."}}'::jsonb
  ),
  (
    'u7_b3_speak',
    '7',
    3,
    'speak',
    ARRAY['speaking']::text[],
    true,
    '{"exercise":{"instruction":"Säg följande mening högt:","targetPhrase":"Jag pratar lite svenska och bra engelska.","translation":"I speak a little Swedish and good English.","phoneticHint":"Jag praa-tar lee-te svän-ska ock braa äng-el-ska."}}'::jsonb
  ),
  (
    'u7_b4_summary',
    '7',
    4,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 7 klart!","subtitle":"Du kan nu beskriva dina språkkunskaper.","summaryPhrases":["Språknamn på svenska","Uttrycken \"lite\" och \"flytande\""],"expectedOutcomes":["Kan förklara vilka språk man behärskar"],"nextMissionId":"8","nextMissionTitle":"Berätta om din familj"}'::jsonb
  ),
  (
    'u8_b1_intro',
    '8',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Familj och relationer","introduction":"Här lär du dig ord för familjemedlemmar och släktingar.","examples":[{"phrase":"Det här är min man / min fru."},{"phrase":"Jag har två barn."},{"phrase":"Min bror och min syster."}],"grammaticalNote":"Possessiva pronomen: \"min\" framför en-ord (min bror), \"mitt\" framför ett-ord (mitt barn), \"mina\" framför plural (mina barn)."}'::jsonb
  ),
  (
    'u8_b2_matching',
    '8',
    2,
    'matching',
    ARRAY['vocabulary']::text[],
    true,
    '{"exercise":{"instruction":"Matcha familjeorden:","pairs":[{"id":"f1","question":"Mamma och pappa","answer":"Föräldrar"},{"id":"f2","question":"Bror och syster","answer":"Syskon"},{"id":"f3","question":"Son och dotter","answer":"Barn"}],"explanationCorrect":"Bra matchat! Alla familjebegrepp stämmer."}}'::jsonb
  ),
  (
    'u8_b3_summary',
    '8',
    3,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 8 klart!","subtitle":"Nu kan du presentera och beskriva din familj.","summaryPhrases":["Ord för familjemedlemmar","Användning av min, mitt, mina"],"expectedOutcomes":["Kan berätta om sin familjesituation"],"nextMissionId":"9","nextMissionTitle":"Prata om din vardag och tid"}'::jsonb
  ),
  (
    'u9_b1_intro',
    '9',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Klockan och dagliga rutiner","introduction":"Lär dig säga vad klockan är och vad du gör under en vanlig dag.","examples":[{"phrase":"Vad är klockan? – Den är sju."},{"phrase":"Jag vaknar klockan sju på morgonen."},{"phrase":"Jag äter frukost och åker till jobbet."}],"grammaticalNote":"Tidsuttryck kan stå först i meningen: \"Klockan sju äter jag frukost.\" (Verbet står fortfarande på plats 2!)."}'::jsonb
  ),
  (
    'u9_b2_mc',
    '9',
    2,
    'multiple_choice',
    ARRAY['reading']::text[],
    true,
    '{"exercise":{"question":"Vad betyder \"Klockan är halv åtta\"?","options":["07:30","08:30","08:00"],"correctIndex":0,"explanationCorrect":"Rätt! På svenska betyder \"halv åtta\" 30 minuter FÖRE åtta (07:30).","explanationIncorrect":"Observera: På svenska betyder \"halv åtta\" en halvtimme innan åtta."}}'::jsonb
  ),
  (
    'u9_b3_summary',
    '9',
    3,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 9 klart!","subtitle":"Du behärskar nu klockan och vardagliga tidsuttryck.","summaryPhrases":["Fråga och förstå klockan","Beskriva dagliga rutiner"],"expectedOutcomes":["Kan avtala tidpunkter och beskriva sin dag"],"nextMissionId":"10","nextMissionTitle":"Handla mat och andra vardagsvaror"}'::jsonb
  ),
  (
    'u10_b1_intro',
    '10',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"I mataffären","introduction":"Lär dig handla mat, fråga efter varor och förstå kassapersonalen.","examples":[{"phrase":"Var finns mjölken?"},{"phrase":"Vad kostar äpplena?"},{"phrase":"Vill du ha kvittot? – Ja, tack / Nej, det är bra."}],"grammaticalNote":"Vanlig artighetsfras i kassan: \"Vill du ha kvitto?\" – \"Nej tack, det är bra så.\""}'::jsonb
  ),
  (
    'u10_b2_dialogue',
    '10',
    2,
    'dialogue',
    ARRAY['listening', 'reading']::text[],
    true,
    '{"title":"I kassan på ICA","scenario":"Kunden betalar sina varor i matbutiken.","lines":[{"speaker":"Kassör","text":"Hej! Det blir 145 kronor, tack."},{"speaker":"Kund","text":"Hej! Kan jag betala med kort?"},{"speaker":"Kassör","text":"Ja, sätt i kortet där. Vill du ha kvittot?"},{"speaker":"Kund","text":"Ja, tack gärna!"},{"speaker":"Kassör","text":"Tack och ha en fin dag!"}]}'::jsonb
  ),
  (
    'u10_b3_fill',
    '10',
    3,
    'fill_blank',
    ARRAY['vocabulary']::text[],
    true,
    '{"exercise":{"sentence":"Vad _____ den här osten?","options":["kostar","bor","heter"],"correctAnswer":"kostar","explanationCorrect":"Rätt! \"Vad kostar...?\" frågar om priset.","explanationIncorrect":"Använd verbet \"kostar\" för priser."}}'::jsonb
  ),
  (
    'u10_b4_summary',
    '10',
    4,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 10 klart!","subtitle":"Nu kan du handla mat på svenska!","summaryPhrases":["Fråga om priser och varor","Fraser vid betalning och i kassan"],"expectedOutcomes":["Kan genomföra vanliga matinköp självständigt"],"nextMissionId":"11","nextMissionTitle":"Beställa på café/restaurang"}'::jsonb
  ),
  (
    'u11_b1_intro',
    '11',
    1,
    'introduction',
    ARRAY['vocabulary']::text[],
    true,
    '{"title":"Fika och beställa","introduction":"Att fika är en svensk tradition! Här lär du dig beställa kaffe, kanelbulle och mat.","examples":[{"phrase":"Kan jag få en kopp kaffe och en kanelbulle, tack?"},{"phrase":"Vill du ha något mer?"},{"phrase":"Kan vi få notan, tack?"}],"grammaticalNote":"Formen \"Kan jag få...\" är den vanligaste och artigaste formen för att beställa på svenska."}'::jsonb
  ),
  (
    'u11_b2_dialogue',
    '11',
    2,
    'dialogue',
    ARRAY['listening', 'reading']::text[],
    true,
    '{"title":"Fika på stan","scenario":"David beställer på ett café.","lines":[{"speaker":"Barista","text":"Hej! Vad vill du ha?"},{"speaker":"David","text":"Hej! Kan jag få en kaffe och en kardemummabulle, tack?"},{"speaker":"Barista","text":"Absolut! Vill du ha mjölk i kaffet?"},{"speaker":"David","text":"Ja, lite havremjölk tack."},{"speaker":"Barista","text":"Det blir 65 kronor."}]}'::jsonb
  ),
  (
    'u11_b3_roleplay',
    '11',
    3,
    'ai_roleplay',
    ARRAY['speaking', 'writing']::text[],
    true,
    '{"exercise":{"scenario":"Du är på Café Kaffebönan och ska beställa fika.","characterName":"Emma","characterRole":"Cafébiträde","initialMessage":"Välkommen till Kaffebönan! Vad får det lov att vara idag?","goalDescription":"Beställ en dryck och något gott att äta på svenska.","allowedTopics":["kaffe","te","kanelbulle","smörgås","beställning"],"suggestedPhrases":["Kan jag få en kaffe, tack?","Jag vill ha en kanelbulle."]}}'::jsonb
  ),
  (
    'u11_b4_summary',
    '11',
    4,
    'summary',
    ARRAY['reading']::text[],
    true,
    '{"title":"Uppdrag 11 klart!","subtitle":"Nu är du redo att fika och äta ute i Sverige!","summaryPhrases":["Beställa med \"Kan jag få...\"","Svenska caféfraser och fikaord"],"expectedOutcomes":["Kan beställa på restaurang och café utan problem"],"nextMissionId":"12","nextMissionTitle":"Klara ett enkelt vardagssamtal – repetition av A1"}'::jsonb
  ),
  (
    'u12_b1_intro',
    '12',
    1,
    'introduction',
    ARRAY['vocabulary', 'grammar']::text[],
    true,
    '{"title":"Stora A1-repetitionen","introduction":"Grattis till sista uppdraget på A1! Här knyter vi ihop presentation, boende, yrke, tid och beställning i ett och samma uppdrag.","examples":[{"phrase":"Hej, vad heter du och var bor du?"},{"phrase":"Jag jobbar som lärare och talar två språk."},{"phrase":"Ska vi ta en fika klockan tre?"}],"grammaticalNote":"Kom ihåg de två gyllene reglerna: Verbet på plats 2 i påståenden och verbet först i ja/nej-frågor."}'::jsonb
  ),
  (
    'u12_b2_matching',
    '12',
    2,
    'matching',
    ARRAY['reading']::text[],
    true,
    '{"exercise":{"instruction":"Matcha hela A1-frågor med rätt svar:","pairs":[{"id":"a1_1","question":"Vad heter du?","answer":"Jag heter Alex."},{"id":"a1_2","question":"Var bor du?","answer":"Jag bor i Göteborg."},{"id":"a1_3","question":"Vad jobbar du med?","answer":"Jag är busschaufför."},{"id":"a1_4","question":"Hur gammal är du?","answer":"Jag är 28 år."}],"explanationCorrect":"Perfekt repetition! Alla frågor och svar är rätt kopplade."}}'::jsonb
  ),
  (
    'u12_b3_roleplay',
    '12',
    3,
    'ai_roleplay',
    ARRAY['speaking', 'writing']::text[],
    true,
    '{"exercise":{"scenario":"Ett fullständigt möte med en ny vän i parken.","characterName":"Sofia","characterRole":"Ny vän i Sverige","initialMessage":"Hej! Fint väder idag. Får jag slå mig ner? Vad heter du?","goalDescription":"Berätta ditt namn, var du bor eller kommer ifrån, och prata lite vardag.","allowedTopics":["namn","boende","ursprung","yrke","fika","väder"],"suggestedPhrases":["Hej! Ja självklart. Jag heter...","Jag bor här i stan."]}}'::jsonb
  ),
  (
    'u12_b4_summary',
    '12',
    4,
    'summary',
    ARRAY['reading', 'writing', 'speaking']::text[],
    true,
    '{"title":"🎉 Grattis! Hela A1-kursen är slutförd!","subtitle":"Du har klarat samtliga 12 uppdrag i SwedishFlow A1.","summaryPhrases":["Hälsa och presentera namn, ålder och familj","Berätta om hemland, bostadsort, yrke och språk","Klara klockan, handling i matbutik och fika på café","Föra ett enkelt men komplett vardagssamtal på svenska"],"expectedOutcomes":["Fullständig grundläggande kommunikation på CEFR A1-nivå","Trygghet i att använda svenska i vardagliga situationer"]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
    mission_id = EXCLUDED.mission_id,
    order_num = EXCLUDED.order_num,
    block_type = EXCLUDED.block_type,
    skills = EXCLUDED.skills,
    required = EXCLUDED.required,
    content = EXCLUDED.content,
    updated_at = timezone('utc'::text, now());

-- 3. UPSERT PRIVATE LESSON BLOCK GRADING KEYS
INSERT INTO public.lesson_block_grading_keys (
    block_id,
    mission_id,
    block_type,
    correct_answer
) VALUES
  (
    'u1_b4_mc1',
    '1',
    'multiple_choice',
    '{"correctIndex":0,"correctOption":"God morgon!","explanationCorrect":"Rätt! \"God morgon!\" används under förmiddagen.","explanationIncorrect":"Tänk på vilken tid på dygnet det är."}'::jsonb
  ),
  (
    'u1_b5_listen',
    '1',
    'listen_choice',
    '{"correctIndex":0,"correctOption":"Bra, tack!","explanationCorrect":"Helt rätt! Personen svarar på frågan om sitt mående.","explanationIncorrect":"Lyssna igen – vad passar som svar på \"Hur mår du?\"?"}'::jsonb
  ),
  (
    'u1_b6_matching',
    '1',
    'matching',
    '{"pairs":{"p1":"Bra, tack!","p2":"Tack, detsamma!","p3":"Vi ses!"},"explanationCorrect":"Snyggt! Alla par matchar perfekt."}'::jsonb
  ),
  (
    'u1_b7_speak',
    '1',
    'speak',
    '{"targetPhrase":"God morgon! Hur mår du?"}'::jsonb
  ),
  (
    'u2_b3_sentence',
    '2',
    'sentence_builder',
    '{"correctSentence":"Jag heter Elena.","initialWords":["Elena.","heter","Jag","du"],"explanationCorrect":"Helt rätt! \"Jag heter Elena.\"","explanationIncorrect":"Ordföljden i påståendesats: Subjekt (Jag) + Verb (heter) + Namn."}'::jsonb
  ),
  (
    'u2_b4_fill',
    '2',
    'fill_blank',
    '{"correctAnswer":"heter","explanationCorrect":"Rätt! Frågan lyder \"Vad heter du?\".","explanationIncorrect":"Vi använder verbet \"heter\" när vi frågar om namn."}'::jsonb
  ),
  (
    'u2_b5_roleplay',
    '2',
    'ai_roleplay',
    '{"goalDescription":"Presentera ditt namn och hälsa tillbaka.","characterName":"Johan"}'::jsonb
  ),
  (
    'u3_b3_mc',
    '3',
    'multiple_choice',
    '{"correctIndex":0,"correctOption":"Jag kommer från Italien.","explanationCorrect":"Rätt! \"Jag kommer från [land].\"","explanationIncorrect":"Använd verbet \"kommer\" ihop med prepositionen \"från\"."}'::jsonb
  ),
  (
    'u3_b4_free',
    '3',
    'free_text',
    '{"regexPattern":"^jag\\s+kommer\\s+från\\s+[a-zåäö\\s]+","explanationCorrect":"Utmärkt! En korrekt svensk mening om ditt ursprung.","explanationIncorrect":"Börja med \"Jag kommer från...\" och skriv ditt land.","aiFeedbackPrompt":""}'::jsonb
  ),
  (
    'u4_b3_fill',
    '4',
    'fill_blank',
    '{"correctAnswer":"bor","explanationCorrect":"Rätt! \"Jag bor i Malmö.\"","explanationIncorrect":"Verbet \"bor\" används för bostadsort."}'::jsonb
  ),
  (
    'u4_b4_speak',
    '4',
    'speak',
    '{"targetPhrase":"Jag bor i en lägenhet i Stockholm."}'::jsonb
  ),
  (
    'u5_b3_mc',
    '5',
    'multiple_choice',
    '{"correctIndex":0,"correctOption":"Jag är 30 år gammal.","explanationCorrect":"Rätt! På svenska använder vi \"är\" för ålder.","explanationIncorrect":"Kom ihåg att verbet är \"är\", inte \"har\"."}'::jsonb
  ),
  (
    'u6_b3_sentence',
    '6',
    'sentence_builder',
    '{"correctSentence":"Jag jobbar som ingenjör.","initialWords":["ingenjör.","som","jobbar","Jag","lärare"],"explanationCorrect":"Rätt! \"Jag jobbar som ingenjör.\"","explanationIncorrect":"Följ strukturen: Subjekt + Verb + som + Yrke."}'::jsonb
  ),
  (
    'u7_b2_mc',
    '7',
    'multiple_choice',
    '{"correctIndex":0,"correctOption":"Jag talar lite svenska.","explanationCorrect":"Rätt! \"lite svenska\" betyder en begränsad mängd.","explanationIncorrect":"\"lite\" betyder en mindre mängd."}'::jsonb
  ),
  (
    'u7_b3_speak',
    '7',
    'speak',
    '{"targetPhrase":"Jag pratar lite svenska och bra engelska."}'::jsonb
  ),
  (
    'u8_b2_matching',
    '8',
    'matching',
    '{"pairs":{"f1":"Föräldrar","f2":"Syskon","f3":"Barn"},"explanationCorrect":"Bra matchat! Alla familjebegrepp stämmer."}'::jsonb
  ),
  (
    'u9_b2_mc',
    '9',
    'multiple_choice',
    '{"correctIndex":0,"correctOption":"07:30","explanationCorrect":"Rätt! På svenska betyder \"halv åtta\" 30 minuter FÖRE åtta (07:30).","explanationIncorrect":"Observera: På svenska betyder \"halv åtta\" en halvtimme innan åtta."}'::jsonb
  ),
  (
    'u10_b3_fill',
    '10',
    'fill_blank',
    '{"correctAnswer":"kostar","explanationCorrect":"Rätt! \"Vad kostar...?\" frågar om priset.","explanationIncorrect":"Använd verbet \"kostar\" för priser."}'::jsonb
  ),
  (
    'u11_b3_roleplay',
    '11',
    'ai_roleplay',
    '{"goalDescription":"Beställ en dryck och något gott att äta på svenska.","characterName":"Emma"}'::jsonb
  ),
  (
    'u12_b2_matching',
    '12',
    'matching',
    '{"pairs":{"a1_1":"Jag heter Alex.","a1_2":"Jag bor i Göteborg.","a1_3":"Jag är busschaufför.","a1_4":"Jag är 28 år."},"explanationCorrect":"Perfekt repetition! Alla frågor och svar är rätt kopplade."}'::jsonb
  ),
  (
    'u12_b3_roleplay',
    '12',
    'ai_roleplay',
    '{"goalDescription":"Berätta ditt namn, var du bor eller kommer ifrån, och prata lite vardag.","characterName":"Sofia"}'::jsonb
  )
ON CONFLICT (block_id) DO UPDATE SET
    mission_id = EXCLUDED.mission_id,
    block_type = EXCLUDED.block_type,
    correct_answer = EXCLUDED.correct_answer,
    updated_at = timezone('utc'::text, now());

-- 4. UPDATE complete_mission_attempt RPC to handle all grading types robustly
CREATE OR REPLACE FUNCTION public.complete_mission_attempt(
    p_mission_id TEXT,
    p_user_answers JSONB,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_mission RECORD;
    v_key RECORD;
    v_user_answer JSONB;
    v_total_exercises INT := 0;
    v_correct_count INT := 0;
    v_earned_points INT := 0;
    v_is_first_completion BOOLEAN := false;
    v_existing_attempt RECORD;
    v_is_block_correct BOOLEAN;
    v_user_text TEXT;
    v_target_text TEXT;
    v_constructed_sentence TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Obehörig användare';
    END IF;

    -- Check idempotency
    IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO v_existing_attempt
        FROM public.mission_attempts
        WHERE user_id = v_user_id AND idempotency_key = p_idempotency_key;

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'is_completed', v_existing_attempt.is_completed,
                'correct_count', v_existing_attempt.correct_count,
                'total_exercises', v_existing_attempt.total_exercises,
                'earned_points', v_existing_attempt.earned_points,
                'is_first_completion', false,
                'idempotent', true
            );
        END IF;
    END IF;

    -- Fetch mission metadata
    SELECT * INTO v_mission
    FROM public.missions
    WHERE id = p_mission_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Uppdraget kunde inte hittas';
    END IF;

    -- Count total exercise grading keys for this mission
    SELECT count(*) INTO v_total_exercises
    FROM public.lesson_block_grading_keys
    WHERE mission_id = p_mission_id;

    -- Evaluate each exercise key
    FOR v_key IN 
        SELECT * FROM public.lesson_block_grading_keys
        WHERE mission_id = p_mission_id
    LOOP
        v_user_answer := p_user_answers -> v_key.block_id;
        v_is_block_correct := false;

        IF v_user_answer IS NOT NULL THEN
            IF v_key.block_type IN ('multiple_choice', 'listen_choice') THEN
                -- Check index match (e.g. 0, 1, 2) or option text match
                IF (v_user_answer #>> '{}') = (v_key.correct_answer ->> 'correctIndex')
                   OR (v_user_answer #>> '{}') = (v_key.correct_answer ->> 'correctOption') THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type = 'fill_blank' THEN
                -- Case-insensitive trimmed answer match
                IF lower(trim(COALESCE(v_user_answer #>> '{}', ''))) = lower(trim(COALESCE(v_key.correct_answer ->> 'correctAnswer', ''))) THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type = 'sentence_builder' THEN
                -- Check sentence string or placedWords array
                IF jsonb_typeof(v_user_answer) = 'array' THEN
                    SELECT string_agg(elem #>> '{}', ' ') INTO v_constructed_sentence
                    FROM jsonb_array_elements(v_user_answer) AS elem;
                ELSE
                    v_constructed_sentence := v_user_answer #>> '{}';
                END IF;

                v_user_text := lower(trim(regexp_replace(COALESCE(v_constructed_sentence, ''), '[.!?]', '', 'g')));
                v_target_text := lower(trim(regexp_replace(COALESCE(v_key.correct_answer ->> 'correctSentence', ''), '[.!?]', '', 'g')));

                IF v_user_text = v_target_text THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type = 'matching' THEN
                IF v_user_answer = (v_key.correct_answer -> 'pairs') THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type = 'free_text' THEN
                IF (v_key.correct_answer ->> 'regexPattern') IS NOT NULL AND (v_key.correct_answer ->> 'regexPattern') <> '.*' THEN
                    IF (v_user_answer #>> '{}') ~* (v_key.correct_answer ->> 'regexPattern') THEN
                        v_is_block_correct := true;
                    END IF;
                ELSIF length(trim(COALESCE(v_user_answer #>> '{}', ''))) >= 3 THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type IN ('speak', 'ai_roleplay') THEN
                IF v_user_answer IS NOT NULL AND v_user_answer::text <> 'null' AND v_user_answer::text <> '""' THEN
                    v_is_block_correct := true;
                END IF;
            END IF;
        END IF;

        IF v_is_block_correct THEN
            v_correct_count := v_correct_count + 1;
        END IF;
    END LOOP;

    -- Derive server verified points
    IF v_total_exercises > 0 THEN
        v_earned_points := FLOOR((v_correct_count::FLOAT / v_total_exercises::FLOAT) * v_mission.total_points)::INT;
    ELSE
        v_earned_points := v_mission.total_points;
    END IF;

    -- Check if first time completing
    IF NOT EXISTS (
        SELECT 1 FROM public.mission_attempts
        WHERE user_id = v_user_id AND mission_id = p_mission_id AND is_completed = true
    ) THEN
        v_is_first_completion := true;
    END IF;

    -- Record attempt
    INSERT INTO public.mission_attempts (
        user_id,
        mission_id,
        idempotency_key,
        is_completed,
        correct_count,
        total_exercises,
        earned_points,
        completed_at
    ) VALUES (
        v_user_id,
        p_mission_id,
        p_idempotency_key,
        true,
        v_correct_count,
        v_total_exercises,
        v_earned_points,
        timezone('utc'::text, now())
    );

    -- Update user progression atomically
    INSERT INTO public.user_progression (
        user_id,
        unlocked_level,
        current_streak,
        points,
        last_active_at
    ) VALUES (
        v_user_id,
        'A1',
        1,
        v_earned_points,
        timezone('utc'::text, now())
    )
    ON CONFLICT (user_id) DO UPDATE SET
        points = CASE 
            WHEN v_is_first_completion THEN public.user_progression.points + EXCLUDED.points
            ELSE public.user_progression.points
        END,
        last_active_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now());

    RETURN jsonb_build_object(
        'success', true,
        'is_completed', true,
        'correct_count', v_correct_count,
        'total_exercises', v_total_exercises,
        'earned_points', v_earned_points,
        'is_first_completion', v_is_first_completion,
        'idempotent', false
    );
END;
$$;
