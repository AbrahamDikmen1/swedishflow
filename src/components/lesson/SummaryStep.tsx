import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SummaryBlock } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface SummaryStepProps {
  block: SummaryBlock;
  completedCount: number;
  correctCount: number;
  totalExercisesCount: number;
  missionOrder: number;
  onBackToOverview: () => void;
  onFinishMission: () => void;
  onResetLesson: () => void;
  warningMessage?: string | null;
}

export default function SummaryStep({
  block,
  completedCount,
  correctCount,
  totalExercisesCount,
  missionOrder,
  onBackToOverview,
  onFinishMission,
  onResetLesson,
  warningMessage,
}: SummaryStepProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.resultHeader}>
        <View style={styles.resultBadge}>
          <Icon name="checkmark" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.resultTitle}>{block.title}</Text>
        <Text style={styles.resultSubtitle}>{block.subtitle}</Text>
      </View>

      {warningMessage ? (
        <View style={styles.warningCard}>
          <Icon name="information-circle-outline" size={20} color="#B45309" />
          <Text style={styles.warningText}>{warningMessage}</Text>
        </View>
      ) : null}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Fraser du har lärt dig:</Text>
        {block.summaryPhrases.map((phrase, idx) => (
          <View key={idx} style={styles.summaryRow}>
            <Icon name="checkmark" size={14} color={theme.colors.success} />
            <Text style={styles.summaryPhraseText}>{phrase}</Text>
          </View>
        ))}
      </View>

      <View style={styles.resultScoreCard}>
        <View style={styles.resultScoreItem}>
          <Text style={styles.resultScoreValuePrimary}>
            {completedCount} av {totalExercisesCount}
          </Text>
          <Text style={styles.resultScoreLabel}>övningar genomförda</Text>
        </View>

        <View style={styles.scoreDivider} />

        <View style={styles.resultScoreItem}>
          <Text
            style={[
              styles.resultScoreValuePrimary,
              correctCount === totalExercisesCount ? styles.textSuccess : styles.textNeutral,
            ]}
          >
            {correctCount} av {totalExercisesCount}
          </Text>
          <Text style={styles.resultScoreLabel}>rätt</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Button
          title="Slutför uppdraget"
          variant="primary"
          onPress={onFinishMission}
          accessibilityLabel="Slutför uppdraget och gå till A1-översikten"
        />
      </View>

      <View style={styles.retryButtonWrapper}>
        <Button
          title="Gör om uppdraget"
          variant="secondary"
          onPress={onResetLesson}
          accessibilityLabel="Gå om uppdraget från början"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  resultBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  resultTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  resultSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: '#92400E',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  summaryPhraseText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  resultScoreCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
  },
  resultScoreItem: {
    alignItems: 'center',
  },
  resultScoreValuePrimary: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: '#1E4E8C',
  },
  textSuccess: {
    color: theme.colors.success,
  },
  textNeutral: {
    color: '#1E4E8C',
  },
  resultScoreLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  scoreDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },
  actionContainer: {
    marginTop: theme.spacing.xs,
  },
  retryButtonWrapper: {
    marginTop: theme.spacing.sm,
  },
});
