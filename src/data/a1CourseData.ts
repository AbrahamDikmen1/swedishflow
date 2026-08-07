import { Mission } from '../types/mission';
import { Chapter } from '../types/chapter';
import { LessonData } from '../types/lesson';

/* ==========================================================================
   A1 KURSEN – DE TRE FÖRSTA UPPDRAGEN
   ========================================================================== */

export const a1Missions: Mission[] = [
  {
    id: '1',
    order: 1,
    title: 'Hälsa och presentera dig',
    description: 'Lär dig hälsa, berätta vad du heter och fråga vad någon heter.',
    status: 'active',
    estimatedMinutes: 6,
    chapterId: 'ch_1',
    skills: ['Vokabulär', 'Dialog', 'Meningsbyggnad'],
    route: '/learn/a1/mission/1',
  },
  {
    id: '2',
    order: 2,
    title: 'Berätta var du kommer ifrån',
    description: 'Träna på att berätta vilket land du kommer ifrån och fråga andra.',
    status: 'locked',
    estimatedMinutes: 7,
    chapterId: 'ch_1',
    skills: ['Vokabulär', 'Grammatik', 'Hörförståelse'],
    route: '/learn/a1/mission/2',
  },
  {
    id: '3',
    order: 3,
    title: 'Berätta var du bor',
    description: 'Träna på att berätta om din ort och din bostad.',
    status: 'locked',
    estimatedMinutes: 8,
    chapterId: 'ch_1',
    skills: ['Grammatik', 'Meningsbyggnad', 'Fri text'],
    route: '/learn/a1/mission/3',
  },
];

export const a1Chapters: Chapter[] = [
  {
    id: 'ch_1',
    order: 1,
    title: 'Kapitel 1: Presentation och vardag',
    description: 'Lär dig hälsa, berätta vem du är, var du kommer ifrån och bor.',
    missions: a1Missions,
  },
];

/* ==========================================================================
   LEKTIONSDATA FÖR UPPDRAG 1, 2 OCH 3
   ========================================================================== */

export const a1Lessons: Record<string, LessonData> = {
  // ------------------------------------------------------------------------
  // UPPDRAG 1: Hälsa och presentera dig (13 block, 8 rättningsbara övningar)
  // ------------------------------------------------------------------------
  '1': {
    missionId: '1',
    order: 1,
    totalMissions: 3,
    title: 'Hälsa och presentera dig',
    blocks: [
      {
        id: 'u1_b1_intro',
        type: 'introduction',
        skills: ['vocabulary'],
        required: true,
        title: 'Välkommen till Uppdrag 1',
        introduction:
          'I detta uppdrag får du lära dig att hälsa på svenska, säga vad du heter och fråga andra vad de heter.',
        examples: [
          { phrase: 'Hej!' },
          { phrase: 'Jag heter Anna.' },
          { phrase: 'Vad heter du?' },
        ],
        grammaticalNote:
          'På svenska står verbet (här "heter") på plats 2 i påståendesatser.',
      },
      {
        id: 'u1_b2_dialogue',
        type: 'dialogue',
        skills: ['listening', 'reading'],
        required: true,
        title: 'Möte i parken',
        scenario: 'Anna möter Erik i parken och hälsar.',
        lines: [
          { speaker: 'Anna', text: 'Hej! Vad heter du?' },
          { speaker: 'Erik', text: 'Hej! Jag heter Erik. Vad heter du?' },
          { speaker: 'Anna', text: 'Jag heter Anna. Trevligt att träffas!' },
          { speaker: 'Erik', text: 'Trevligt att träffas!' },
        ],
      },
      {
        id: 'u1_b3_vocab',
        type: 'vocabulary',
        skills: ['vocabulary'],
        required: true,
        title: 'Viktiga fraser för presentation',
        phrases: [
          { phrase: 'Hej!', explanation: 'När du börjar prata med någon.' },
          { phrase: 'Jag heter...', explanation: 'När du säger ditt namn.' },
          { phrase: 'Vad heter du?', explanation: 'När du frågar vad någon heter.' },
          { phrase: 'Trevligt att träffas!', explanation: 'När du har presenterat dig för en ny person.' },
          { phrase: 'Hej då!', explanation: 'När du lämnar någon.' },
        ],
        infoBox: 'Kom ihåg: "Hej!" är den vanligaste hälsningsfrasen i Sverige.',
      },
      {
        id: 'u1_b4_expl',
        type: 'explanation',
        skills: ['grammar'],
        required: true,
        title: 'Verbet "heter"',
        body: 'Verbet "heter" används när du anger ditt namn. Det förändras inte beroende på vem som talar.',
        examples: [
          { phrase: 'Jag heter Sara.' },
          { phrase: 'Du heter Carlos.' },
          { phrase: 'Han heter Johan.' },
        ],
        infoBox: 'Verbformen är densamma för jag, du, han, hon och vi!',
      },
      {
        id: 'u1_b5_mc1',
        type: 'multiple_choice',
        skills: ['vocabulary'],
        required: true,
        exercise: {
          question: 'Hur hälsar du enklast på svenska?',
          options: ['Hej', 'Tack', 'Hej då'],
          correctIndex: 0,
          explanationCorrect: 'Rätt! "Hej" är den vanliga hälsningsfrasen.',
          explanationIncorrect: 'Inte riktigt. Tänk på vad du säger när du möter någon.',
        },
      },
      {
        id: 'u1_b6_mc2',
        type: 'multiple_choice',
        skills: ['reading'],
        required: true,
        exercise: {
          question: 'Vad frågar du när du vill veta någons namn?',
          options: ['Vad heter du?', 'Var bor du?', 'Trevligt att träffas!'],
          correctIndex: 0,
          explanationCorrect: 'Rätt! "Vad heter du?" frågar om namnet.',
          explanationIncorrect: 'Inte riktigt. Tänk på vilken fråga du ställer för att få veta någons namn.',
        },
      },
      {
        id: 'u1_b7_mc3',
        type: 'multiple_choice',
        skills: ['vocabulary'],
        required: true,
        exercise: {
          question: 'Vad svarar du när någon säger "Trevligt att träffas!"?',
          options: ['Tack så mycket', 'Tack, detsamma!', 'God natt'],
          correctIndex: 1,
          explanationCorrect: 'Helt rätt! "Tack, detsamma!" (eller att svara "Trevligt att träffas!" tillbaka) är naturligt och artigt.',
          explanationIncorrect: 'Inte helt rätt. Tänk på hur du artigt bemöter en trevlig hälsning.',
        },
      },
      {
        id: 'u1_b8_sb1',
        type: 'sentence_builder',
        skills: ['writing', 'grammar'],
        required: true,
        exercise: {
          instruction: 'Bygg meningen genom att trycka på orden i rätt ordning.',
          initialWords: ['heter', 'Anna.', 'Jag'],
          correctSentence: 'Jag heter Anna.',
          explanationCorrect: 'Perfekt! Subjekt (Jag) + verb (heter) + namn (Anna).',
          explanationIncorrect: 'Inte riktigt. Tänk på ordföljden när du presenterar ditt namn (subjekt + verb + namn).',
        },
      },
      {
        id: 'u1_b9_sb2',
        type: 'sentence_builder',
        skills: ['writing', 'grammar'],
        required: true,
        exercise: {
          instruction: 'Bygg frågan genom att trycka på orden i rätt ordning.',
          initialWords: ['du?', 'Vad', 'heter'],
          correctSentence: 'Vad heter du?',
          explanationCorrect: 'Bra jobbat! Frågeord (Vad) + verb (heter) + subjekt (du).',
          explanationIncorrect: 'Inte riktigt. Tänk på ordföljden i en fråga: frågeord + verb + subjekt.',
        },
      },
      {
        id: 'u1_b10_fill1',
        type: 'fill_blank',
        skills: ['grammar'],
        required: true,
        exercise: {
          sentence: 'Hej! Jag ___ Erik.',
          options: ['heter', 'bor', 'kommer'],
          correctAnswer: 'heter',
          explanationCorrect: 'Rätt! Man säger "Jag heter Erik".',
          explanationIncorrect: 'Inte riktigt. Tänk på vilket verb du använder när du uppger ett namn.',
        },
      },
      {
        id: 'u1_b11_match',
        type: 'matching',
        skills: ['vocabulary'],
        required: true,
        exercise: {
          instruction: 'Koppla samman frasen med rätt situation.',
          pairs: [
            { id: 'p1', question: 'Hej!', answer: 'När du börjar prata med någon' },
            { id: 'p2', question: 'Jag heter Anna.', answer: 'När du säger ditt namn' },
            { id: 'p3', question: 'Trevligt att träffas!', answer: 'När du har presenterat dig för en ny person' },
          ],
          explanationCorrect: 'Alla matchningar är rätt!',
        },
      },
      {
        id: 'u1_b12_text',
        type: 'free_text',
        skills: ['writing'],
        required: true,
        exercise: {
          instruction: 'Skriv en presentation av dig själv (t.ex. "Jag heter [ditt namn].")',
          prompt: 'Skriv din presentation nedan:',
          placeholder: 'Jag heter...',
          hintExample: 'Exempel: Jag heter Maria.',
          regexPattern: '^\\s*jag\\s+heter\\s+[a-zåäöéâ\\s\\-]+\\.?\\s*$',
          explanationCorrect: 'Utmärkt presentation!',
          explanationIncorrect: 'Skriv i formatet "Jag heter..." följt av ditt namn.',
          explanationEmpty: 'Skriv din presentation innan du kontrollerar.',
          explanationIncomplete: 'Skriv minst "Jag heter" och ditt namn.',
        },
      },
      {
        id: 'u1_b13_summary',
        type: 'summary',
        skills: ['vocabulary'],
        required: true,
        title: 'Uppdrag 1 slutfört!',
        subtitle: 'Nu kan du hälsa och presentera dig på svenska.',
        summaryPhrases: [
          'Hej!',
          'Jag heter...',
          'Vad heter du?',
          'Trevligt att träffas!',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------------
  // UPPDRAG 2: Berätta var du kommer ifrån (14 block, 9 rättningsbara övningar)
  // ------------------------------------------------------------------------
  '2': {
    missionId: '2',
    order: 2,
    totalMissions: 3,
    title: 'Berätta var du kommer ifrån',
    blocks: [
      {
        id: 'u2_b1_intro',
        type: 'introduction',
        skills: ['vocabulary'],
        required: true,
        title: 'Välkommen till Uppdrag 2',
        introduction:
          'I detta uppdrag lär du dig att berätta vilket land eller vilken stad du kommer ifrån, samt ställa frågor om ursprung.',
        examples: [
          { phrase: 'Varifrån kommer du?' },
          { phrase: 'Jag kommer från Spanien.' },
          { phrase: 'Han kommer från Tyskland.' },
        ],
        grammaticalNote:
          'Använd prepositionen "från" efter verbet "kommer" för att ange ursprung.',
      },
      {
        id: 'u2_b2_dialogue',
        type: 'dialogue',
        skills: ['listening', 'reading'],
        required: true,
        title: 'Samtal om ursprung',
        scenario: 'Sara och Carlos pratar om var de kommer ifrån.',
        lines: [
          { speaker: 'Sara', text: 'Varifrån kommer du, Carlos?' },
          { speaker: 'Carlos', text: 'Jag kommer från Spanien. Och du?' },
          { speaker: 'Sara', text: 'Jag kommer från Sverige.' },
          { speaker: 'Carlos', text: 'Aha! Vad intressant.' },
        ],
      },
      {
        id: 'u2_b3_vocab',
        type: 'vocabulary',
        skills: ['vocabulary'],
        required: true,
        title: 'Länder och ursprungsfraser',
        phrases: [
          { phrase: 'Varifrån kommer du?', explanation: 'När du frågar om någons hemland eller ort.' },
          { phrase: 'Jag kommer från...', explanation: 'När du berättar var du kommer ifrån.' },
          { phrase: 'Sverige', explanation: 'Ett land i Norden.' },
          { phrase: 'Spanien', explanation: 'Ett land i Europa.' },
          { phrase: 'Tyskland', explanation: 'Ett land i Europa.' },
        ],
        infoBox: 'Märk väl: Landsnamn skrivs med stor begynnelsebokstav på svenska (Sverige, Norge, Finland).',
      },
      {
        id: 'u2_b4_expl',
        type: 'explanation',
        skills: ['grammar'],
        required: true,
        title: 'Prepositionen "från"',
        body: 'Prepositionen "från" kopplas ihop med verbet "kommer" när man talar om ursprung.',
        examples: [
          { phrase: 'Jag kommer från Italien.' },
          { phrase: 'Varifrån kommer hon?' },
        ],
        infoBox: 'I frågor sätts frågeordet "Varifrån" först.',
      },
      {
        id: 'u2_b5_mc1',
        type: 'multiple_choice',
        skills: ['reading'],
        required: true,
        exercise: {
          question: 'Vad frågar du när du vill veta vilket land någon kommer ifrån?',
          options: ['Varifrån kommer du?', 'Vad heter du?', 'Var bor du?'],
          correctIndex: 0,
          explanationCorrect: 'Helt rätt! "Varifrån kommer du?" frågar om land eller ursprung.',
          explanationIncorrect: 'Inte riktigt. Tänk på vilket frågeord och verb som används för ursprung.',
        },
      },
      {
        id: 'u2_b6_mc2',
        type: 'multiple_choice',
        skills: ['grammar'],
        required: true,
        exercise: {
          question: 'Vilken preposition är rätt? "Jag kommer ___ Tyskland."',
          options: ['från', 'i', 'på'],
          correctIndex: 0,
          explanationCorrect: 'Rätt! Man säger alltid "kommer från".',
          explanationIncorrect: 'Inte riktigt. Tänk på vilken preposition som uttrycker ursprung.',
        },
      },
      {
        id: 'u2_b7_sb1',
        type: 'sentence_builder',
        skills: ['writing', 'grammar'],
        required: true,
        exercise: {
          instruction: 'Bygg meningen genom att trycka på orden i rätt ordning.',
          initialWords: ['från', 'kommer', 'Sverige.', 'Jag'],
          correctSentence: 'Jag kommer från Sverige.',
          explanationCorrect: 'Utmärkt! Jag + kommer + från + Sverige.',
          explanationIncorrect: 'Inte riktigt. Tänk på ordföljden: subjekt + verb + preposition + land.',
        },
      },
      {
        id: 'u2_b8_sb2',
        type: 'sentence_builder',
        skills: ['writing', 'grammar'],
        required: true,
        exercise: {
          instruction: 'Bygg frågan genom att trycka på orden i rätt ordning.',
          initialWords: ['du?', 'Varifrån', 'kommer'],
          correctSentence: 'Varifrån kommer du?',
          explanationCorrect: 'Korrekt frågeord och ordning!',
          explanationIncorrect: 'Inte riktigt. Tänk på ordföljden i en fråga: frågeord + verb + subjekt.',
        },
      },
      {
        id: 'u2_b9_fill1',
        type: 'fill_blank',
        skills: ['grammar'],
        required: true,
        exercise: {
          sentence: 'Carlos kommer ___ Spanien.',
          options: ['från', 'i', 'heter'],
          correctAnswer: 'från',
          explanationCorrect: 'Rätt! "kommer från Spanien".',
          explanationIncorrect: 'Inte riktigt. Tänk på vilken preposition som uttrycker ursprung.',
        },
      },
      {
        id: 'u2_b10_fill2',
        type: 'fill_blank',
        skills: ['grammar'],
        required: true,
        exercise: {
          sentence: 'Varifrån ___ du?',
          options: ['kommer', 'bor', 'heter'],
          correctAnswer: 'kommer',
          explanationCorrect: 'Perfekt! "Varifrån kommer du?".',
          explanationIncorrect: 'Inte riktigt. Tänk på vilket verb du använder när du frågar om ursprung.',
        },
      },
      {
        id: 'u2_b11_match',
        type: 'matching',
        skills: ['vocabulary'],
        required: true,
        exercise: {
          instruction: 'Koppla samman fråga och svar.',
          pairs: [
            { id: 'p1', question: 'Varifrån kommer du?', answer: 'Jag kommer från Spanien.' },
            { id: 'p2', question: 'Kommer du från Tyskland?', answer: 'Ja, det gör jag.' },
            { id: 'p3', question: 'Varifrån kommer Carlos?', answer: 'Han kommer från Mexiko.' },
          ],
          explanationCorrect: 'Alla par är korrekt ihopkopplade!',
        },
      },
      {
        id: 'u2_b12_text',
        type: 'free_text',
        skills: ['writing'],
        required: true,
        exercise: {
          instruction: 'Skriv vilket land du kommer ifrån (t.ex. "Jag kommer från Sverige.")',
          prompt: 'Skriv din mening nedan:',
          placeholder: 'Jag kommer från...',
          hintExample: 'Exempel: Jag kommer från Spanien.',
          regexPattern: '^\\s*jag\\s+kommer\\s+från\\s+[a-zåäöéâ\\s\\-]+\\.?\\s*$',
          explanationCorrect: 'Snyggt jobbat!',
          explanationIncorrect: 'Skriv i formatet "Jag kommer från [land]."',
          explanationEmpty: 'Skriv din mening innan du kontrollerar.',
          explanationIncomplete: 'Inkludera hela frasen "Jag kommer från...".',
        },
      },
      {
        id: 'u2_b13_summary',
        type: 'summary',
        skills: ['vocabulary'],
        required: true,
        title: 'Uppdrag 2 slutfört!',
        subtitle: 'Nu kan du tala om varifrån du och andra kommer.',
        summaryPhrases: [
          'Varifrån kommer du?',
          'Jag kommer från...',
          'Sverige, Spanien, Tyskland',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------------
  // UPPDRAG 3: Berätta var du bor (16 block med 11 rättningsbara övningar)
  // ------------------------------------------------------------------------
  '3': {
    missionId: '3',
    order: 3,
    totalMissions: 3,
    title: 'Berätta var du bor',
    blocks: [
      // 1. INTRODUKTION OCH LÄRANDEMÅL
      {
        id: 'u3_b1_intro',
        type: 'introduction',
        skills: ['vocabulary'],
        required: true,
        title: 'Berätta var du bor',
        introduction:
          'I det här uppdraget träffar du en ny person och tränar på att berätta var du bor och fråga var andra bor.',
        examples: [
          { phrase: 'Var bor du?' },
          { phrase: 'Jag bor i Malmö.' },
          { phrase: 'Bor du i Lund?' },
          { phrase: 'Ja, det gör jag.' },
          { phrase: 'Nej, jag bor i Helsingborg.' },
        ],
        grammaticalNote:
          'På svenska använder vi prepositionen "i" framför städer och länder (t.ex. "i Malmö", "i Sverige").',
      },

      // 2. DIALOG MELLAN SARA OCH ALI
      {
        id: 'u3_b2_dialogue',
        type: 'dialogue',
        skills: ['reading'],
        required: true,
        title: 'Möte mellan Sara och Ali',
        scenario: 'Sara och Ali träffas och berättar var de bor.',
        lines: [
          { speaker: 'Sara', text: 'Hej! Jag heter Sara.' },
          { speaker: 'Ali', text: 'Hej Sara! Jag heter Ali.' },
          { speaker: 'Sara', text: 'Var bor du, Ali?' },
          { speaker: 'Ali', text: 'Jag bor i Malmö. Var bor du?' },
          { speaker: 'Sara', text: 'Jag bor i Lund.' },
        ],
      },

      // 3. VIKTIGA ORD OCH FRASER
      {
        id: 'u3_b4_vocab',
        type: 'vocabulary',
        skills: ['vocabulary'],
        required: true,
        title: 'Viktiga ord och fraser',
        phrases: [
          { phrase: 'bor', explanation: 'När du har ditt hem på en plats.' },
          { phrase: 'stad', explanation: 'En plats där många människor bor, till exempel Malmö.' },
          { phrase: 'land', explanation: 'Till exempel Sverige, Spanien eller Tyskland.' },
          { phrase: 'granne', explanation: 'En person som bor nära dig.' },
          { phrase: 'Var bor du?', explanation: 'En fråga om var du har ditt hem.' },
          { phrase: 'Jag bor i Malmö.', explanation: 'Du berättar vilken stad du bor i.' },
          { phrase: 'Bor du i Lund?', explanation: 'En fråga som du kan svara ja eller nej på.' },
          { phrase: 'Ja, det gör jag.', explanation: 'Ett ja-svar på frågan.' },
          { phrase: 'Nej, jag bor i Helsingborg.', explanation: 'Ett nej-svar där du berättar rätt stad.' },
          { phrase: 'Var bor hon?', explanation: 'En fråga om var en kvinna bor.' },
          { phrase: 'Hon bor i Stockholm.', explanation: 'Ett svar om var en kvinna bor.' },
          { phrase: 'Var bor han?', explanation: 'En fråga om var en man bor.' },
          { phrase: 'Han bor i Uppsala.', explanation: 'Ett svar om var en man bor.' },
        ],
        infoBox: 'Ljud och uttalsträning är planerade till en senare uppdatering.',
      },

      // 4. SPRÅKFÖRKLARING
      {
        id: 'u3_b5_expl',
        type: 'explanation',
        skills: ['grammar'],
        required: true,
        title: 'Så säger du var du bor',
        body: 'Regel: Jag bor i + plats',
        examples: [
          { phrase: 'Jag bor i Malmö.' },
          { phrase: 'Jag bor i Sverige.' },
          { phrase: 'Jag bor i en lägenhet.' },
          { phrase: 'Var bor du?' },
          { phrase: 'Bor du i Malmö?' },
          { phrase: 'Ja, det gör jag.' },
          { phrase: 'Nej, jag bor i Lund.' },
        ],
        infoBox: 'Använd prepositionen "i" framför städer och länder (t.ex. i Malmö, i Sverige).',
      },

      // 5. LÄSFÖRSTÅELSE
      {
        id: 'u3_b3_mc1',
        type: 'multiple_choice',
        skills: ['reading'],
        required: true,
        exercise: {
          question: 'Var bor Ali?',
          options: ['I Malmö', 'I Lund', 'I Stockholm'],
          correctIndex: 0,
          explanationCorrect: 'Rätt! Ali bor i Malmö.',
          explanationIncorrect: 'Inte riktigt. Läs dialogen igen för att se var Ali bor.',
        },
      },
      {
        id: 'u3_b3_mc2',
        type: 'multiple_choice',
        skills: ['reading'],
        required: true,
        exercise: {
          question: 'Var bor Sara?',
          options: ['I Lund', 'I Malmö', 'I Helsingborg'],
          correctIndex: 0,
          explanationCorrect: 'Rätt! Sara bor i Lund.',
          explanationIncorrect: 'Inte riktigt. Läs dialogen igen för att se var Sara bor.',
        },
      },
      {
        id: 'u3_b3_mc3',
        type: 'multiple_choice',
        skills: ['reading'],
        required: true,
        exercise: {
          question: 'Vad frågar Sara?',
          options: ['Var bor du?', 'Vad heter du?', 'Varifrån kommer du?'],
          correctIndex: 0,
          explanationCorrect: 'Rätt! Sara frågar "Var bor du?".',
          explanationIncorrect: 'Inte riktigt. Läs dialogen igen för att se vilken fråga Sara ställer.',
        },
      },

      // 6. BYGG MENINGAR
      {
        id: 'u3_b6_sb1',
        type: 'sentence_builder',
        skills: ['writing', 'grammar'],
        required: true,
        exercise: {
          instruction: 'Bygg meningen genom att trycka på orden i rätt ordning.',
          initialWords: ['bor', 'Jag', 'Malmö', 'i'],
          correctSentence: 'Jag bor i Malmö.',
          explanationCorrect: 'Utmärkt! Meningen är helt rätt.',
          explanationIncorrect: 'Inte riktigt. Tänk på ordföljden: subjekt + verb + preposition + stad.',
        },
      },
      {
        id: 'u3_b6_sb2',
        type: 'sentence_builder',
        skills: ['writing', 'grammar'],
        required: true,
        exercise: {
          instruction: 'Bygg frågan genom att trycka på orden i rätt ordning.',
          initialWords: ['du?', 'Var', 'bor'],
          correctSentence: 'Var bor du?',
          explanationCorrect: 'Rätt! I frågor kommer verbet före subjektet.',
          explanationIncorrect: 'Inte riktigt. Tänk på ordföljden i en fråga: frågeord + verb + subjekt.',
        },
      },
      {
        id: 'u3_b6_sb3',
        type: 'sentence_builder',
        skills: ['writing', 'grammar'],
        required: true,
        exercise: {
          instruction: 'Bygg meningen genom att trycka på orden i rätt ordning.',
          initialWords: ['Lund.', 'hon', 'i', 'bor'],
          correctSentence: 'Hon bor i Lund.',
          explanationCorrect: 'Perfekt byggt!',
          explanationIncorrect: 'Inte riktigt. Tänk på ordföljden: subjekt + verb + preposition + stad.',
        },
      },

      // 7. LUCKTEXT
      {
        id: 'u3_b7_fill1',
        type: 'fill_blank',
        skills: ['grammar'],
        required: true,
        exercise: {
          sentence: 'Jag bor ___ Stockholm.',
          options: ['i', 'på', 'vid'],
          correctAnswer: 'i',
          explanationCorrect: 'Korrekt! Vi använder "i" framför städer.',
          explanationIncorrect: 'Inte riktigt. Tänk på vilken preposition som används framför städer.',
        },
      },
      {
        id: 'u3_b7_fill2',
        type: 'fill_blank',
        skills: ['grammar'],
        required: true,
        exercise: {
          sentence: '___ bor du?',
          options: ['Var', 'Vad', 'Vem'],
          correctAnswer: 'Var',
          explanationCorrect: 'Helt rätt! "Var" är frågeordet för plats/bostad.',
          explanationIncorrect: 'Inte riktigt. Tänk på vilket frågeord du använder när du frågar om plats.',
        },
      },
      {
        id: 'u3_b7_fill3',
        type: 'fill_blank',
        skills: ['grammar'],
        required: true,
        exercise: {
          sentence: 'Hon ___ i Sverige.',
          options: ['bor', 'heter', 'kommer'],
          correctAnswer: 'bor',
          explanationCorrect: 'Rätt! "bor" passar bäst här.',
          explanationIncorrect: 'Inte riktigt. Tänk på vilket verb du använder för bostadsort.',
        },
      },

      // 8. MATCHNING
      {
        id: 'u3_b8_match',
        type: 'matching',
        skills: ['vocabulary'],
        required: true,
        exercise: {
          instruction: 'Koppla samman fråga och svar.',
          pairs: [
            { id: 'p1', question: 'Var bor du?', answer: 'Jag bor i Stockholm.' },
            { id: 'p2', question: 'Bor du i Malmö?', answer: 'Nej, jag bor i Helsingborg.' },
            { id: 'p3', question: 'Var bor hon?', answer: 'Hon bor i Lund.' },
          ],
          explanationCorrect: 'Alla par är korrekt ihopkopplade!',
        },
      },

      // 9. SKRIV SJÄLV
      {
        id: 'u3_b9_text1',
        type: 'free_text',
        skills: ['writing'],
        required: true,
        exercise: {
          instruction: 'Skriv var du bor.',
          prompt: 'Skriv din mening nedan (Startfras: "Jag bor ..."):',
          placeholder: 'Jag bor ...',
          hintExample: 'Exempel: Jag bor i Landskrona.',
          regexPattern: '^\\s*jag\\s+bor\\b.*$',
          explanationCorrect: 'Bra skrivet!',
          explanationIncorrect: 'Börja din mening med "Jag bor ...".',
          explanationEmpty: 'Fältet är tomt. Skriv din mening innan du kontrollerar.',
          explanationIncomplete: 'Börja med "Jag bor" och ange var du bor.',
        },
      },
      {
        id: 'u3_b9_text2',
        type: 'free_text',
        skills: ['writing'],
        required: true,
        exercise: {
          instruction: 'Skriv en fråga till en ny person.',
          prompt: 'Skriv frågan nedan:',
          placeholder: 'Var bor du?',
          hintExample: 'Exempel: Var bor du?',
          regexPattern: '^\\s*var\\s+bor\\s+du\\??\\s*$',
          explanationCorrect: 'Utmärkt! "Var bor du?" är rätt fråga.',
          explanationIncorrect: 'Inte riktigt. Tänk på hur du frågar någon var personen bor.',
          explanationEmpty: 'Fältet är tomt. Skriv en fråga innan du kontrollerar.',
          explanationIncomplete: 'Skriv hela frågan "Var bor du?".',
        },
      },

      // 10. SAMMANFATTNING
      {
        id: 'u3_b10_summary',
        type: 'summary',
        skills: ['vocabulary'],
        required: true,
        title: 'Uppdraget är klart!',
        subtitle: 'Du kan nu berätta var du bor och ställa frågor om bostadsort på svenska.',
        summaryPhrases: [
          'Var bor du?',
          'Jag bor i Malmö / Lund / Stockholm.',
          'Bor du i...? Ja, det gör jag. / Nej, jag bor i...',
        ],
      },
    ],
  },
};
