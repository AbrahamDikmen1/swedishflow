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
  | 'listen_choice'
  | 'sentence_builder'
  | 'fill_blank'
  | 'matching'
  | 'free_text'
  | 'speak'
  | 'ai_roleplay'
  | 'summary';

export interface PhraseItem {
  phrase: string;
  explanation: string;
  audioUrl?: string;
}

export interface ExampleItem {
  phrase: string;
  translation?: string;
  audioUrl?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation?: string;
  audioUrl?: string;
}

export interface MultipleChoiceExercise {
  question: string;
  options: string[];
  correctIndex: number;
  explanationCorrect: string;
  explanationIncorrect: string;
  audioUrl?: string;
}

export interface ListenChoiceExercise {
  prompt: string;
  audioUrl?: string;
  audioPlaceholderText?: string;
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
  aiFeedbackPrompt?: string;
}

export interface SpeakExercise {
  instruction: string;
  targetPhrase: string;
  translation?: string;
  phoneticHint?: string;
  audioUrl?: string;
  tips?: string;
}

export interface AiRoleplayMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface AiRoleplayFeedback {
  strengths: string;
  correction?: string;
  improvedExample?: string;
  usedTargetPhrases?: string[];
}

export interface AiRoleplayExercise {
  title?: string;
  instruction?: string;
  scenario: string;
  characterName: string;
  characterRole: string;
  userRole?: string;
  languageLevel?: 'A1' | 'A2';
  learningGoal?: string;
  initialMessage: string;
  goalDescription: string;
  allowedTopics: string[];
  suggestedPhrases: string[];
  maxTurns?: number;
  exitRule?: string;
  showFeedback?: boolean;
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

export interface ListenChoiceBlock extends LessonBlockBase {
  type: 'listen_choice';
  exercise: ListenChoiceExercise;
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

export interface SpeakBlock extends LessonBlockBase {
  type: 'speak';
  exercise: SpeakExercise;
}

export interface AiRoleplayBlock extends LessonBlockBase {
  type: 'ai_roleplay';
  exercise: AiRoleplayExercise;
}

export interface SummaryBlock extends LessonBlockBase {
  type: 'summary';
  title: string;
  subtitle: string;
  summaryPhrases: string[];
  expectedOutcomes?: string[];
  nextMissionId?: string;
  nextMissionTitle?: string;
}

export type LessonBlock =
  | IntroductionBlock
  | DialogueBlock
  | VocabularyBlock
  | ExplanationBlock
  | MultipleChoiceBlock
  | ListenChoiceBlock
  | SentenceBuilderBlock
  | FillBlankBlock
  | MatchingBlock
  | FreeTextBlock
  | SpeakBlock
  | AiRoleplayBlock
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

export interface ListenChoiceBlockState {
  type: 'listen_choice';
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
  aiFeedback?: string;
}

export interface SpeakBlockState {
  type: 'speak';
  recorded: boolean;
  hasSpoken: boolean;
  isChecked: boolean;
  isCorrect: boolean;
  transcript?: string;
  score?: number;
  speechFeedback?: string;
  evaluationStatus?:
    | 'correct'
    | 'almost'
    | 'incorrect'
    | 'empty'
    | 'permission_denied'
    | 'recorded_unverified'
    | 'unsupported';
}

export interface AiRoleplayBlockState {
  type: 'ai_roleplay';
  messages: AiRoleplayMessage[];
  completedGoal: boolean;
  isChecked: boolean;
  turnsCount?: number;
  feedback?: AiRoleplayFeedback;
  isDemo?: boolean;
}

export interface InfoBlockState {
  type: 'info';
  visited: boolean;
}

export type LessonBlockState =
  | MultipleChoiceBlockState
  | ListenChoiceBlockState
  | SentenceBuilderBlockState
  | FillBlankBlockState
  | MatchingBlockState
  | FreeTextBlockState
  | SpeakBlockState
  | AiRoleplayBlockState
  | InfoBlockState;

export interface LessonSessionState {
  currentBlockIndex: number;
  blockStates: Record<string, LessonBlockState>;
}
