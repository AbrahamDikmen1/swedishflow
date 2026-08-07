import React, { useState, useEffect } from 'react';
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
import { theme } from '../../../../src/theme/theme';
import { a1Lessons } from '../../../../src/data/a1CourseData';
import { LessonBlockState, LessonData } from '../../../../src/types/lesson';
import { useProgress } from '../../../../src/context/ProgressContext';

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

  const { missions, completeMission, getMissionStatus, isLoading } = useProgress();

  const missionStatus = getMissionStatus(String(missionId));
  const mission = missions.find((m) => m.id === String(missionId));
  const lesson = a1Lessons[String(missionId)];
  const isValidAndUnlocked = Boolean(mission && lesson && missionStatus !== 'locked');

  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [blockStates, setBlockStates] = useState<Record<string, LessonBlockState>>(() =>
    lesson ? createInitialBlockStates(lesson) : {}
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (lesson) {
      setCurrentBlockIndex(0);
      setBlockStates(createInitialBlockStates(lesson));
      setWarningMessage(null);
    }
  }, [lesson?.missionId]);

  const totalSteps = lesson?.blocks.length || 0;
  const activeBlock = lesson?.blocks[currentBlockIndex];

  // Dynamically calculate exercise scores from block states
  const exerciseBlocks = lesson?.blocks.filter(
    (b) =>
      b.type === 'multiple_choice' ||
      b.type === 'sentence_builder' ||
      b.type === 'fill_blank' ||
      b.type === 'matching' ||
      b.type === 'free_text'
  ) || [];
  const totalExercisesCount = exerciseBlocks.length;
  const completedCount = exerciseBlocks.filter((b) => {
    const st = blockStates[b.id];
    return st && 'isChecked' in st && st.isChecked;
  }).length;
  const correctCount = exerciseBlocks.filter((b) => {
    const st = blockStates[b.id];
    return st && 'isChecked' in st && st.isChecked && st.isCorrect;
  }).length;

  // Pure navigation back to overview WITHOUT completing mission
  const handleBackToOverview = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/learn');
    }
  };

  // Explicit completion triggered only from summary finish button
  const handleFinishMission = async () => {
    if (!lesson || !mission) return;

    // Defensive check: find first unchecked exercise block
    const uncheckedIndex = lesson.blocks.findIndex((b) => {
      const isGradable =
        b.type === 'multiple_choice' ||
        b.type === 'sentence_builder' ||
        b.type === 'fill_blank' ||
        b.type === 'matching' ||
        b.type === 'free_text';
      if (!isGradable) return false;
      const st = blockStates[b.id];
      return !st || !('isChecked' in st) || !st.isChecked;
    });

    if (uncheckedIndex !== -1) {
      setWarningMessage('Du har okontrollerade övningar kvar! Du skickas nu till den första okontrollerade övningen.');
      setCurrentBlockIndex(uncheckedIndex);
      return;
    }

    setWarningMessage(null);
    await completeMission(mission.id);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/learn');
    }
  };

  // Reset local lesson session
  const handleResetLesson = () => {
    if (lesson) {
      setCurrentBlockIndex(0);
      setBlockStates(createInitialBlockStates(lesson));
      setWarningMessage(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.mainContainer, styles.errorContainer, isTabletOrWeb && styles.tabletContainer]}>
          <Text style={styles.errorSubtitle}>Laddar uppdrag...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isValidAndUnlocked || !mission || !lesson || !activeBlock) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.mainContainer, styles.errorContainer, isTabletOrWeb && styles.tabletContainer]}>
          <BackButton onPress={handleBackToOverview} accessibilityLabel="Gå tillbaka till A1" />
          <View style={styles.errorCard}>
            <Icon name="lock-outline" size={32} color="#64748B" />
            <Text style={styles.errorTitle}>Uppdraget hittades inte eller är låst</Text>
            <Text style={styles.errorSubtitle}>
              Det begärda uppdraget är inte tillgängligt. Du kan bara öppna slutförda eller aktiva uppdrag.
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
      activeBlock.type === 'sentence_builder' ||
      activeBlock.type === 'fill_blank' ||
      activeBlock.type === 'matching' ||
      activeBlock.type === 'free_text';

    if (isGradable) {
      const st = blockStates[activeBlock.id];
      if (!st || !('isChecked' in st) || !st.isChecked) {
        // User must check exercise before proceeding
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

  const handleUpdateBlockState = (blockId: string, newState: LessonBlockState) => {
    setWarningMessage(null);
    setBlockStates((prev) => ({
      ...prev,
      [blockId]: newState,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isTabletOrWeb && styles.tabletScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContainer, isTabletOrWeb && styles.tabletContainer]}>
          {/* LESSON PROGRESS HEADER */}
          <LessonProgressHeader
            missionOrder={lesson.order}
            totalMissions={lesson.totalMissions}
            title={lesson.title}
            blocks={lesson.blocks}
            currentIndex={currentBlockIndex}
            onBack={handleLessonHeaderBack}
          />

          {/* DYNAMIC BLOCK RENDERER */}
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
            onBackToOverview={handleBackToOverview}
            onFinishMission={handleFinishMission}
            onResetLesson={handleResetLesson}
            warningMessage={warningMessage}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  tabletScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  mainContainer: {
    width: '100%',
  },
  tabletContainer: {
    maxWidth: 640,
    alignSelf: 'center',
  },

  /* TOP BAR (used for placeholder/error screens) */
  topBar: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  headerContainer: {
    marginBottom: theme.spacing.xl,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.xs,
  },
  badge: {
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: theme.typography.sizes.xs,
  },
  statusPillCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillCompletedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  statusPillActive: {
    backgroundColor: '#EBF3FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillActiveText: {
    color: '#1E4E8C',
    fontWeight: '700',
    fontSize: 11,
  },
  missionTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  missionDescription: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  /* PLACEHOLDER CARD */
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#1E4E8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBF3FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  placeholderTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  placeholderBody: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  buttonWrapper: {
    width: '100%',
  },

  /* ERROR STATE */
  errorContainer: {
    padding: theme.spacing.lg,
    flex: 1,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
});
