import { Chapter } from './chapter';

export type LevelStatus = 'active' | 'locked' | 'completed';

export interface LanguageLevel {
  id: string;
  code: string; // 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  title: string; // 'Nybörjare', 'Grundläggande', etc.
  subtitle?: string;
  description: string;
  status: LevelStatus;
  completedMissionsCount: number;
  totalMissionsCount: number;
  chapters?: Chapter[];
}

