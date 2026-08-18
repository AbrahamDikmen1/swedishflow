import * as fs from 'fs';
import * as path from 'path';
import { a1Missions, a1Lessons } from '../src/data/a1CourseData';

function escapeSqlString(str?: string): string {
  if (str === null || str === undefined) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function escapeSqlJson(obj: any): string {
  if (obj === null || obj === undefined) return "'{}'::jsonb";
  const jsonStr = JSON.stringify(obj);
  return "'" + jsonStr.replace(/'/g, "''") + "'::jsonb";
}

function escapeSqlArray(arr: string[]): string {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "'{}'::text[]";
  return "ARRAY[" + arr.map((item) => escapeSqlString(item)).join(', ') + "]::text[]";
}

let sql = `-- ============================================================================
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
`;

const missionValues: string[] = [];
for (const m of a1Missions) {
  missionValues.push(`  (
    ${escapeSqlString(m.id)},
    ${escapeSqlString(m.levelCode)},
    ${m.order},
    ${escapeSqlString(m.title)},
    ${escapeSqlString(m.description)},
    ${m.estimatedMinutes},
    ${m.totalPoints || 50},
    ${escapeSqlArray(m.skills || [])},
    ${escapeSqlArray(m.goals || [])},
    ${escapeSqlArray(m.knowledgeOutcomes || [])},
    ${m.isPublished ? 'true' : 'false'}
  )`);
}

sql += missionValues.join(',\n') + `
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
`;

const blockValues: string[] = [];
const gradingKeyValues: string[] = [];

let totalBlocks = 0;
let totalGradingKeys = 0;

for (const m of a1Missions) {
  const lesson = a1Lessons[m.id];
  if (!lesson) continue;

  for (let i = 0; i < lesson.blocks.length; i++) {
    const b = lesson.blocks[i];
    totalBlocks++;

    // Extract content (everything except id, type, skills, required)
    const { id, type, skills, required, ...restContent } = b as any;

    blockValues.push(`  (
    ${escapeSqlString(b.id)},
    ${escapeSqlString(m.id)},
    ${i + 1},
    ${escapeSqlString(b.type)},
    ${escapeSqlArray((b.skills as string[]) || [])},
    ${b.required ? 'true' : 'false'},
    ${escapeSqlJson(restContent)}
  )`);

    // Determine private grading key
    let correctAnswer: any = null;

    if (b.type === 'multiple_choice' || b.type === 'listen_choice') {
      correctAnswer = {
        correctIndex: b.exercise?.correctIndex,
        correctOption: b.exercise?.options?.[b.exercise?.correctIndex] || '',
        explanationCorrect: b.exercise?.explanationCorrect || '',
        explanationIncorrect: b.exercise?.explanationIncorrect || '',
      };
    } else if (b.type === 'sentence_builder') {
      correctAnswer = {
        correctSentence: b.exercise?.correctSentence || '',
        initialWords: b.exercise?.initialWords || [],
        explanationCorrect: b.exercise?.explanationCorrect || '',
        explanationIncorrect: b.exercise?.explanationIncorrect || '',
      };
    } else if (b.type === 'fill_blank') {
      correctAnswer = {
        correctAnswer: b.exercise?.correctAnswer || '',
        explanationCorrect: b.exercise?.explanationCorrect || '',
        explanationIncorrect: b.exercise?.explanationIncorrect || '',
      };
    } else if (b.type === 'matching') {
      const pairsMap: Record<string, string> = {};
      if (Array.isArray(b.exercise?.pairs)) {
        for (const p of b.exercise.pairs) {
          pairsMap[p.id] = p.answer;
        }
      }
      correctAnswer = {
        pairs: pairsMap,
        explanationCorrect: b.exercise?.explanationCorrect || '',
      };
    } else if (b.type === 'free_text') {
      correctAnswer = {
        regexPattern: b.exercise?.regexPattern || '.*',
        explanationCorrect: b.exercise?.explanationCorrect || '',
        explanationIncorrect: b.exercise?.explanationIncorrect || '',
        aiFeedbackPrompt: b.exercise?.aiFeedbackPrompt || '',
      };
    } else if (b.type === 'speak') {
      correctAnswer = {
        targetPhrase: b.exercise?.targetPhrase || '',
      };
    } else if (b.type === 'ai_roleplay') {
      correctAnswer = {
        goalDescription: b.exercise?.goalDescription || '',
        characterName: b.exercise?.characterName || '',
      };
    }

    if (correctAnswer) {
      totalGradingKeys++;
      gradingKeyValues.push(`  (
    ${escapeSqlString(b.id)},
    ${escapeSqlString(m.id)},
    ${escapeSqlString(b.type)},
    ${escapeSqlJson(correctAnswer)}
  )`);
    }
  }
}

sql += blockValues.join(',\n') + `
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
`;

sql += gradingKeyValues.join(',\n') + `
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
`;

const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260101000001_align_a1_course_with_customer_spec.sql');
fs.writeFileSync(migrationPath, sql, 'utf-8');

console.log(`Generated migration: ${migrationPath}`);
console.log(`Summary: ${a1Missions.length} missions, ${totalBlocks} lesson blocks, ${totalGradingKeys} private grading keys.`);
