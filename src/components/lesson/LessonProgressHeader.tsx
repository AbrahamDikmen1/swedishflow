import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton from '../BackButton';
import { theme } from '../../theme/theme';
import { LessonBlock } from '../../types/lesson';

interface LessonProgressHeaderProps {
  missionOrder: number;
  totalMissions: number;
  title: string;
  blocks?: LessonBlock[];
  currentIndex?: number;
  currentStep?: number;
  totalSteps?: number;
  onBack: () => void;
}

export default function LessonProgressHeader({
  missionOrder,
  totalMissions,
  title,
  blocks,
  currentIndex = 0,
  currentStep = 1,
  totalSteps = 1,
  onBack,
}: LessonProgressHeaderProps) {
  let phase: 'info' | 'exercise' | 'summary' = 'info';
  let badgeText = '';
  let totalInfo = 0;
  let totalExercises = 0;
  let infoProgress = 0;
  let exerciseProgress = 0;

  if (blocks && blocks.length > 0) {
    const infoBlocks = blocks.filter(
      (b) =>
        b.type === 'introduction' ||
        b.type === 'dialogue' ||
        b.type === 'vocabulary' ||
        b.type === 'explanation'
    );
    const exerciseBlocks = blocks.filter(
      (b) =>
        b.type === 'multiple_choice' ||
        b.type === 'sentence_builder' ||
        b.type === 'fill_blank' ||
        b.type === 'matching' ||
        b.type === 'free_text'
    );

    totalInfo = infoBlocks.length;
    totalExercises = exerciseBlocks.length;

    const currentBlock = blocks[currentIndex];

    if (currentBlock) {
      const isInfo =
        currentBlock.type === 'introduction' ||
        currentBlock.type === 'dialogue' ||
        currentBlock.type === 'vocabulary' ||
        currentBlock.type === 'explanation';

      const isExercise =
        currentBlock.type === 'multiple_choice' ||
        currentBlock.type === 'sentence_builder' ||
        currentBlock.type === 'fill_blank' ||
        currentBlock.type === 'matching' ||
        currentBlock.type === 'free_text';

      if (isInfo) {
        phase = 'info';
        const infoIndex = infoBlocks.findIndex((b) => b.id === currentBlock.id) + 1;
        badgeText = `Introduktion ${infoIndex} av ${totalInfo}`;
        infoProgress = totalInfo > 0 ? Math.round((infoIndex / totalInfo) * 100) : 100;
        exerciseProgress = 0;
      } else if (isExercise) {
        phase = 'exercise';
        const exerciseIndex = exerciseBlocks.findIndex((b) => b.id === currentBlock.id) + 1;
        badgeText = `Övning ${exerciseIndex} av ${totalExercises}`;
        infoProgress = 100;
        exerciseProgress = totalExercises > 0 ? Math.round((exerciseIndex / totalExercises) * 100) : 100;
      } else {
        phase = 'summary';
        badgeText = 'Sammanfattning';
        infoProgress = 100;
        exerciseProgress = 100;
      }
    } else {
      phase = 'summary';
      badgeText = 'Sammanfattning';
      infoProgress = 100;
      exerciseProgress = 100;
    }
  } else {
    // Fallback if blocks array not provided directly
    badgeText = `Steg ${currentStep} av ${totalSteps}`;
    infoProgress = Math.round((currentStep / totalSteps) * 100);
    exerciseProgress = infoProgress;
    totalInfo = 1;
    totalExercises = 1;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} accessibilityLabel="Tillbaka" />
        <View style={styles.centerInfo}>
          <Text style={styles.missionLabel}>
            Uppdrag {missionOrder} av {totalMissions}
          </Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View
          style={[
            styles.stepBadge,
            phase === 'info'
              ? styles.stepBadgeInfo
              : phase === 'exercise'
              ? styles.stepBadgeExercise
              : styles.stepBadgeSummary,
          ]}
        >
          <Text
            style={[
              styles.stepText,
              phase === 'info'
                ? styles.stepTextInfo
                : phase === 'exercise'
                ? styles.stepTextExercise
                : styles.stepTextSummary,
            ]}
          >
            {badgeText}
          </Text>
        </View>
      </View>

      {/* PHASED PROGRESS INDICATOR */}
      <View style={styles.phaseLabelsRow}>
        <View style={[styles.phaseLabelItem, { flex: totalInfo || 1 }]}>
          <Text
            style={[
              styles.phaseLabelText,
              phase === 'info'
                ? styles.phaseActiveText
                : phase === 'exercise' || phase === 'summary'
                ? styles.phaseDoneText
                : styles.phaseInactiveText,
            ]}
          >
            Introduktion
          </Text>
        </View>
        <View style={[styles.phaseLabelItem, { flex: totalExercises || 1 }]}>
          <Text
            style={[
              styles.phaseLabelText,
              phase === 'exercise'
                ? styles.phaseActiveText
                : phase === 'summary'
                ? styles.phaseDoneText
                : styles.phaseInactiveText,
            ]}
          >
            Övningar
          </Text>
        </View>
      </View>

      <View style={styles.segmentedProgressRow}>
        {/* INTRODUKTION BAR SEGMENT */}
        <View
          style={[styles.progressTrack, { flex: totalInfo || 1 }]}
          accessibilityRole="progressbar"
          accessibilityLabel={`Introduktionssteg. ${infoProgress}% klart`}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${infoProgress}%`,
                backgroundColor: phase === 'info' ? '#1E4E8C' : '#059669',
              },
            ]}
          />
        </View>

        {/* GAP DIVIDER BETWEEN PHASES */}
        <View style={styles.segmentGap} />

        {/* ÖVNINGAR BAR SEGMENT */}
        <View
          style={[styles.progressTrack, { flex: totalExercises || 1 }]}
          accessibilityRole="progressbar"
          accessibilityLabel={`Övningssteg. ${exerciseProgress}% klart`}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${exerciseProgress}%`,
                backgroundColor:
                  phase === 'exercise' ? '#1E4E8C' : phase === 'summary' ? '#059669' : 'transparent',
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  centerInfo: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
  },
  missionLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stepBadgeInfo: {
    backgroundColor: '#EBF3FA',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  stepBadgeExercise: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  stepBadgeSummary: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepTextInfo: {
    color: '#1E4E8C',
  },
  stepTextExercise: {
    color: '#0284C7',
  },
  stepTextSummary: {
    color: '#059669',
  },
  phaseLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseLabelItem: {
    paddingHorizontal: 2,
  },
  phaseLabelText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phaseActiveText: {
    fontWeight: '800',
    color: '#1E4E8C',
  },
  phaseDoneText: {
    fontWeight: '700',
    color: '#059669',
  },
  phaseInactiveText: {
    fontWeight: '500',
    color: '#94A3B8',
  },
  segmentedProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentGap: {
    width: 6,
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3.5,
  },
});

