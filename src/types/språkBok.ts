export type VocabularyCategory =
  | 'all'
  | 'greetings'
  | 'presentation'
  | 'origin_living'
  | 'numbers_time'
  | 'work_languages'
  | 'family'
  | 'shopping_food'
  | 'restaurant'
  | 'saved';

export interface VocabularyWord {
  id: string;
  swedish: string;
  translation: string;
  explanation?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  category: VocabularyCategory;
  level: string; // e.g. 'A1'
  missionId: string;
  audioUrl?: string;
  hasAudioResource?: boolean;
  isSaved?: boolean;
  masteryLevel: 'new' | 'learning' | 'mastered';
}
