-- ============================================================================
-- SWEDISHFLOW MIGRATION: 20260103000000_normalize_exercise_content.sql
-- Purpose: Normalize exercise content, fix syllable phonetics, canonicalize
--          blank markers to {blank}, and ensure pedagogical accuracy across
--          all 12 A1 missions idempotently.
-- ============================================================================

DO $$
BEGIN
  -- 1. Normalize u1_b7_speak phonetic hint and tips
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    jsonb_set(
      content,
      '{exercise,phoneticHint}',
      '"God mor-gon! Hur m\u00e5r du?"'::jsonb
    ),
    '{exercise,tips}',
    '"L\u00e5ngt o-ljud i \"God\" och \"morgon\". Mjukt u-ljud i \"Hur\" och \"du\"."'::jsonb
  )
  WHERE id = 'u1_b7_speak';

  -- 2. Normalize u2_b3_sentence instruction
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    content,
    '{exercise,instruction}',
    '"Bygg en mening d\u00e4r du presenterar dig som Elena:"'::jsonb
  )
  WHERE id = 'u2_b3_sentence';

  -- 3. Normalize u2_b4_fill sentence marker
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    content,
    '{exercise,sentence}',
    '"Vad {blank} du?"'::jsonb
  )
  WHERE id = 'u2_b4_fill';

  -- 4. Normalize u4_b3_fill sentence marker
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    content,
    '{exercise,sentence}',
    '"Jag {blank} i Malm\u00f6."'::jsonb
  )
  WHERE id = 'u4_b3_fill';

  -- 5. Normalize u4_b4_speak phonetic hint and tips
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    jsonb_set(
      content,
      '{exercise,phoneticHint}',
      '"Jag bor i en l\u00e4-gen-het i Stock-holm."'::jsonb
    ),
    '{exercise,tips}',
    '"Betona \"bor\" och f\u00f6rsta stavelsen i \"l\u00e4-gen-het\"."'::jsonb
  )
  WHERE id = 'u4_b4_speak';

  -- 6. Normalize u6_b3_sentence instruction
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    content,
    '{exercise,instruction}',
    '"Bygg en mening d\u00e4r du ber\u00e4ttar att du arbetar som ingenj\u00f6r:"'::jsonb
  )
  WHERE id = 'u6_b3_sentence';

  -- 7. Normalize u7_b3_speak phonetic hint and tips
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    jsonb_set(
      content,
      '{exercise,phoneticHint}',
      '"Jag pra-tar li-te svens-ka och bra eng-els-ka."'::jsonb
    ),
    '{exercise,tips}',
    '"Kort e-ljud i \"lite\". Tydligt k-ljud i \"svenska\"."'::jsonb
  )
  WHERE id = 'u7_b3_speak';

  -- 8. Normalize u10_b3_fill sentence marker
  UPDATE public.lesson_blocks
  SET content = jsonb_set(
    content,
    '{exercise,sentence}',
    '"Vad {blank} den h\u00e4r osten?"'::jsonb
  )
  WHERE id = 'u10_b3_fill';

END $$;
