import { LanguageLevel } from '../types/level';
import { mockA1Chapters } from './mockA1Missions';

export const mockLevels: LanguageLevel[] = [
  {
    id: 'level_a1',
    code: 'A1',
    title: 'Nybörjare',
    subtitle: 'Grundnivå',
    description: 'Lär dig grunderna och använd svenska i enkla vardagssituationer.',
    status: 'active',
    completedMissionsCount: 0,
    totalMissionsCount: 3,
    chapters: mockA1Chapters,
  },
];
