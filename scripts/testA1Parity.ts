import * as fs from 'fs';
import * as path from 'path';
import { a1Missions, a1Lessons, a1Chapters } from '../src/data/a1CourseData';
import { mockLevels } from '../src/data/mockLevels';
import { mockStudentDashboard } from '../src/data/mockStudent';

// Expected customer specification
const EXPECTED_A1_TITLES = [
  'Hälsa och säga hej',
  'Berätta vad du heter',
  'Berätta var du kommer ifrån',
  'Berätta var du bor',
  'Berätta hur gammal du är',
  'Berätta vad du arbetar med',
  'Berätta vilka språk du talar',
  'Berätta om din familj',
  'Prata om din vardag och tid',
  'Handla mat och andra vardagsvaror',
  'Beställa på café/restaurang',
  'Klara ett enkelt vardagssamtal – repetition av A1',
];

let failed = false;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${msg}`);
    failed = true;
  } else {
    console.log(`✅ ${msg}`);
  }
}

console.log('\n--- 1. Testing Customer Contract parity with a1Missions ---');
assert(a1Missions.length === 12, `Total missions in a1Missions must be 12 (got ${a1Missions.length})`);

for (let i = 0; i < EXPECTED_A1_TITLES.length; i++) {
  const expectedTitle = EXPECTED_A1_TITLES[i];
  const mission = a1Missions[i];
  assert(mission && mission.order === i + 1, `Mission at index ${i} has order ${i + 1}`);
  assert(mission && mission.title === expectedTitle, `Mission ${i + 1} title matches '${expectedTitle}' (got '${mission?.title}')`);
  assert(mission && mission.levelCode === 'A1', `Mission ${i + 1} levelCode is 'A1'`);
  assert(mission && Array.isArray(mission.skills) && mission.skills.length > 0, `Mission ${i + 1} has defined skills`);
  assert(mission && Array.isArray(mission.goals) && mission.goals.length > 0, `Mission ${i + 1} has defined goals`);
  assert(mission && Array.isArray(mission.knowledgeOutcomes) && mission.knowledgeOutcomes.length > 0, `Mission ${i + 1} has defined knowledge outcomes`);
}

console.log('\n--- 2. Testing Lesson Blocks & Private Grading Keys parity ---');
let totalBlocks = 0;
let totalGradingKeys = 0;

for (let i = 0; i < 12; i++) {
  const missionId = String(i + 1);
  const lesson = a1Lessons[missionId];
  assert(!!lesson, `Lesson for mission ${missionId} exists`);
  assert(lesson && lesson.blocks && lesson.blocks.length > 0, `Mission ${missionId} has blocks (got ${lesson?.blocks?.length || 0})`);
  
  if (lesson) {
    totalBlocks += lesson.blocks.length;
    for (const block of lesson.blocks) {
      assert(!!block.id, `Block in mission ${missionId} has unique ID (${block.id})`);
      assert(!!block.type, `Block ${block.id} has type (${block.type})`);

      // Check deterministic grading blocks
      if (['multiple_choice', 'listen_choice'].includes(block.type)) {
        const mc = (block as any).exercise;
        assert(typeof mc?.correctIndex === 'number', `Block ${block.id} has valid correctIndex`);
        assert(Array.isArray(mc?.options) && mc.options.length > 1, `Block ${block.id} has multiple options`);
        totalGradingKeys++;
      } else if (block.type === 'sentence_builder') {
        const sb = (block as any).exercise;
        assert(typeof sb?.correctSentence === 'string' && sb.correctSentence.length > 0, `Block ${block.id} has correctSentence`);
        assert(Array.isArray(sb?.initialWords) && sb.initialWords.length > 0, `Block ${block.id} has initialWords`);
        totalGradingKeys++;
      } else if (block.type === 'fill_blank') {
        const fb = (block as any).exercise;
        assert(typeof fb?.correctAnswer === 'string' && fb.correctAnswer.length > 0, `Block ${block.id} has correctAnswer`);
        assert(Array.isArray(fb?.options) && fb.options.length > 0, `Block ${block.id} has options`);
        totalGradingKeys++;
      } else if (block.type === 'matching') {
        const m = (block as any).exercise;
        assert(Array.isArray(m?.pairs) && m.pairs.length > 0, `Block ${block.id} has matching pairs`);
        totalGradingKeys++;
      } else if (block.type === 'free_text') {
        const ft = (block as any).exercise;
        assert(typeof ft?.prompt === 'string', `Block ${block.id} has prompt`);
        totalGradingKeys++;
      } else if (block.type === 'speak') {
        const sp = (block as any).exercise;
        assert(typeof sp?.targetPhrase === 'string' && sp.targetPhrase.length > 0, `Block ${block.id} has targetPhrase`);
        totalGradingKeys++;
      } else if (block.type === 'ai_roleplay') {
        const ar = (block as any).exercise;
        assert(typeof ar?.goalDescription === 'string', `Block ${block.id} has goalDescription`);
        totalGradingKeys++;
      }
    }
  }
}

console.log(`Verified ${totalBlocks} total blocks and ${totalGradingKeys} grading keys.`);

console.log('\n--- 3. Testing Supabase Migration File parity ---');
const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260101000001_align_a1_course_with_customer_spec.sql');
assert(fs.existsSync(migrationPath), `Migration file exists: ${migrationPath}`);

const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
for (const title of EXPECTED_A1_TITLES) {
  assert(migrationSql.includes(title), `Migration SQL contains mission title: '${title}'`);
}
assert(migrationSql.includes('INSERT INTO public.missions'), 'Migration contains missions upsert');
assert(migrationSql.includes('INSERT INTO public.lesson_blocks'), 'Migration contains lesson_blocks upsert');
assert(migrationSql.includes('INSERT INTO public.lesson_block_grading_keys'), 'Migration contains grading keys upsert');
assert(migrationSql.includes('CREATE OR REPLACE FUNCTION public.complete_mission_attempt'), 'Migration contains updated complete_mission_attempt RPC');

console.log('\n--- 4. Testing Removal of Pilot Leftovers ---');
assert(mockLevels[0].totalMissionsCount === 12, `mockLevels has totalMissionsCount: 12 (got ${mockLevels[0].totalMissionsCount})`);
assert(mockStudentDashboard.user.totalMissionsCount === 12, `mockStudentDashboard has totalMissionsCount: 12 (got ${mockStudentDashboard.user.totalMissionsCount})`);

const progressTsx = fs.readFileSync(path.join(process.cwd(), 'app/(tabs)/progress.tsx'), 'utf-8');
assert(!progressTsx.includes('Pilotkurs (3 uppdrag)'), 'progress.tsx does not contain "Pilotkurs (3 uppdrag)"');
assert(!progressTsx.includes('Pilotuppdrag A1'), 'progress.tsx does not contain "Pilotuppdrag A1"');
assert(!progressTsx.includes('de tre pilotuppdragen'), 'progress.tsx does not contain "de tre pilotuppdragen"');

console.log('\n--- 5. Testing Chapters Structure ---');
assert(a1Chapters.length === 3, `Chapters count is 3 (got ${a1Chapters.length})`);
assert(a1Chapters[0].missions.length === 4, `Chapter 1 has 4 missions (got ${a1Chapters[0].missions.length})`);
assert(a1Chapters[1].missions.length === 4, `Chapter 2 has 4 missions (got ${a1Chapters[1].missions.length})`);
assert(a1Chapters[2].missions.length === 4, `Chapter 3 has 4 missions (got ${a1Chapters[2].missions.length})`);

if (failed) {
  console.error('\n❌ Parity tests failed!');
  process.exit(1);
} else {
  console.log('\n🎉 ALL PARITY TESTS PASSED PERFECTLY!\n');
}
