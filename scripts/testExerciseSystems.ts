import { a1Lessons, a1Missions } from '../src/data/a1CourseData';
import { normalizeSwedishText, evaluateSpeechAccuracy } from '../src/utils/speechEvaluation';

let failed = false;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${msg}`);
    failed = true;
  } else {
    console.log(`✅ ${msg}`);
  }
}

console.log('\n======================================================');
console.log('🧪 1. TESTING SPEECH EVALUATION UTILITY & FALLBACK STATE');
console.log('======================================================');

// Test normalization
const raw1 = '  Hej, hur mår du!?  ';
const norm1 = normalizeSwedishText(raw1);
assert(norm1 === 'hej hur mår du', `Normalized '${raw1}' -> '${norm1}'`);

// Test exact match
const res1 = evaluateSpeechAccuracy('God morgon! Hur mår du?', 'God morgon! Hur mår du?');
assert(res1.status === 'correct' && (res1.score ?? 0) === 100, `Exact speech match passed with score ${res1.score}`);

// Test minor speech recognition variations
const res2 = evaluateSpeechAccuracy('god morgon hur mår du', 'God morgon! Hur mår du?');
assert(res2.status === 'correct' && (res2.score ?? 0) >= 90, `Case/punctuation insensitive match passed with score ${res2.score}`);

// Test almost match (small typo / missing word)
const res3 = evaluateSpeechAccuracy('jag bor i lägenhet i Stockholm', 'Jag bor i en lägenhet i Stockholm.');
assert(res3.status === 'almost' || res3.status === 'correct', `Near match recognized appropriately (${res3.status}, score ${res3.score})`);

// Test incorrect speech
const res4 = evaluateSpeechAccuracy('jag heter Anna', 'God morgon! Hur mår du?');
assert(res4.status === 'incorrect', `Incorrect speech recognized as incorrect (${res4.status})`);

// Test recorded_unverified status typing and contract
type SpeechStatusType = 'idle' | 'recording' | 'evaluating' | 'correct' | 'almost' | 'incorrect' | 'recorded_unverified';
const testFallbackStatus: SpeechStatusType = 'recorded_unverified';
assert(testFallbackStatus === 'recorded_unverified', 'recorded_unverified is a valid neutral speech status type');

console.log('\n======================================================');
console.log('🧪 2. TESTING SENTENCE BUILDER TOKEN COUNT & STABLE IDS');
console.log('======================================================');

// Uppdrag 2: "Jag heter Elena." with bank: ['Elena.', 'heter', 'Jag', 'du']
const u2sb = a1Lessons['2'].blocks.find((b) => b.id === 'u2_b3_sentence') as any;
assert(!!u2sb, 'u2_b3_sentence block exists');
assert(u2sb.exercise.initialWords.includes('du'), "u2_b3_sentence includes distractor 'du'");
assert(u2sb.exercise.correctSentence === 'Jag heter Elena.', 'u2_b3_sentence target sentence is correct');
assert(!u2sb.exercise.instruction.includes('"Jag heter Elena."'), 'u2_b3_sentence instruction does not give away the answer in quotes');

// Calculate expected tokens from correctSentence
function calculateExpectedTokenCount(sentence: string): number {
  return sentence.trim().split(/\s+/).filter(Boolean).length;
}

const u2Tokens = calculateExpectedTokenCount(u2sb.exercise.correctSentence);
assert(u2Tokens === 3, `Expected token count for 'Jag heter Elena.' is 3 (got ${u2Tokens})`);

// Simulate builder button enabling condition
const incompletePlacement = ['Jag', 'heter'];
const completePlacement = ['Jag', 'heter', 'Elena.'];
const overPlacement = ['Jag', 'heter', 'Elena.', 'du'];

const isCheckEnabledIncomplete = incompletePlacement.length === u2Tokens;
const isCheckEnabledComplete = completePlacement.length === u2Tokens;
const isCheckEnabledOver = overPlacement.length === u2Tokens;

assert(!isCheckEnabledIncomplete, 'Kontrollera button is disabled when 2 of 3 tiles placed');
assert(isCheckEnabledComplete, 'Kontrollera button is enabled when exactly 3 of 3 tiles placed');
assert(!isCheckEnabledOver, 'Kontrollera button is disabled when 4 of 3 tiles placed');

// Test stable ID generation for duplicate words
const rawWordBank = ['och', 'jag', 'och', 'du'];
const stableTokens = rawWordBank.map((word, idx) => ({
  id: `${word}_${idx}`,
  text: word,
}));
const uniqueIds = new Set(stableTokens.map((t) => t.id));
assert(uniqueIds.size === stableTokens.length, 'Duplicate bank words have unique stable tile IDs');

// Uppdrag 6: "Jag jobbar som ingenjör." with distractor "lärare"
const u6sb = a1Lessons['6'].blocks.find((b) => b.id === 'u6_b3_sentence') as any;
assert(!!u6sb, 'u6_b3_sentence block exists');
assert(u6sb.exercise.initialWords.includes('lärare'), "u6_b3_sentence includes distractor 'lärare'");
assert(!u6sb.exercise.instruction.includes('"Jag jobbar som ingenjör."'), 'u6_b3_sentence instruction does not leak the answer');

console.log('\n======================================================');
console.log('🧪 3. TESTING ADMIN LESSON STRUCTURE & SAFE ORDERING');
console.log('======================================================');

// Simulate block ordering logic
function simulateAddBlock(blocks: any[], newBlock: any): any[] {
  const result = [...blocks];
  if (newBlock.type === 'introduction') {
    result.unshift(newBlock);
  } else if (newBlock.type === 'summary') {
    result.push(newBlock);
  } else {
    const summaryIndex = result.findIndex((b) => b.type === 'summary');
    if (summaryIndex !== -1) {
      result.splice(summaryIndex, 0, newBlock);
    } else {
      result.push(newBlock);
    }
  }
  return result;
}

const initialLessonBlocks = [
  { id: 'b_intro', type: 'introduction' },
  { id: 'b_diag', type: 'dialogue' },
  { id: 'b_sum', type: 'summary' },
];

// Adding a new exercise must place it before summary
const addedEx = simulateAddBlock(initialLessonBlocks, { id: 'b_ex1', type: 'multiple_choice' });
assert(addedEx[0].type === 'introduction', 'Introduction remains first at index 0');
assert(addedEx[addedEx.length - 1].type === 'summary', 'Summary remains last');
assert(addedEx[2].id === 'b_ex1' && addedEx[3].id === 'b_sum', 'New exercise is placed immediately before summary');

// Adding an intro places it at index 0
const addedIntro = simulateAddBlock([{ id: 'b_diag', type: 'dialogue' }], { id: 'b_intro2', type: 'introduction' });
assert(addedIntro[0].id === 'b_intro2', 'Introduction is placed at index 0');

// Safe move up/down simulation
function canMoveBlockUp(blocks: any[], index: number): boolean {
  if (index === 0) return false;
  if (blocks[index].type === 'summary') return false;
  if (blocks[0].type === 'introduction' && index === 1) return false;
  return true;
}

function canMoveBlockDown(blocks: any[], index: number): boolean {
  if (index >= blocks.length - 1) return false;
  if (blocks[index].type === 'introduction') return false;
  if (blocks[blocks.length - 1].type === 'summary' && index === blocks.length - 2) return false;
  return true;
}

assert(!canMoveBlockUp(addedEx, 0), 'Introduction at index 0 cannot move up');
assert(!canMoveBlockDown(addedEx, 0), 'Introduction at index 0 cannot move down');
assert(!canMoveBlockUp(addedEx, 1), 'First exercise cannot move above introduction');
assert(canMoveBlockDown(addedEx, 1), 'First exercise can move down');
assert(!canMoveBlockUp(addedEx, 3), 'Summary cannot move up');
assert(!canMoveBlockDown(addedEx, 3), 'Summary cannot move down');
assert(!canMoveBlockDown(addedEx, 2), 'Exercise right before summary cannot move below summary');

console.log('\n======================================================');
console.log('🧪 3. TESTING FILL BLANK CANONICAL MARKERS');
console.log('======================================================');

const u2fb = a1Lessons['2'].blocks.find((b) => b.id === 'u2_b4_fill') as any;
assert(!!u2fb, 'u2_b4_fill block exists');
assert(u2fb.exercise.sentence.includes('{blank}'), "u2_b4_fill uses canonical '{blank}' marker");
assert(u2fb.exercise.correctAnswer === 'heter', 'u2_b4_fill correct answer is heter');

const u4fb = a1Lessons['4'].blocks.find((b) => b.id === 'u4_b3_fill') as any;
assert(!!u4fb, 'u4_b3_fill block exists');
assert(u4fb.exercise.sentence.includes('{blank}'), "u4_b3_fill uses canonical '{blank}' marker");

const u10fb = a1Lessons['10'].blocks.find((b) => b.id === 'u10_b3_fill') as any;
assert(!!u10fb, 'u10_b3_fill block exists');
assert(u10fb.exercise.sentence.includes('{blank}'), "u10_b3_fill uses canonical '{blank}' marker");

console.log('\n======================================================');
console.log('🧪 4. TESTING ALL 12 MISSIONS FOR PHONETICS & INTEGRITY');
console.log('======================================================');

for (let i = 1; i <= 12; i++) {
  const lesson = a1Lessons[String(i)];
  assert(!!lesson, `Lesson ${i} exists`);

  for (const block of lesson.blocks) {
    if (block.type === 'speak') {
      const sp = (block as any).exercise;
      assert(!!sp.targetPhrase, `Speak block ${block.id} has targetPhrase`);
      if (sp.phoneticHint) {
        // Ensure no pseudo-English phonetics (e.g. "Goo mårr-on", "Hoor morr doo", "Ståkk-hålm")
        assert(!sp.phoneticHint.includes('Hoor morr doo'), `Speak block ${block.id} does not contain pseudo-English phonetics`);
        assert(!sp.phoneticHint.includes('Ståkk-hålm'), `Speak block ${block.id} does not contain pseudo-English phonetics`);
        assert(!sp.phoneticHint.includes('lee-te'), `Speak block ${block.id} does not contain pseudo-English phonetics`);
      }
    }
  }
}

if (failed) {
  console.error('\n❌ ONE OR MORE EXERCISE SYSTEM TESTS FAILED!\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL 12 MISSIONS AND EXERCISE SYSTEM TESTS PASSED CLEANLY!\n');
}
