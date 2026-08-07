export type LessonSkill =
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'vocabulary'
  | 'grammar';

export type LessonBlockType =
  | 'introduction'
  | 'dialogue'
  | 'vocabulary'
  | 'explanation'
  | 'multiple_choice'
  | 'sentence_builder'
  | 'fill_blank'
  | 'matching'
  | 'free_text'
  | 'summary';

export interface PhraseItem {
  phrase: string;
  explanation: string;
}

export interface ExampleItem {
  phrase: string;
  translation?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  audioUrl?: string;
}

export interface MultipleChoiceExercise {
  question: string;
  options: string[];
  correctIndex: number;
  explanationCorrect: string;
  explanationIncorrect: string;
}

export interface SentenceBuilderExercise {
  instruction: string;
  initialWords: string[];
  correctSentence: string;
  explanationCorrect: string;
  explanationIncorrect: string;
}

export interface FillBlankExercise {
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanationCorrect: string;
  explanationIncorrect: string;
}

export interface MatchingPair {
  id: string;
  question: string;
  answer: string;
}

export interface MatchingExercise {
  instruction: string;
  pairs: MatchingPair[];
  explanationCorrect: string;
}

export interface FreeTextExercise {
  instruction: string;
  prompt: string;
  placeholder?: string;
  hintExample?: string;
  regexPattern: string;
  explanationCorrect: string;
  explanationIncorrect: string;
  explanationEmpty: string;
  explanationIncomplete: string;
}

export interface LessonBlockBase {
  id: string;
  type: LessonBlockType;
  skills: LessonSkill[];
  required: boolean;
}

export interface IntroductionBlock extends LessonBlockBase {
  type: 'introduction';
  title: string;
  introduction: string;
  examples: ExampleItem[];
  grammaticalNote: string;
}

export interface DialogueBlock extends LessonBlockBase {
  type: 'dialogue';
  title: string;
  scenario: string;
  lines: DialogueLine[];
  audioUrl?: string;
}

export interface VocabularyBlock extends LessonBlockBase {
  type: 'vocabulary';
  title: string;
  phrases: PhraseItem[];
  infoBox: string;
}

export interface ExplanationBlock extends LessonBlockBase {
  type: 'explanation';
  title: string;
  instruction?: string;
  body: string;
  examples: ExampleItem[];
  infoBox?: string;
}

export interface MultipleChoiceBlock extends LessonBlockBase {
  type: 'multiple_choice';
  exercise: MultipleChoiceExercise;
}

export interface SentenceBuilderBlock extends LessonBlockBase {
  type: 'sentence_builder';
  exercise: SentenceBuilderExercise;
}

export interface FillBlankBlock extends LessonBlockBase {
  type: 'fill_blank';
  exercise: FillBlankExercise;
}

export interface MatchingBlock extends LessonBlockBase {
  type: 'matching';
  exercise: MatchingExercise;
}

export interface FreeTextBlock extends LessonBlockBase {
  type: 'free_text';
  exercise: FreeTextExercise;
}

export interface SummaryBlock extends LessonBlockBase {
  type: 'summary';
  title: string;
  subtitle: string;
  summaryPhrases: string[];
}

export type LessonBlock =
  | IntroductionBlock
  | DialogueBlock
  | VocabularyBlock
  | ExplanationBlock
  | MultipleChoiceBlock
  | SentenceBuilderBlock
  | FillBlankBlock
  | MatchingBlock
  | FreeTextBlock
  | SummaryBlock;

export interface LessonData {
  missionId: string;
  order: number;
  totalMissions: number;
  title: string;
  blocks: LessonBlock[];
}

/* Session state per block */
export interface MultipleChoiceBlockState {
  type: 'multiple_choice';
  selectedOption: number | null;
  isChecked: boolean;
  isCorrect: boolean;
}

export interface SentenceBuilderBlockState {
  type: 'sentence_builder';
  placedWords: string[];
  availableWords: string[];
  isChecked: boolean;
  isCorrect: boolean;
}

export interface FillBlankBlockState {
  type: 'fill_blank';
  selectedOption: string | null;
  isChecked: boolean;
  isCorrect: boolean;
}

export interface MatchingBlockState {
  type: 'matching';
  userPairs: Record<string, string>;
  isChecked: boolean;
  isCorrect: boolean;
}

export interface FreeTextBlockState {
  type: 'free_text';
  textInput: string;
  isChecked: boolean;
  isCorrect: boolean;
  feedbackType?: 'correct' | 'empty' | 'incomplete' | 'incorrect';
}

export interface InfoBlockState {
  type: 'info';
  visited: boolean;
}

export type LessonBlockState =
  | MultipleChoiceBlockState
  | SentenceBuilderBlockState
  | FillBlankBlockState
  | MatchingBlockState
  | FreeTextBlockState
  | InfoBlockState;

export interface LessonSessionState {
  currentBlockIndex: number;
  blockStates: Record<string, LessonBlockState>;
}
