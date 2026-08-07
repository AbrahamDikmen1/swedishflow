import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ViewStyle,
} from 'react-native';
import { MultipleChoiceExercise } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface MultipleChoiceStepProps {
  exercise: MultipleChoiceExercise;
  selectedOption: number | null;
  isChecked: boolean;
  isCorrect: boolean;
  onSelectOption: (index: number) => void;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export default function MultipleChoiceStep({
  exercise,
  selectedOption,
  isChecked,
  isCorrect,
  onSelectOption,
  onCheck,
  onRetry,
  onNext,
}: MultipleChoiceStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{exercise.question}</Text>

      <View style={styles.optionsList}>
        {exercise.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrectOption = idx === exercise.correctIndex;

          let optionCardStyle = [styles.optionCard];
          let optionTextStyle = [styles.optionText];
          let radioStyle = [styles.radioCircle];
          let radioInnerStyle = [styles.radioInner];

          if (isSelected) {
            optionCardStyle.push(styles.optionCardSelected as any);
            optionTextStyle.push(styles.optionTextSelected as any);
            radioStyle.push(styles.radioCircleSelected as any);
          }

          if (isChecked) {
            if (isCorrect && isCorrectOption) {
              optionCardStyle.push(styles.optionCardCorrect as any);
              optionTextStyle.push(styles.optionTextCorrect as any);
              radioStyle.push(styles.radioCircleCorrect as any);
              radioInnerStyle.push(styles.radioInnerCorrect as any);
            } else if (!isCorrect && isSelected) {
              optionCardStyle.push(styles.optionCardIncorrect as any);
              optionTextStyle.push(styles.optionTextIncorrect as any);
              radioStyle.push(styles.radioCircleIncorrect as any);
              radioInnerStyle.push(styles.radioInnerIncorrect as any);
            }
          }

          return (
            <Pressable
              key={idx}
              disabled={isChecked}
              style={({ pressed }) => [
                optionCardStyle,
                pressed && !isChecked && styles.optionCardPressed,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : undefined,
              ]}
              onPress={() => onSelectOption(idx)}
              accessibilityRole="radio"
              accessibilityState={{
                selected: isSelected,
                disabled: isChecked,
              }}
              accessibilityLabel={`Svarsalternativ ${idx + 1}: ${option}`}
            >
              <View style={radioStyle}>
                {isSelected && <View style={radioInnerStyle} />}
              </View>
              <Text style={optionTextStyle}>{option}</Text>
            </Pressable>
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
            {isCorrect ? exercise.explanationCorrect : exercise.explanationIncorrect}
          </Text>
        </View>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actionContainer}>
        {!isChecked ? (
          <Button
            title="Kontrollera"
            variant="primary"
            disabled={selectedOption === null}
            onPress={onCheck}
            accessibilityLabel="Kontrollera ditt svar"
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
                accessibilityLabel="Försök igen på kontrollfrågan"
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
  questionText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  optionsList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  optionCardPressed: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  optionCardSelected: {
    backgroundColor: '#EBF3FA',
    borderColor: '#1E4E8C',
  },
  optionCardCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.success,
  },
  optionCardIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#1E4E8C',
  },
  radioCircleCorrect: {
    borderColor: theme.colors.success,
  },
  radioCircleIncorrect: {
    borderColor: '#DC2626',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E4E8C',
  },
  radioInnerCorrect: {
    backgroundColor: theme.colors.success,
  },
  radioInnerIncorrect: {
    backgroundColor: '#DC2626',
  },
  optionText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: '#1E4E8C',
    fontWeight: '700',
  },
  optionTextCorrect: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  optionTextIncorrect: {
    color: '#991B1B',
    fontWeight: '700',
  },

  /* FEEDBACK BOXES */
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
