import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ViewStyle,
} from 'react-native';
import { MatchingExercise } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface MatchingStepProps {
  exercise: MatchingExercise;
  userPairs: Record<string, string>;
  isChecked: boolean;
  isCorrect: boolean;
  onSelectPair: (questionId: string, answer: string) => void;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export default function MatchingStep({
  exercise,
  userPairs,
  isChecked,
  isCorrect,
  onSelectPair,
  onCheck,
  onRetry,
  onNext,
}: MatchingStepProps) {
  // Deterministic shuffled answers list so order is static during rendering
  const availableAnswers = useMemo(() => {
    const list = exercise.pairs.map((p) => p.answer);
    // Reverse or static shift so it's not in trivial 1:1 order
    return [list[2], list[1], list[0]].filter(Boolean);
  }, [exercise.pairs]);

  const allAnswered = exercise.pairs.every((p) => !!userPairs[p.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>{exercise.instruction}</Text>

      <View style={styles.pairsContainer}>
        {exercise.pairs.map((pair) => {
          const currentSelected = userPairs[pair.id];
          const isPairCorrect = currentSelected === pair.answer;

          return (
            <View key={pair.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Icon name="information-circle-outline" size={18} color="#1E4E8C" />
                <Text style={styles.questionTitle}>{pair.question}</Text>
              </View>

              <Text style={styles.sublabel}>Välj rätt svar:</Text>

              <View style={styles.answersRow}>
                {availableAnswers.map((ans, idx) => {
                  const isSelected = currentSelected === ans;
                  let buttonStyle = [styles.answerPill];
                  let textStyle = [styles.answerPillText];

                  if (isSelected) {
                    buttonStyle.push(styles.answerPillSelected as any);
                    textStyle.push(styles.answerPillTextSelected as any);
                  }

                  if (isChecked) {
                    if (isSelected && isPairCorrect) {
                      buttonStyle.push(styles.answerPillCorrect as any);
                      textStyle.push(styles.answerPillTextCorrect as any);
                    } else if (isSelected && !isPairCorrect) {
                      buttonStyle.push(styles.answerPillIncorrect as any);
                      textStyle.push(styles.answerPillTextIncorrect as any);
                    }
                  }

                  return (
                    <Pressable
                      key={idx}
                      disabled={isChecked}
                      style={({ pressed }) => [
                        buttonStyle,
                        pressed && !isChecked && styles.answerPillPressed,
                        Platform.OS === 'web'
                          ? ({ outlineStyle: 'none' } as unknown as ViewStyle)
                          : undefined,
                      ]}
                      onPress={() => onSelectPair(pair.id, ans)}
                      accessibilityRole="button"
                      accessibilityLabel={`Välj svar: ${ans}`}
                    >
                      <Text style={textStyle}>{ans}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* FEEDBACK BOX */}
      {isChecked && (
        <View style={isCorrect ? styles.feedbackBoxCorrect : styles.feedbackBoxIncorrect}>
          <View style={styles.feedbackHeaderRow}>
            <Icon
              name={isCorrect ? 'checkmark' : 'lock-outline'}
              size={18}
              color={isCorrect ? theme.colors.success : '#DC2626'}
            />
            <Text style={isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect}>
              {isCorrect ? 'Rätt!' : 'Försök igen'}
            </Text>
          </View>
          <Text style={styles.feedbackBodyText}>
            {isCorrect
              ? exercise.explanationCorrect
              : 'Se över valen ovan och försök igen.'}
          </Text>
        </View>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actionContainer}>
        {!isChecked ? (
          <Button
            title="Kontrollera"
            variant="primary"
            disabled={!allAnswered}
            onPress={onCheck}
            accessibilityLabel="Kontrollera dina matchningar"
          />
        ) : (
          <View style={{ gap: theme.spacing.xs, width: '100%' }}>
            <Button
              title="Fortsätt"
              variant="primary"
              onPress={onNext}
              accessibilityLabel="Gå vidare till nästa steg"
            />
            {!isCorrect && (
              <Button
                title="Försök igen"
                variant="secondary"
                onPress={onRetry}
                accessibilityLabel="Försök igen på matchningen"
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  pairsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  questionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.xs,
  },
  questionTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sublabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  answersRow: {
    gap: 8,
  },
  answerPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  answerPillPressed: {
    backgroundColor: '#F1F5F9',
  },
  answerPillSelected: {
    backgroundColor: '#EBF3FA',
    borderColor: '#1E4E8C',
  },
  answerPillCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.success,
  },
  answerPillIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  answerPillText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  answerPillTextSelected: {
    color: '#1E4E8C',
    fontWeight: '700',
  },
  answerPillTextCorrect: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  answerPillTextIncorrect: {
    color: '#991B1B',
    fontWeight: '700',
  },
  feedbackBoxCorrect: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
    marginBottom: theme.spacing.lg,
  },
  feedbackBoxIncorrect: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: theme.spacing.lg,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  feedbackTitleCorrect: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.success,
  },
  feedbackTitleIncorrect: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: '#DC2626',
  },
  feedbackBodyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: theme.spacing.xs,
  },
});
