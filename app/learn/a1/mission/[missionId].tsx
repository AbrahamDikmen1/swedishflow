import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackButton from '../../../../src/components/BackButton';
import Button from '../../../../src/components/Button';
import Icon from '../../../../src/components/Icon';
import LessonProgressHeader from '../../../../src/components/lesson/LessonProgressHeader';
import LessonBlockRenderer from '../../../../src/components/lesson/LessonBlockRenderer';
import AdminPreviewBanner from '../../../../src/components/AdminPreviewBanner';
import { theme } from '../../../../src/theme/theme';
import { a1Lessons } from '../../../../src/data/a1CourseData';
import { LessonBlockState, LessonData } from '../../../../src/types/lesson';
import { useProgress } from '../../../../src/context/ProgressContext';
import { useCourse } from '../../../../src/context/CourseContext';
import { useAuth } from '../../../../src/context/AuthContext';

function createInitialBlockStates(lesson: LessonData): Record<string, LessonBlockState> {
  const states: Record<string, LessonBlockState> = {};
  for (const block of lesson.blocks) {
    if (block.type === 'multiple_choice') {
      states[block.id] = {
        type: 'multiple_choice',
        selectedOption: null,
        isChecked: false,
        isCorrect: false,
      };
    } else if (block.type === 'listen_choice') {
      states[block.id] = {
        type: 'listen_choice',
        selectedOption: null,
        isChecked: false,
        isCorrect: false,
      };
    } else if (block.type === 'sentence_builder') {
      states[block.id] = {
        type: 'sentence_builder',
        placedWords: [],
        availableWords: block.exercise.initialWords,
        isChecked: false,
        isCorrect: false,
      };
    } else if (block.type === 'fill_blank') {
      states[block.id] = {
        type: 'fill_blank',
        selectedOption: null,
        isChecked: false,
        isCorrect: false,
      };
    } else if (block.type === 'matching') {
      states[block.id] = {
        type: 'matching',
        userPairs: {},
        isChecked: false,
        isCorrect: false,
      };
    } else if (block.type === 'free_text') {
      states[block.id] = {
        type: 'free_text',
        textInput: '',
        isChecked: false,
        isCorrect: false,
      };
    } else if (block.type === 'speak') {
      states[block.id] = {
        type: 'speak',
        recorded: false,
        hasSpoken: false,
        isChecked: false,
        isCorrect: false,
      };
    } else if (block.type === 'ai_roleplay') {
      states[block.id] = {
        type: 'ai_roleplay',
        messages: [],
        completedGoal: false,
        isChecked: false,
      };
    } else {
      states[block.id] = {
        type: 'info',
        visited: false,
      };
    }
  }
  return states;
}

export default function MissionScreen() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const { isAdmin } = useAuth();
  const { missions, completeMission, getMissionStatus, isLoading: isProgressLoading } = useProgress();
  const { getLesson } = useCourse();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);

  const missionStatus = getMissionStatus(String(missionId));
  const mission = missions.find((m) => m.id === String(missionId));
  const isAllowed = isAdmin || (mission && missionStatus !== 'locked');

  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [blockStates, setBlockStates] = useState<Record<string, LessonBlockState>>({});
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (missionId) {
      setIsLoadingLesson(true);
      getLesson(String(missionId))
        .then((data) => {
          setLesson(data);
          if (data) {
            setCurrentBlockIndex(0);
            setBlockStates(createInitialBlockStates(data));
            setWarningMessage(null);
          }
        })
        .finally(() => setIsLoadingLesson(false));
    }
  }, [missionId, getLesson]);

  const totalSteps = lesson?.blocks.length || 0;
  const activeBlock = lesson?.blocks[currentBlockIndex];

  // Dynamically calculate exercise scores from block states
  const exerciseBlocks =
    lesson?.blocks.filter(
      (b) =>
        b.type === 'multiple_choice' ||
        b.type === 'listen_choice' ||
        b.type === 'sentence_builder' ||
        b.type === 'fill_blank' ||
        b.type === 'matching' ||
        b.type === 'free_text' ||
        b.type === 'speak' ||
        b.type === 'ai_roleplay'
    ) || [];

  const totalExercisesCount = exerciseBlocks.length;
  const extractRawAnswers = useCallback(() => {
    const raw: Record<string, any> = {};
    for (const [blockId, st] of Object.entries(blockStates)) {
      if (st.type === 'multiple_choice' || st.type === 'listen_choice' || st.type === 'fill_blank') {
        raw[blockId] = (st as any).selectedOption;
      } else if (st.type === 'sentence_builder') {
        raw[blockId] = (st as any).placedWords;
      } else if (st.type === 'matching') {
        raw[blockId] = (st as any).userPairs;
      } else if (st.type === 'free_text') {
        raw[blockId] = (st as any).textInput;
      } else if (st.type === 'speak') {
        raw[blockId] = (st as any).hasSpoken || (st as any).recorded ? 'spoken' : null;
      } else if (st.type === 'ai_roleplay') {
        raw[blockId] = (st as any).completedGoal ? 'completed' : 'engaged';
      }
    }
    return raw;
  }, [blockStates]);

  const completedCount = exerciseBlocks.filter((b) => {
    const st = blockStates[b.id];
    return st && 'isChecked' in st && st.isChecked;
  }).length;

  const correctCount = exerciseBlocks.filter((b) => {
    const st = blockStates[b.id];
    return st && 'isChecked' in st && st.isChecked && (st as any).isCorrect !== false;
  }).length;

  const allExercisesChecked =
    totalExercisesCount > 0 && completedCount === totalExercisesCount;

  // Auto-save completion when reaching the result/summary screen
  useEffect(() => {
    if (
      mission &&
      lesson &&
      activeBlock?.type === 'summary' &&
      allExercisesChecked
    ) {
      completeMission(mission.id, {
        userAnswers: extractRawAnswers(),
        idempotencyKey: `attempt_${mission.id}_${currentBlockIndex}_${lesson.blocks.length}`,
        correctCount,
        totalExercises: totalExercisesCount,
      });
    }
  }, [
    mission?.id,
    lesson?.missionId,
    activeBlock?.type,
    allExercisesChecked,
    correctCount,
    totalExercisesCount,
    currentBlockIndex,
    lesson?.blocks.length,
    extractRawAnswers,
    completeMission,
  ]);

  // Calculate next mission if available
  const nextMissionOrder = mission ? mission.order + 1 : 0;
  const nextMissionItem = missions.find((m) => m.order === nextMissionOrder);
  const nextMission = nextMissionItem
    ? {
        id: nextMissionItem.id,
        order: nextMissionItem.order,
        title: nextMissionItem.title,
      }
    : null;

  const handleBackToOverview = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/learn');
    }
  };

  const handleFinishMission = async (navigateToNext?: boolean) => {
    if (!lesson || !mission) return;

    // Defensive check: find first unchecked exercise block
    const uncheckedIndex = lesson.blocks.findIndex((b) => {
      const isGradable =
        b.type === 'multiple_choice' ||
        b.type === 'listen_choice' ||
        b.type === 'sentence_builder' ||
        b.type === 'fill_blank' ||
        b.type === 'matching' ||
        b.type === 'free_text' ||
        b.type === 'speak' ||
        b.type === 'ai_roleplay';
      if (!isGradable) return false;
      const st = blockStates[b.id];
      return !st || !('isChecked' in st) || !st.isChecked;
    });

    if (uncheckedIndex !== -1) {
      setWarningMessage(
        'Du har okontrollerade övningar kvar! Du skickas nu till den första okontrollerade övningen.'
      );
      setCurrentBlockIndex(uncheckedIndex);
      return;
    }

    setWarningMessage(null);
    await completeMission(mission.id, {
      userAnswers: extractRawAnswers(),
      idempotencyKey: `attempt_${mission.id}_finish_${Date.now()}`,
      correctCount,
      totalExercises: totalExercisesCount,
    });

    if (navigateToNext && nextMission) {
      router.replace(`/learn/a1/mission/${nextMission.id}`);
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/learn');
    }
  };

  const handleResetLesson = () => {
    if (lesson) {
      setCurrentBlockIndex(0);
      setBlockStates(createInitialBlockStates(lesson));
      setWarningMessage(null);
    }
  };

  if (isProgressLoading || isLoadingLesson) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.mainContainer, styles.errorContainer, isTabletOrWeb && styles.tabletContainer]}>
          <Text style={styles.errorSubtitle}>Laddar uppdrag och övningar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAllowed || !mission || !lesson || !activeBlock) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.mainContainer, styles.errorContainer, isTabletOrWeb && styles.tabletContainer]}>
          <BackButton onPress={handleBackToOverview} accessibilityLabel="Gå tillbaka till A1" />
          <View style={styles.errorCard}>
            <Icon name="lock-outline" size={32} color="#64748B" />
            <Text style={styles.errorTitle}>Uppdraget hittades inte eller är låst</Text>
            <Text style={styles.errorSubtitle}>
              Det begärda uppdraget är inte tillgängligt ännu. Klara tidigare uppdrag för att låsa upp detta.
            </Text>
            <View style={styles.buttonWrapper}>
              <Button
                title="Tillbaka till Kurs"
                onPress={() => router.push('/(tabs)/learn')}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleLessonHeaderBack = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
    } else {
      handleBackToOverview();
    }
  };

  const handleNextBlock = () => {
    if (!activeBlock) return;
    const isGradable =
      activeBlock.type === 'multiple_choice' ||
      activeBlock.type === 'listen_choice' ||
      activeBlock.type === 'sentence_builder' ||
      activeBlock.type === 'fill_blank' ||
      activeBlock.type === 'matching' ||
      activeBlock.type === 'free_text' ||
      activeBlock.type === 'speak' ||
      activeBlock.type === 'ai_roleplay';

    if (isGradable) {
      const st = blockStates[activeBlock.id];
      if (!st || !('isChecked' in st) || !st.isChecked) {
        return;
      }
    }
    setWarningMessage(null);
    setCurrentBlockIndex((prev) => Math.min(prev + 1, lesson.blocks.length - 1));
  };

  const handlePrevBlock = () => {
    setWarningMessage(null);
    setCurrentBlockIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleUpdateBlockState = (blockId: string, state: LessonBlockState) => {
    setBlockStates((prev) => ({
      ...prev,
      [blockId]: state,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AdminPreviewBanner />
      <View style={[styles.mainContainer, isTabletOrWeb && styles.tabletContainer]}>
        <LessonProgressHeader
          missionOrder={lesson.order}
          totalMissions={missions.length || 12}
          title={lesson.title}
          blocks={lesson.blocks}
          currentIndex={currentBlockIndex}
          currentStep={currentBlockIndex + 1}
          totalSteps={totalSteps}
          onBack={handleLessonHeaderBack}
        />

        {warningMessage && (
          <View style={styles.warningBanner}>
            <Icon name="alert-circle" size={18} color="#D97706" />
            <Text style={styles.warningText}>{warningMessage}</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LessonBlockRenderer
            block={activeBlock}
            blockState={blockStates[activeBlock.id]}
            onUpdateBlockState={handleUpdateBlockState}
            onNext={handleNextBlock}
            onBack={handlePrevBlock}
            completedCount={completedCount}
            correctCount={correctCount}
            totalExercisesCount={totalExercisesCount}
            missionOrder={lesson.order}
            nextMission={nextMission}
            onBackToOverview={handleBackToOverview}
            onFinishMission={handleFinishMission}
            onResetLesson={handleResetLesson}
            warningMessage={warningMessage}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContainer: {
    flex: 1,
  },
  tabletContainer: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  errorContainer: {
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  errorCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 240,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
    padding: theme.spacing.sm,
    gap: 8,
  },
  warningText: {
    fontSize: theme.typography.sizes.xs,
    color: '#92400E',
    flex: 1,
    fontWeight: '600',
  },
});
