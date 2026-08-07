export type MissionStatus = 'completed' | 'active' | 'available' | 'locked';

export interface Mission {
  id: string;
  order: number;
  title: string;
  description: string;
  status: MissionStatus;
  estimatedMinutes: number;
  chapterId?: string;
  skills?: string[];
  route?: string;
}

