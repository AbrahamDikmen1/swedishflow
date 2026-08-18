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
  nextMission?: { id: string; order: number; title: string } | null;
  onBackToOverview: () => void;
  onFinishMission: (navigateToNext?: boolean) => void;
  onResetLesson: () => void;
  warningMessage?: string | null;
}

export default function SummaryStep({
  block,
  completedCount,
  correctCount,
  totalExercisesCount,
  missionOrder,
  nextMission,
  onBackToOverview,
  onFinishMission,
  onResetLesson,
  warningMessage,
}: SummaryStepProps) {
  const scorePercentage =
    totalExercisesCount > 0
      ? Math.round((correctCount / totalExercisesCount) * 100)
      : 0;
  const totalPoints = totalExercisesCount * 10;
  const earnedPoints = correctCount * 10;
  const isPerfectScore = correctCount === totalExercisesCount && totalExercisesCount > 0;

  return (
    <View style={styles.stepCard}>
      {/* HEADER */}
      <View style={styles.resultHeader}>
        <View style={styles.resultBadge}>
          <Icon name="checkmark" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.resultTitle}>{block.title}</Text>
        <Text style={styles.resultSubtitle}>{block.subtitle}</Text>
      </View>

      {/* WARNING MESSAGE IF UNCHECKED EXERCISES REMAIN */}
      {warningMessage ? (
        <View style={styles.warningCard}>
          <Icon name="information-circle-outline" size={20} color="#B45309" />
          <Text style={styles.warningText}>{warningMessage}</Text>
        </View>
      ) : null}

      {/* FINAL MISSION CELEBRATION */}
      {!nextMission ? (
        <View style={styles.completionBanner}>
          <View style={styles.bannerIconWrapper}>
            <Icon name="shield-checkmark-outline" size={24} color="#1E4E8C" />
          </View>
          <View style={styles.bannerTextWrapper}>
            <Text style={styles.bannerTitle}>Hela A1-kursen slutförd! 🎉</Text>
            <Text style={styles.bannerSubtitle}>
              Grattis! Du har nu genomfört samtliga 12 A1-uppdrag i SwedishFlow.
            </Text>
          </View>
        </View>
      ) : null}

      {/* SCORE AND PERFORMANCE METRICS */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionHeaderLabel}>Ditt resultat:</Text>
        <View style={styles.resultScoreCard}>
          <View style={styles.resultScoreItem}>
            <Text style={[styles.resultScoreValuePrimary, isPerfectScore && styles.textSuccess]}>
              {scorePercentage}%
            </Text>
            <Text style={styles.resultScoreLabel}>procent rätt</Text>
          </View>

          <View style={styles.scoreDivider} />

          <View style={styles.resultScoreItem}>
            <Text
              style={[
                styles.resultScoreValuePrimary,
                isPerfectScore ? styles.textSuccess : styles.textNeutral,
              ]}
            >
              {correctCount} / {totalExercisesCount}
            </Text>
            <Text style={styles.resultScoreLabel}>antal rätt</Text>
          </View>

          <View style={styles.scoreDivider} />

          <View style={styles.resultScoreItem}>
            <Text style={styles.resultScoreValuePrimary}>
              {earnedPoints} / {totalPoints}
            </Text>
            <Text style={styles.resultScoreLabel}>poäng (p)</Text>
          </View>
        </View>
      </View>

      {/* WHAT THE STUDENT PRACTICED */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Uppnådda kunskapsmål:</Text>
        {block.summaryPhrases.map((phrase, idx) => (
          <View key={idx} style={styles.summaryRow}>
            <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.summaryPhraseText}>{phrase}</Text>
          </View>
        ))}
      </View>

      {/* WHAT THE STUDENT IS EXPECTED TO KNOW */}
      {block.expectedOutcomes && block.expectedOutcomes.length > 0 ? (
        <View style={styles.outcomesCard}>
          <Text style={styles.summaryLabel}>Vad du nu kan:</Text>
          {block.expectedOutcomes.map((outcome, idx) => (
            <View key={idx} style={styles.summaryRow}>
              <Icon name="star" size={16} color="#1E4E8C" />
              <Text style={styles.summaryPhraseText}>{outcome}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* SUGGESTIONS FOR FURTHER PRACTICE */}
      <View style={styles.practiceTipsCard}>
        <Text style={styles.summaryLabel}>Träna vidare på:</Text>
        <View style={styles.summaryRow}>
          <Icon name="book-outline" size={16} color="#475569" />
          <Text style={styles.practiceTipText}>
            Repetera orden i Språkboken och träna på uttalet med mikrofonen.
          </Text>
        </View>
      </View>

      {/* ACTIONS AND NAVIGATION */}
      <View style={styles.actionContainer}>
        {nextMission ? (
          <>
            <View style={styles.nextMissionWrapper}>
              <Button
                title={`Fortsätt till Uppdrag ${nextMission.order}`}
                variant="primary"
                onPress={() => onFinishMission(true)}
                accessibilityLabel={`Slutför och gå vidare till Uppdrag ${nextMission.order}: ${nextMission.title}`}
              />
              <Text style={styles.nextMissionSubtitle}>
                {nextMission.title}
              </Text>
            </View>

            <View style={styles.secondaryButtonWrapper}>
              <Button
                title="Tillbaka till kursöversikten"
                variant="secondary"
                onPress={() => onFinishMission(false)}
                accessibilityLabel="Slutför uppdraget och återgå till A1-översikten"
              />
            </View>
          </>
        ) : (
          <View style={styles.nextMissionWrapper}>
            <Button
              title="Tillbaka till kursöversikten"
              variant="primary"
              onPress={() => onFinishMission(false)}
              accessibilityLabel="Slutför kursen och gå till A1-översikten"
            />
          </View>
        )}

        <View style={styles.retryButtonWrapper}>
          <Button
            title="Gör om uppdraget"
            variant="secondary"
            onPress={onResetLesson}
            accessibilityLabel="Starta om detta uppdrag"
          />
        </View>
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
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EBF3FA',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  bannerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '800',
    color: '#1E4E8C',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  metricsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
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
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.md,
  },
  outcomesCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: theme.spacing.md,
  },
  practiceTipsCard: {
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
    flex: 1,
  },
  practiceTipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  actionContainer: {
    marginTop: theme.spacing.xs,
  },
  nextMissionWrapper: {
    marginBottom: theme.spacing.sm,
  },
  nextMissionSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  secondaryButtonWrapper: {
    marginBottom: theme.spacing.sm,
  },
  retryButtonWrapper: {
    marginTop: 2,
  },
});
