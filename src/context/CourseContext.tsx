import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Mission } from '../types/mission';
import { Chapter } from '../types/chapter';
import { LessonBlock, LessonData } from '../types/lesson';
import { courseService, StudentProgressSummary } from '../services/courseService';

interface CourseContextType {
  missions: Mission[];
  chapters: Chapter[];
  isLoading: boolean;
  createMission: (data: Partial<Mission>) => Promise<Mission>;
  updateMission: (id: string, updates: Partial<Mission>) => Promise<Mission>;
  deleteMission: (id: string) => Promise<void>;
  duplicateMission: (id: string) => Promise<Mission>;
  reorderMissions: (orderedIds: string[]) => Promise<void>;
  togglePublishMission: (id: string, isPublished: boolean) => Promise<Mission>;
  getLesson: (missionId: string) => Promise<LessonData | null>;
  addBlock: (missionId: string, block: LessonBlock) => Promise<LessonData>;
  updateBlock: (missionId: string, blockId: string, block: LessonBlock) => Promise<LessonData>;
  deleteBlock: (missionId: string, blockId: string) => Promise<LessonData>;
  duplicateBlock: (missionId: string, blockId: string) => Promise<LessonData>;
  reorderBlocks: (missionId: string, blockIds: string[]) => Promise<LessonData>;
  getStudentAnalytics: () => Promise<StudentProgressSummary[]>;
  refreshCourse: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

function groupMissionsIntoChapters(missions: Mission[]): Chapter[] {
  const ch1Missions = missions.filter((m) => m.order <= 4);
  const ch2Missions = missions.filter((m) => m.order > 4 && m.order <= 8);
  const ch3Missions = missions.filter((m) => m.order > 8);

  return [
    {
      id: 'ch_1',
      order: 1,
      title: 'Kapitel 1: Presentation och bostad',
      description: 'Lär dig hälsa, berätta vad du heter, var du kommer ifrån och bor (Uppdrag 1–4).',
      missions: ch1Missions,
    },
    {
      id: 'ch_2',
      order: 2,
      title: 'Kapitel 2: Personliga uppgifter och familj',
      description: 'Träna på ålder, siffror, yrke, språk och familj (Uppdrag 5–8).',
      missions: ch2Missions,
    },
    {
      id: 'ch_3',
      order: 3,
      title: 'Kapitel 3: Vardagsliv och samhälle',
      description: 'Klockan, rutiner, handla mat, beställa på café och A1-repetition (Uppdrag 9–12+).',
      missions: ch3Missions,
    },
  ];
}

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCourse = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await courseService.loadMissions();
      setMissions(list);
    } catch (e) {
      console.warn('Failed to refresh course missions:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourse();
  }, [refreshCourse]);

  const handleCreateMission = async (data: Partial<Mission>): Promise<Mission> => {
    const created = await courseService.createMission(data);
    await refreshCourse();
    return created;
  };

  const handleUpdateMission = async (id: string, updates: Partial<Mission>): Promise<Mission> => {
    const updated = await courseService.updateMission(id, updates);
    await refreshCourse();
    return updated;
  };

  const handleDeleteMission = async (id: string): Promise<void> => {
    await courseService.deleteMission(id);
    await refreshCourse();
  };

  const handleDuplicateMission = async (id: string): Promise<Mission> => {
    const dup = await courseService.duplicateMission(id);
    await refreshCourse();
    return dup;
  };

  const handleReorderMissions = async (orderedIds: string[]): Promise<void> => {
    const reordered = await courseService.reorderMissions(orderedIds);
    setMissions(reordered);
  };

  const handleTogglePublish = async (id: string, isPublished: boolean): Promise<Mission> => {
    const updated = await courseService.togglePublish(id, isPublished);
    await refreshCourse();
    return updated;
  };

  const handleGetLesson = async (missionId: string): Promise<LessonData | null> => {
    return courseService.loadLesson(missionId);
  };

  const handleAddBlock = async (missionId: string, block: LessonBlock): Promise<LessonData> => {
    return courseService.addBlock(missionId, block);
  };

  const handleUpdateBlock = async (
    missionId: string,
    blockId: string,
    block: LessonBlock
  ): Promise<LessonData> => {
    return courseService.updateBlock(missionId, blockId, block);
  };

  const handleDeleteBlock = async (missionId: string, blockId: string): Promise<LessonData> => {
    return courseService.deleteBlock(missionId, blockId);
  };

  const handleDuplicateBlock = async (missionId: string, blockId: string): Promise<LessonData> => {
    return courseService.duplicateBlock(missionId, blockId);
  };

  const handleReorderBlocks = async (
    missionId: string,
    blockIds: string[]
  ): Promise<LessonData> => {
    return courseService.reorderBlocks(missionId, blockIds);
  };

  const handleGetStudentAnalytics = async (): Promise<StudentProgressSummary[]> => {
    return courseService.getStudentAnalytics();
  };

  const chapters = groupMissionsIntoChapters(missions);

  return (
    <CourseContext.Provider
      value={{
        missions,
        chapters,
        isLoading,
        createMission: handleCreateMission,
        updateMission: handleUpdateMission,
        deleteMission: handleDeleteMission,
        duplicateMission: handleDuplicateMission,
        reorderMissions: handleReorderMissions,
        togglePublishMission: handleTogglePublish,
        getLesson: handleGetLesson,
        addBlock: handleAddBlock,
        updateBlock: handleUpdateBlock,
        deleteBlock: handleDeleteBlock,
        duplicateBlock: handleDuplicateBlock,
        reorderBlocks: handleReorderBlocks,
        getStudentAnalytics: handleGetStudentAnalytics,
        refreshCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
