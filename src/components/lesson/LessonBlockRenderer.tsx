import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  LessonBlock,
  LessonBlockState,
  MultipleChoiceBlockState,
  ListenChoiceBlockState,
  SentenceBuilderBlockState,
  FillBlankBlockState,
  MatchingBlockState,
  FreeTextBlockState,
  SpeakBlockState,
  AiRoleplayBlockState,
} from '../../types/lesson';
import IntroductionStep from './IntroductionStep';
import DialogueStep from './DialogueStep';
import VocabularyStep from './VocabularyStep';
import ExplanationStep from './ExplanationStep';
import MultipleChoiceStep from './MultipleChoiceStep';
import { ListenChoiceStep } from './ListenChoiceStep';
import SentenceBuilderStep from './SentenceBuilderStep';
import FillBlankStep from './FillBlankStep';
import MatchingStep from './MatchingStep';
import FreeTextStep from './FreeTextStep';
import { SpeakStep } from './SpeakStep';
import { AiRoleplayStep } from './AiRoleplayStep';
import SummaryStep from './SummaryStep';
import { theme } from '../../theme/theme';

interface LessonBlockRendererProps {
  block: LessonBlock;
  blockState: LessonBlockState | undefined;
  onUpdateBlockState: (blockId: string, state: LessonBlockState) => void;
  onNext: () => void;
  onBack: () => void;
  completedCount: number;
  correctCount: number;
  totalExercisesCount: number;
  missionOrder: number;
  nextMission?: { id: string; order: number; title: string } | null;
  onBackToOverview: () => void;
  onFinishMission: (navigateToNext?: boolean) => void;
  onResetLesson: () => void;
  warningMessage?: string | null;
}

export default function LessonBlockRenderer({
  block,
  blockState,
  onUpdateBlockState,
  onNext,
  onBack,
  completedCount,
  correctCount,
  totalExercisesCount,
  missionOrder,
  nextMission,
  onBackToOverview,
  onFinishMission,
  onResetLesson,
  warningMessage,
}: LessonBlockRendererProps) {
  switch (block.type) {
    case 'introduction':
      return <IntroductionStep block={block} onNext={onNext} />;

    case 'dialogue':
      return <DialogueStep block={block} onNext={onNext} />;

    case 'vocabulary':
      return <VocabularyStep block={block} onNext={onNext} onBack={onBack} />;

    case 'explanation':
      return <ExplanationStep block={block} onNext={onNext} />;

    case 'multiple_choice': {
      const mcState: MultipleChoiceBlockState = (blockState as MultipleChoiceBlockState) || {
        type: 'multiple_choice',
        selectedOption: null,
        isChecked: false,
        isCorrect: false,
      };

      const handleSelectOption = (idx: number) => {
        onUpdateBlockState(block.id, {
          ...mcState,
          selectedOption: idx,
        });
      };

      const handleCheck = () => {
        if (mcState.selectedOption === null) return;
        const correct = mcState.selectedOption === block.exercise.correctIndex;
        onUpdateBlockState(block.id, {
          ...mcState,
          isChecked: true,
          isCorrect: correct,
        });
      };

      const handleRetry = () => {
        onUpdateBlockState(block.id, {
          type: 'multiple_choice',
          selectedOption: null,
          isChecked: false,
          isCorrect: false,
        });
      };

      return (
        <MultipleChoiceStep
          exercise={block.exercise}
          selectedOption={mcState.selectedOption}
          isChecked={mcState.isChecked}
          isCorrect={mcState.isCorrect}
          onSelectOption={handleSelectOption}
          onCheck={handleCheck}
          onRetry={handleRetry}
          onNext={onNext}
        />
      );
    }

    case 'listen_choice': {
      const lcState = blockState as ListenChoiceBlockState | undefined;
      return (
        <ListenChoiceStep
          block={block}
          state={lcState}
          onStateChange={(newState) => onUpdateBlockState(block.id, newState)}
          onNext={onNext}
        />
      );
    }

    case 'sentence_builder': {
      const sbState: SentenceBuilderBlockState = (blockState as SentenceBuilderBlockState) || {
        type: 'sentence_builder',
        placedWords: [],
        availableWords: block.exercise.initialWords,
        isChecked: false,
        isCorrect: false,
      };

      const handleSelectAvailableWord = (word: string, index: number) => {
        const newAvailable = sbState.availableWords.filter((_, i) => i !== index);
        const newPlaced = [...sbState.placedWords, word];
        onUpdateBlockState(block.id, {
          ...sbState,
          availableWords: newAvailable,
          placedWords: newPlaced,
        });
      };

      const handleSelectPlacedWord = (word: string, index: number) => {
        const newPlaced = sbState.placedWords.filter((_, i) => i !== index);
        const newAvailable = [...sbState.availableWords, word];
        onUpdateBlockState(block.id, {
          ...sbState,
          placedWords: newPlaced,
          availableWords: newAvailable,
        });
      };

      const handleReset = () => {
        onUpdateBlockState(block.id, {
          type: 'sentence_builder',
          placedWords: [],
          availableWords: block.exercise.initialWords,
          isChecked: false,
          isCorrect: false,
        });
      };

      const handleCheck = () => {
        const constructed = sbState.placedWords.join(' ');
        const target = block.exercise.correctSentence;
        const normalize = (s: string) => s.replace(/[.!?]/g, '').trim().toLowerCase();
        const isCorrectSentence =
          constructed === target ||
          constructed + '.' === target ||
          constructed + '?' === target ||
          normalize(constructed) === normalize(target);

        onUpdateBlockState(block.id, {
          ...sbState,
          isChecked: true,
          isCorrect: isCorrectSentence,
        });
      };

      const handleRetry = () => {
        onUpdateBlockState(block.id, {
          type: 'sentence_builder',
          placedWords: [],
          availableWords: block.exercise.initialWords,
          isChecked: false,
          isCorrect: false,
        });
      };

      return (
        <SentenceBuilderStep
          exercise={block.exercise}
          placedWords={sbState.placedWords}
          availableWords={sbState.availableWords}
          isChecked={sbState.isChecked}
          isCorrect={sbState.isCorrect}
          onSelectAvailableWord={handleSelectAvailableWord}
          onSelectPlacedWord={handleSelectPlacedWord}
          onReset={handleReset}
          onCheck={handleCheck}
          onRetry={handleRetry}
          onNext={onNext}
        />
      );
    }

    case 'fill_blank': {
      const fbState: FillBlankBlockState = (blockState as FillBlankBlockState) || {
        type: 'fill_blank',
        selectedOption: null,
        isChecked: false,
        isCorrect: false,
      };

      const handleSelectOption = (opt: string) => {
        onUpdateBlockState(block.id, {
          ...fbState,
          selectedOption: opt,
        });
      };

      const handleCheck = () => {
        if (!fbState.selectedOption) return;
        const correct = fbState.selectedOption === block.exercise.correctAnswer;
        onUpdateBlockState(block.id, {
          ...fbState,
          isChecked: true,
          isCorrect: correct,
        });
      };

      const handleRetry = () => {
        onUpdateBlockState(block.id, {
          type: 'fill_blank',
          selectedOption: null,
          isChecked: false,
          isCorrect: false,
        });
      };

      return (
        <FillBlankStep
          exercise={block.exercise}
          selectedOption={fbState.selectedOption}
          isChecked={fbState.isChecked}
          isCorrect={fbState.isCorrect}
          onSelectOption={handleSelectOption}
          onCheck={handleCheck}
          onRetry={handleRetry}
          onNext={onNext}
        />
      );
    }

    case 'matching': {
      const mState: MatchingBlockState = (blockState as MatchingBlockState) || {
        type: 'matching',
        userPairs: {},
        isChecked: false,
        isCorrect: false,
      };

      const handleSelectPair = (questionId: string, answer: string) => {
        onUpdateBlockState(block.id, {
          ...mState,
          userPairs: {
            ...mState.userPairs,
            [questionId]: answer,
          },
        });
      };

      const handleCheck = () => {
        const allPairs = block.exercise.pairs;
        const allCorrect = allPairs.every(
          (p) => mState.userPairs[p.id] === p.answer
        );
        onUpdateBlockState(block.id, {
          ...mState,
          isChecked: true,
          isCorrect: allCorrect,
        });
      };

      const handleRetry = () => {
        onUpdateBlockState(block.id, {
          type: 'matching',
          userPairs: {},
          isChecked: false,
          isCorrect: false,
        });
      };

      return (
        <MatchingStep
          exercise={block.exercise}
          userPairs={mState.userPairs}
          isChecked={mState.isChecked}
          isCorrect={mState.isCorrect}
          onSelectPair={handleSelectPair}
          onCheck={handleCheck}
          onRetry={handleRetry}
          onNext={onNext}
        />
      );
    }

    case 'free_text': {
      const ftState: FreeTextBlockState = (blockState as FreeTextBlockState) || {
        type: 'free_text',
        textInput: '',
        isChecked: false,
        isCorrect: false,
      };

      const handleChangeText = (text: string) => {
        onUpdateBlockState(block.id, {
          ...ftState,
          textInput: text,
        });
      };

      const handleCheck = () => {
        const raw = ftState.textInput || '';
        const trimmed = raw.trim();

        if (!trimmed) {
          onUpdateBlockState(block.id, {
            ...ftState,
            isChecked: true,
            isCorrect: false,
            feedbackType: 'empty',
          });
          return;
        }

        let isMatch = false;
        try {
          const reg = new RegExp(block.exercise.regexPattern, 'i');
          isMatch = reg.test(trimmed);
        } catch {
          isMatch =
            trimmed.toLowerCase().startsWith('jag') ||
            trimmed.toLowerCase().startsWith('var');
        }

        if (isMatch) {
          onUpdateBlockState(block.id, {
            ...ftState,
            isChecked: true,
            isCorrect: true,
            feedbackType: 'correct',
          });
        } else {
          const words = trimmed.split(/\s+/);
          const feedbackType = words.length < 2 ? 'incomplete' : 'incorrect';
          onUpdateBlockState(block.id, {
            ...ftState,
            isChecked: true,
            isCorrect: false,
            feedbackType,
          });
        }
      };

      const handleRetry = () => {
        onUpdateBlockState(block.id, {
          type: 'free_text',
          textInput: '',
          isChecked: false,
          isCorrect: false,
          feedbackType: undefined,
        });
      };

      return (
        <FreeTextStep
          exercise={block.exercise}
          textInput={ftState.textInput}
          isChecked={ftState.isChecked}
          isCorrect={ftState.isCorrect}
          feedbackType={ftState.feedbackType}
          onChangeText={handleChangeText}
          onCheck={handleCheck}
          onRetry={handleRetry}
          onNext={onNext}
        />
      );
    }

    case 'speak': {
      const spkState = blockState as SpeakBlockState | undefined;
      return (
        <SpeakStep
          block={block}
          state={spkState}
          onStateChange={(newState) => onUpdateBlockState(block.id, newState)}
          onNext={onNext}
        />
      );
    }

    case 'ai_roleplay': {
      const aiState = blockState as AiRoleplayBlockState | undefined;
      return (
        <AiRoleplayStep
          block={block}
          state={aiState}
          onStateChange={(newState) => onUpdateBlockState(block.id, newState)}
          onNext={onNext}
        />
      );
    }

    case 'summary':
      return (
        <SummaryStep
          block={block}
          completedCount={completedCount}
          correctCount={correctCount}
          totalExercisesCount={totalExercisesCount}
          missionOrder={missionOrder}
          nextMission={nextMission}
          onBackToOverview={onBackToOverview}
          onFinishMission={onFinishMission}
          onResetLesson={onResetLesson}
          warningMessage={warningMessage}
        />
      );

    default: {
      const _exhaustiveCheck: never = block;
      return (
        <View style={styles.unknownCard}>
          <Text style={styles.unknownTitle}>Okänd blocktyp</Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  unknownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  unknownTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
