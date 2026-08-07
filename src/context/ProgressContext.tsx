import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { a1Missions, a1Chapters } from '../data/a1CourseData';
import { Mission } from '../types/mission';
import { Chapter } from '../types/chapter';

const STORAGE_KEY = '@swedishflow_completed_missions';

interface ProgressContextType {
  completedMissionIds: string[];
  isLoading: boolean;
  completeMission: (missionId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  missions: Mission[];
  chapters: Chapter[];
  activeMission: Mission;
  getMissionStatus: (missionId: string) => 'completed' | 'active' | 'locked';
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((id): id is string => typeof id === 'string');
          setCompletedMissionIds(valid);
        }
      }
    } catch (e) {
      console.warn('Failed to load progress from AsyncStorage', e);
    } finally {
      setIsLoading(false);
    }
  };

  const completeMission = async (missionId: string) => {
    try {
      if (!completedMissionIds.includes(missionId)) {
        const updated = [...completedMissionIds, missionId];
        setCompletedMissionIds(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to save progress to AsyncStorage', e);
    }
  };

  const resetProgress = async () => {
    try {
      setCompletedMissionIds([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset progress', e);
    }
  };

  if (typeof window !== 'undefined') {
    (window as any).__resetProgress = resetProgress;
  }

  const getMissionStatus = (missionId: string): 'completed' | 'active' | 'locked' => {
    if (completedMissionIds.includes(missionId)) {
      return 'completed';
    }
    const index = a1Missions.findIndex((m) => m.id === missionId);
    if (index === -1) return 'locked';
    if (index === 0) return 'active';

    const prevMission = a1Missions[index - 1];
    if (prevMission && completedMissionIds.includes(prevMission.id)) {
      return 'active';
    }
    return 'locked';
  };

  const derivedMissions: Mission[] = a1Missions.map((m) => ({
    ...m,
    status: getMissionStatus(m.id),
  }));

  const derivedChapters: Chapter[] = a1Chapters.map((ch) => ({
    ...ch,
    missions: ch.missions.map((m) => ({
      ...m,
      status: getMissionStatus(m.id),
    })),
  }));

  const activeMission =
    derivedMissions.find((m) => m.status === 'active') ||
    derivedMissions[derivedMissions.length - 1] ||
    derivedMissions[0];

  return (
    <ProgressContext.Provider
      value={{
        completedMissionIds,
        isLoading,
        completeMission,
        resetProgress,
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
