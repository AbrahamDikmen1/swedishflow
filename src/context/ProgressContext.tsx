import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mission } from '../types/mission';
import { Chapter } from '../types/chapter';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useCourse } from './CourseContext';

export interface MissionCompletionPayload {
  userAnswers?: Record<string, any>;
  idempotencyKey?: string;
  correctCount?: number;
  totalExercises?: number;
}

export interface MissionCompletionResult {
  success: boolean;
  earnedPoints?: number;
  isFirstCompletion?: boolean;
  totalUserPoints?: number;
  correctCount?: number;
  totalExercises?: number;
  error?: string;
}

interface ProgressContextType {
  completedMissionIds: string[];
  totalPoints: number;
  currentStreak: number;
  isLoading: boolean;
  serverError: string | null;
  completeMission: (
    missionId: string,
    payload?: MissionCompletionPayload
  ) => Promise<MissionCompletionResult>;
  resetProgress: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  missions: Mission[];
  chapters: Chapter[];
  activeMission: Mission;
  getMissionStatus: (missionId: string) => 'completed' | 'active' | 'locked';
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { missions: rawMissions, chapters: rawChapters } = useCourse();

  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string | null>(null);

  // Storage key generator namespaced strictly by User ID
  const getStorageKeys = useCallback((userId?: string) => {
    const safeId = userId || 'anonymous_demo';
    return {
      progressKey: `@swedishflow_progress_v4_${safeId}`,
      pointsKey: `@swedishflow_points_v4_${safeId}`,
      cacheKey: `@swedishflow_cache_v4_${safeId}`,
    };
  }, []);

  /**
   * Load official progression.
   * Supabase is the sole source of truth when configured and authenticated.
   */
  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    setServerError(null);

    const { progressKey, pointsKey, cacheKey } = getStorageKeys(user?.id);

    try {
      if (isSupabaseConfigured() && user && !user.isDemo) {
        // Query official Supabase progression
        const { data: progData, error: progError } = await supabase
          .from('user_progression')
          .select('unlocked_level, current_streak, points')
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: attempts, error: attemptsError } = await supabase
          .from('mission_attempts')
          .select('mission_id, is_completed, earned_points')
          .eq('user_id', user.id)
          .eq('is_completed', true);

        if (progError || attemptsError) {
          const errText = progError?.message || attemptsError?.message || 'Kunde inte hämta progression från servern.';
          setServerError(errText);
          console.warn('Supabase progression fetch error:', errText);

          // Fall back to read-only local cache for this specific user if server unreachable
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setCompletedMissionIds(parsed.completedMissionIds || []);
              setTotalPoints(parsed.totalPoints || 0);
              setCurrentStreak(parsed.currentStreak || 1);
            } catch (ignore) {}
          } else {
            setCompletedMissionIds([]);
            setTotalPoints(0);
            setCurrentStreak(1);
          }
          return;
        }

        const completedIds = attempts && attempts.length > 0
          ? Array.from(new Set(attempts.map((a: any) => String(a.mission_id))))
          : [];

        const points = progData?.points ?? 0;
        const streak = progData?.current_streak ?? 1;

        setCompletedMissionIds(completedIds);
        setTotalPoints(points);
        setCurrentStreak(streak);

        // Update read-only client cache for this specific user
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            completedMissionIds: completedIds,
            totalPoints: points,
            currentStreak: streak,
            cachedAt: new Date().toISOString(),
          })
        );
      } else {
        // Local isolated storage for demo/unauthenticated mode
        const storedIds = await AsyncStorage.getItem(progressKey);
        const storedPoints = await AsyncStorage.getItem(pointsKey);

        if (storedIds) {
          try {
            const parsed = JSON.parse(storedIds);
            setCompletedMissionIds(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setCompletedMissionIds([]);
          }
        } else {
          setCompletedMissionIds([]);
        }

        if (storedPoints) {
          setTotalPoints(parseInt(storedPoints, 10) || 0);
        } else {
          setTotalPoints(0);
        }
      }
    } catch (e: any) {
      console.warn('Failed to load progress', e);
      setServerError(e?.message || 'Ett fel uppstod vid laddning av framsteg.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.isDemo, getStorageKeys]);

  // Re-run whenever active user changes to prevent cross-account data leaks
  useEffect(() => {
    setCompletedMissionIds([]);
    setTotalPoints(0);
    loadProgress();
  }, [user?.id, loadProgress]);

  /**
   * Complete mission attempt.
   * When authenticated with Supabase: calls server-side grading RPC complete_mission_attempt.
   * Official completion & points are strictly calculated on the server from private answer keys.
   */
  const completeMission = async (
    missionId: string,
    payload?: MissionCompletionPayload
  ): Promise<MissionCompletionResult> => {
    const { progressKey, pointsKey, cacheKey } = getStorageKeys(user?.id);
    const mission = rawMissions.find((m) => m.id === missionId);
    const maxPoints = mission?.totalPoints || 50;

    const rawAnswers = payload?.userAnswers || {};
    const idempotencyKey = payload?.idempotencyKey || `${user?.id || 'demo'}_${missionId}_${Date.now()}`;

    if (isSupabaseConfigured() && user && !user.isDemo) {
      try {
        const { data, error } = await supabase.rpc('complete_mission_attempt', {
          p_mission_id: missionId,
          p_user_answers: rawAnswers,
          p_idempotency_key: idempotencyKey,
        });

        if (error) {
          console.error('Server failed to complete mission attempt:', error);
          setServerError(error.message);
          return {
            success: false,
            error: error.message || 'Kunde inte spara framsteg på servern.',
          };
        }

        // RPC succeeded: update client state directly from official server response
        const earned = data?.earned_points ?? 0;
        const newTotalPoints = data?.total_user_points ?? (totalPoints + (data?.is_first_completion ? earned : 0));
        const updatedIds = Array.from(new Set([...completedMissionIds, missionId]));

        setCompletedMissionIds(updatedIds);
        setTotalPoints(newTotalPoints);
        setServerError(null);

        // Update read-only user cache
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            completedMissionIds: updatedIds,
            totalPoints: newTotalPoints,
            currentStreak,
            cachedAt: new Date().toISOString(),
          })
        );

        return {
          success: true,
          earnedPoints: earned,
          isFirstCompletion: data?.is_first_completion ?? false,
          totalUserPoints: newTotalPoints,
          correctCount: data?.correct_count,
          totalExercises: data?.total_exercises,
        };
      } catch (err: any) {
        console.error('Unexpected RPC completion error:', err);
        setServerError(err?.message || 'Serverfel vid slutförande.');
        return {
          success: false,
          error: err?.message || 'Nätverksfel vid slutförande.',
        };
      }
    } else {
      // Local/Demo Mode
      const correct = payload?.correctCount ?? 1;
      const total = payload?.totalExercises ?? 1;
      const earned = Math.round((correct / Math.max(total, 1)) * maxPoints);

      const isAlreadyCompleted = completedMissionIds.includes(missionId);
      const newPoints = totalPoints + (isAlreadyCompleted ? 0 : earned);
      const updatedIds = Array.from(new Set([...completedMissionIds, missionId]));

      setCompletedMissionIds(updatedIds);
      setTotalPoints(newPoints);

      await AsyncStorage.setItem(progressKey, JSON.stringify(updatedIds));
      await AsyncStorage.setItem(pointsKey, String(newPoints));

      return {
        success: true,
        earnedPoints: earned,
        isFirstCompletion: !isAlreadyCompleted,
        totalUserPoints: newPoints,
        correctCount: correct,
        totalExercises: total,
      };
    }
  };

  /**
   * Reset progress for the active account
   */
  const resetProgress = async () => {
    const { progressKey, pointsKey, cacheKey } = getStorageKeys(user?.id);
    setCompletedMissionIds([]);
    setTotalPoints(0);

    try {
      await AsyncStorage.removeItem(progressKey);
      await AsyncStorage.removeItem(pointsKey);
      await AsyncStorage.removeItem(cacheKey);

      if (isSupabaseConfigured() && user && !user.isDemo) {
        // Delete attempts for current user
        await supabase.from('mission_attempts').delete().eq('user_id', user.id);
        await supabase
          .from('user_progression')
          .update({ points: 0, current_streak: 1, last_active_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    } catch (e) {
      console.warn('Failed to reset progress storage', e);
    }
  };

  // Filter missions: students only see published missions; admins see all
  const visibleMissions = isAdmin
    ? rawMissions
    : rawMissions.filter((m) => m.isPublished !== false);

  const getMissionStatus = useCallback(
    (missionId: string): 'completed' | 'active' | 'locked' => {
      if (completedMissionIds.includes(missionId)) {
        return 'completed';
      }
      const index = visibleMissions.findIndex((m) => m.id === missionId);
      if (index === -1) return 'locked';
      if (index === 0) return 'active';

      const prevMission = visibleMissions[index - 1];
      if (prevMission && completedMissionIds.includes(prevMission.id)) {
        return 'active';
      }
      return 'locked';
    },
    [completedMissionIds, visibleMissions]
  );

  const derivedMissions: Mission[] = visibleMissions.map((m) => ({
    ...m,
    status: getMissionStatus(m.id),
  }));

  const derivedChapters: Chapter[] = rawChapters.map((ch) => ({
    ...ch,
    missions: ch.missions
      .filter((m) => isAdmin || m.isPublished !== false)
      .map((m) => ({
        ...m,
        status: getMissionStatus(m.id),
      })),
  }));

  const activeMission =
    derivedMissions.find((m) => m.status === 'active') ||
    derivedMissions[derivedMissions.length - 1] ||
    derivedMissions[0] || {
      id: '1',
      order: 1,
      title: 'Hälsa och säga hej',
      description: 'Lär dig vanliga hälsningsfraser.',
      status: 'active',
      estimatedMinutes: 6,
    };

  return (
    <ProgressContext.Provider
      value={{
        completedMissionIds,
        totalPoints,
        currentStreak,
        isLoading,
        serverError,
        completeMission,
        resetProgress,
        refreshProgress: loadProgress,
        missions: derivedMissions,
        chapters: derivedChapters,
        activeMission,
        getMissionStatus,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
