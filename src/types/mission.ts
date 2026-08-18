export type MissionStatus = 'completed' | 'active' | 'available' | 'locked';

export interface Mission {
  id: string;
  order: number;
  title: string;
  description: string;
  status: MissionStatus;
  estimatedMinutes: number;
  levelCode?: string; // e.g. 'A1'
  chapterId?: string;
  skills?: string[];
  route?: string;
  isPublished?: boolean;
  goals?: string[];
  knowledgeOutcomes?: string[];
  nextPracticeSuggestions?: string[];
  totalPoints?: number;
}
