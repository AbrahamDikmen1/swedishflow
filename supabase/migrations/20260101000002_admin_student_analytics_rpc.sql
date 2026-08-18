-- ============================================================================
-- SWEDISHFLOW - SECURE ADMIN STUDENT ANALYTICS RPC
-- Version: 20260101000002
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_get_student_analytics()
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    completed_missions_count BIGINT,
    total_points INT,
    current_streak INT,
    last_active TIMESTAMPTZ,
    level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Verify server-side that caller is admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id AS user_id,
        COALESCE(NULLIF(p.full_name, ''), p.email, 'Elev') AS full_name,
        p.email,
        COUNT(DISTINCT ma.mission_id) FILTER (WHERE ma.is_completed = true) AS completed_missions_count,
        COALESCE(prog.points, 0)::INT AS total_points,
        COALESCE(prog.current_streak, 1)::INT AS current_streak,
        COALESCE(prog.last_active_at, p.updated_at, p.created_at) AS last_active,
        COALESCE(prog.unlocked_level, 'A1') AS level
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON ur.user_id = p.id
    LEFT JOIN public.user_progression prog ON prog.user_id = p.id
    LEFT JOIN public.mission_attempts ma ON ma.user_id = p.id
    WHERE ur.role = 'student'
    GROUP BY p.id, p.full_name, p.email, prog.points, prog.current_streak, prog.last_active_at, prog.unlocked_level, p.updated_at, p.created_at
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant explicit execute permissions to authenticated users (function body verifies is_admin)
REVOKE ALL ON FUNCTION public.admin_get_student_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_student_analytics() TO authenticated;
