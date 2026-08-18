-- ============================================================================
-- SWEDISHFLOW (SFI A1) - SUPABASE PRODUCTION DATABASE SCHEMA & MIGRATION
-- Version: 20260101000000
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER ROLES ENUM & SEPARATE USER_ROLES TABLE (Strict RBAC)
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Dedicated roles table (Only managed by server / admin, not user-editable)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'student',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Helper function to check if a user is admin (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = is_admin.user_id AND role = 'admin'
    );
$$;

-- 2. USER PROFILES TABLE (User-editable profile metadata only, NO role column)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL DEFAULT '',
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    preferred_locale TEXT DEFAULT 'sv',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to create profile and default student role upon new auth user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        updated_at = now();

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. LEVELS TABLE
CREATE TABLE IF NOT EXISTS public.levels (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- e.g. 'A1', 'A2'
    title TEXT NOT NULL,
    description TEXT,
    order_num INT NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.missions (
    id TEXT PRIMARY KEY,
    level_code TEXT NOT NULL REFERENCES public.levels(code) ON DELETE CASCADE,
    order_num INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_minutes INT NOT NULL DEFAULT 7,
    total_points INT NOT NULL DEFAULT 50,
    skills TEXT[] DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',
    knowledge_outcomes TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_missions_order ON public.missions(level_code, order_num);
CREATE INDEX IF NOT EXISTS idx_missions_published ON public.missions(is_published);

-- 5. LESSON BLOCKS TABLE (Public content for students, without secret answer keys)
CREATE TABLE IF NOT EXISTS public.lesson_blocks (
    id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    order_num INT NOT NULL,
    block_type TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    required BOOLEAN NOT NULL DEFAULT true,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lesson_blocks_mission ON public.lesson_blocks(mission_id, order_num);

-- 6. PRIVATE LESSON BLOCK GRADING KEYS (Server-only facit & grading configuration)
CREATE TABLE IF NOT EXISTS public.lesson_block_grading_keys (
    block_id TEXT PRIMARY KEY REFERENCES public.lesson_blocks(id) ON DELETE CASCADE,
    mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    correct_answer JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_grading_keys_mission ON public.lesson_block_grading_keys(mission_id);

-- 7. USER PROGRESSION TABLE (Server Authoritative)
CREATE TABLE IF NOT EXISTS public.user_progression (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    unlocked_level TEXT NOT NULL DEFAULT 'A1',
    current_streak INT NOT NULL DEFAULT 1,
    points INT NOT NULL DEFAULT 0,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. MISSION ATTEMPTS & COMPLETIONS
CREATE TABLE IF NOT EXISTS public.mission_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    idempotency_key TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    correct_count INT NOT NULL DEFAULT 0,
    total_exercises INT NOT NULL DEFAULT 0,
    earned_points INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_mission ON public.mission_attempts(user_id, mission_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_user_idempotency ON public.mission_attempts(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- 9. SAVED VOCABULARY & PHRASES (Språkboken)
CREATE TABLE IF NOT EXISTS public.saved_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    swedish TEXT NOT NULL,
    translation TEXT,
    category TEXT NOT NULL DEFAULT 'Allmänt',
    explanation TEXT,
    example TEXT,
    mission_id TEXT REFERENCES public.missions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_saved_vocab_user ON public.saved_vocabulary(user_id);

-- 10. AUDIT LOGS FOR ADMIN ACTIONS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_block_grading_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- User Roles policies (Students only read their own role; only admins can write)
CREATE POLICY "Users can read their own role"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins have full access to user roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Profiles policies (Users can only update basic profile fields)
CREATE POLICY "Users can read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin(auth.uid()));

-- Levels policies
CREATE POLICY "Anyone can view published levels"
    ON public.levels FOR SELECT
    USING (is_published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins have full access to levels"
    ON public.levels FOR ALL
    USING (public.is_admin(auth.uid()));

-- Missions policies
CREATE POLICY "Anyone can view published missions"
    ON public.missions FOR SELECT
    USING (is_published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins have full access to missions"
    ON public.missions FOR ALL
    USING (public.is_admin(auth.uid()));

-- Lesson blocks policies (Public student content)
CREATE POLICY "Anyone can view blocks for published missions"
    ON public.lesson_blocks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.missions m
            WHERE m.id = public.lesson_blocks.mission_id AND m.is_published = true
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "Admins have full access to lesson blocks"
    ON public.lesson_blocks FOR ALL
    USING (public.is_admin(auth.uid()));

-- Private lesson block grading keys (STRICT: ZERO student access; only Admin & SECURITY DEFINER functions)
CREATE POLICY "Admins have full access to grading keys"
    ON public.lesson_block_grading_keys FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- User progression policies (Strict Server Authoritative: Only SELECT for users; mutation ONLY via complete_mission_attempt RPC or Admin)
CREATE POLICY "Users can view their own progression"
    ON public.user_progression FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins have full access to user progression"
    ON public.user_progression FOR ALL
    USING (public.is_admin(auth.uid()));

-- Mission attempts policies (Strict Server Authoritative: Only SELECT for users; mutation ONLY via complete_mission_attempt RPC or Admin)
CREATE POLICY "Users can view their own attempts"
    ON public.mission_attempts FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins have full access to mission attempts"
    ON public.mission_attempts FOR ALL
    USING (public.is_admin(auth.uid()));

-- Saved vocabulary policies
CREATE POLICY "Users can manage their own saved vocabulary"
    ON public.saved_vocabulary FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Admins can view and create audit logs"
    ON public.admin_audit_logs FOR ALL
    USING (public.is_admin(auth.uid()));

-- ============================================================================
-- SECURE SERVER RPC: ATOMIC SERVER-SIDE GRADED MISSION COMPLETION
-- ============================================================================

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
    v_correct_count INT := 0;
    v_total_exercises INT := 0;
    v_earned_points INT := 0;
    v_new_total_points INT := 0;
    v_is_first_completion BOOLEAN := false;
    v_is_user_admin BOOLEAN := false;
    v_user_answer JSONB;
    v_is_block_correct BOOLEAN;
    v_existing_attempt RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Idempotency check: if already processed with this key, return existing result safely
    IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
        SELECT * INTO v_existing_attempt
        FROM public.mission_attempts
        WHERE user_id = v_user_id AND idempotency_key = p_idempotency_key;

        IF FOUND THEN
            SELECT points INTO v_new_total_points FROM public.user_progression WHERE user_id = v_user_id;
            RETURN jsonb_build_object(
                'success', true,
                'mission_id', p_mission_id,
                'earned_points', v_existing_attempt.earned_points,
                'correct_count', v_existing_attempt.correct_count,
                'total_exercises', v_existing_attempt.total_exercises,
                'is_first_completion', false,
                'total_user_points', COALESCE(v_new_total_points, 0),
                'idempotent_replay', true
            );
        END IF;
    END IF;

    -- Check if admin
    v_is_user_admin := public.is_admin(v_user_id);

    -- Validate mission exists and is published (or caller is admin)
    SELECT * INTO v_mission FROM public.missions WHERE id = p_mission_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Mission not found';
    END IF;

    IF v_mission.is_published = false AND NOT v_is_user_admin THEN
        RAISE EXCEPTION 'Cannot complete unpublished mission';
    END IF;

    -- Loop through all server-stored grading keys for this specific mission
    FOR v_key IN
        SELECT * FROM public.lesson_block_grading_keys
        WHERE mission_id = p_mission_id
        ORDER BY block_id ASC
    LOOP
        v_total_exercises := v_total_exercises + 1;
        v_user_answer := p_user_answers -> v_key.block_id;
        v_is_block_correct := false;

        IF v_user_answer IS NOT NULL THEN
            IF v_key.block_type IN ('multiple_choice', 'listen_choice', 'fill_blank') THEN
                -- Check selected option ID or text against answer key
                IF (v_user_answer #>> '{}') = (v_key.correct_answer ->> 'correctOptionId')
                   OR (v_user_answer #>> '{}') = (v_key.correct_answer ->> 'correctAnswer') THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type = 'sentence_builder' THEN
                -- Check JSON array equality
                IF v_user_answer = (v_key.correct_answer -> 'correctSequence') THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type = 'matching' THEN
                -- Check JSON object key-value pairs equality
                IF v_user_answer = (v_key.correct_answer -> 'pairs') THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type = 'free_text' THEN
                -- Deterministic regex or length verification on server
                IF (v_key.correct_answer ->> 'regexPattern') IS NOT NULL AND (v_key.correct_answer ->> 'regexPattern') <> '.*' THEN
                    IF (v_user_answer #>> '{}') ~* (v_key.correct_answer ->> 'regexPattern') THEN
                        v_is_block_correct := true;
                    END IF;
                ELSIF length(trim(COALESCE(v_user_answer #>> '{}', ''))) >= 3 THEN
                    v_is_block_correct := true;
                END IF;
            ELSIF v_key.block_type IN ('speak', 'ai_roleplay') THEN
                -- Engagement validation
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
        now()
    );

    -- Upsert user progression atomically
    INSERT INTO public.user_progression (user_id, points, current_streak, last_active_at)
    VALUES (v_user_id, v_earned_points, 1, now())
    ON CONFLICT (user_id) DO UPDATE
    SET points = public.user_progression.points + CASE WHEN v_is_first_completion THEN v_earned_points ELSE 0 END,
        last_active_at = now()
    RETURNING points INTO v_new_total_points;

    RETURN jsonb_build_object(
        'success', true,
        'mission_id', p_mission_id,
        'earned_points', v_earned_points,
        'correct_count', v_correct_count,
        'total_exercises', v_total_exercises,
        'is_first_completion', v_is_first_completion,
        'total_user_points', v_new_total_points
    );
END;
$$;

-- Secure function permissions
REVOKE ALL ON FUNCTION public.complete_mission_attempt(TEXT, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_mission_attempt(TEXT, JSONB, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_mission_attempt(TEXT, JSONB, TEXT) TO authenticated, service_role;

-- ============================================================================
-- SEED DATA: A1 LEVEL & 12 MISSIONS
-- ============================================================================

INSERT INTO public.levels (id, code, title, description, order_num, is_published)
VALUES ('lvl-a1', 'A1', 'SFI Kurs A1 - Grundläggande svenska', 'Grundkurs för nybörjare i svenska språket.', 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.missions (id, level_code, order_num, title, description, estimated_minutes, total_points, skills, goals, knowledge_outcomes, is_published)
VALUES
('1', 'A1', 1, 'Hälsa och säga hej', 'Lär dig vanliga hälsningsfraser, enkla svar och artighetsord i vardagen.', 6, 50, ARRAY['Vokabulär', 'Dialog'], ARRAY['Hälsa på någon', 'Svara på hälsning', 'Säga hejdå'], ARRAY['Kan använda Hej, God morgon, Hur mår du?'], true),
('2', 'A1', 2, 'Presentera dig själv', 'Träna på att berätta vad du heter, var du kommer ifrån och vilket språk du talar.', 7, 50, ARRAY['Grammatik', 'Presentation'], ARRAY['Säga ditt namn', 'Berätta hemland', 'Nämn språk'], ARRAY['Meningar med heter, kommer från, talar'], true),
('3', 'A1', 3, 'Siffror och räkna 0–20', 'Lär dig räkna från noll till tjugo, ange telefonnummer och fråga om antal.', 6, 50, ARRAY['Siffror', 'Hörförståelse'], ARRAY['Räkna 0-20', 'Ange telefonnummer', 'Fråga hur många'], ARRAY['Förstå och uttala siffror korrekt'], true),
('4', 'A1', 4, 'Familj och relationer', 'Ord för familjemedlemmar, pronomen (min, din) och enkel beskrivning av familj.', 8, 50, ARRAY['Vokabulär', 'Grammatik'], ARRAY['Namnge familjemedlemmar', 'Använda min/mitt/mina'], ARRAY['Beskriva sin familjesituation'], true),
('5', 'A1', 5, 'Klockan och tider', 'Lär dig fråga vad klockan är, förstå hela och halva timmar samt tidsuttryck.', 7, 50, ARRAY['Tid', 'Hörförståelse'], ARRAY['Fråga om klockan', 'Svara med halv/över/i', 'Boka enkel tid'], ARRAY['Förstå vanliga tidsangivelser'], true),
('6', 'A1', 6, 'Veckodagar och månader', 'Veckans sju dagar, årets tolv månader och ordningstal för datum.', 6, 50, ARRAY['Kalender', 'Vokabulär'], ARRAY['Räkna upp veckodagar', 'Känna igen månader', 'Säga födelsedatum'], ARRAY['Orientera sig i en svensk kalender'], true),
('7', 'A1', 7, 'Handla mat i affären', 'Ord för vanliga livsmedel, fråga om pris och enkla fraser i kassan.', 8, 50, ARRAY['Praktisk svenska', 'Dialog'], ARRAY['Hitta matvaror', 'Fråga vad det kostar', 'Betala i kassan'], ARRAY['Genomföra ett enkelt köp i mataffär'], true),
('8', 'A1', 8, 'Färger och kläder', 'Grundläggande färger, klädesplagg och adjektivens böjning (en/ett).', 7, 50, ARRAY['Adjektiv', 'Vokabulär'], ARRAY['Beskriva kläder', 'Använda färgord', 'Böja adjektiv'], ARRAY['Beskriva vad någon har på sig'], true),
('9', 'A1', 9, 'Boende och hemmet', 'Ord för rum, möbler och att beskriva sin bostad (lägenhet eller hus).', 8, 50, ARRAY['Vokabulär', 'Beskrivning'], ARRAY['Namnge rum och möbler', 'Beskriva bostad', 'Använda prepositioner'], ARRAY['Berätta om sitt hem'], true),
('10', 'A1', 10, 'Kroppen och hälsa', 'Kroppsdelar, vanliga symptom och hur du förklarar för vårdpersonal hur du mår.', 8, 50, ARRAY['Hälsa', 'Praktisk svenska'], ARRAY['Namnge kroppsdelar', 'Uttrycka smärta/symptom', 'Enkelt vårdmöte'], ARRAY['Kommunicera vid enklare sjukdom'], true),
('11', 'A1', 11, 'Väder och årstider', 'Ord för väderlekar, temperatur, Sveriges fyra årstider och småprat om vädret.', 7, 50, ARRAY['Småprat', 'Vokabulär'], ARRAY['Beskriva dagens väder', 'Sveriges årstider', 'Småprata om vädret'], ARRAY['Förstå en väderprognos och delta i vardagssamtal'], true),
('12', 'A1', 12, 'A1-repetition och vardagssamtal', 'Slutprov och repetition av hela A1-kursen med blandade övningar och dialoger.', 10, 50, ARRAY['Repetition', 'Samtal'], ARRAY['Repetera alla A1-moment', 'Genomföra längre dialog', 'Sluttest'], ARRAY['A1-nivå bekräftad och klar för A2!'], true)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    order_num = EXCLUDED.order_num,
    skills = EXCLUDED.skills,
    goals = EXCLUDED.goals,
    knowledge_outcomes = EXCLUDED.knowledge_outcomes;

-- ============================================================================
-- STORAGE BUCKETS & POLICIES (audio-lessons & course-media)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('audio-lessons', 'audio-lessons', true, 15728640, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/webm', 'audio/x-m4a']),
  ('course-media', 'course-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Public read for published audio lessons and course media
DROP POLICY IF EXISTS "Public can view audio-lessons" ON storage.objects;
CREATE POLICY "Public can view audio-lessons"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-lessons');

DROP POLICY IF EXISTS "Public can view course-media" ON storage.objects;
CREATE POLICY "Public can view course-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-media');

-- Storage RLS: Admin-only upload, update, delete
DROP POLICY IF EXISTS "Admins can upload to audio-lessons" ON storage.objects;
CREATE POLICY "Admins can upload to audio-lessons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-lessons' 
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can update audio-lessons" ON storage.objects;
CREATE POLICY "Admins can update audio-lessons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audio-lessons' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'audio-lessons' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete audio-lessons" ON storage.objects;
CREATE POLICY "Admins can delete audio-lessons"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio-lessons' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload to course-media" ON storage.objects;
CREATE POLICY "Admins can upload to course-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-media' 
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can update course-media" ON storage.objects;
CREATE POLICY "Admins can update course-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'course-media' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'course-media' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete course-media" ON storage.objects;
CREATE POLICY "Admins can delete course-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-media' AND public.is_admin(auth.uid()));

