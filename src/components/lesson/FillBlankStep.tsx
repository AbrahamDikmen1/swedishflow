import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ViewStyle,
} from 'react-native';
import { FillBlankExercise } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface FillBlankStepProps {
  exercise: FillBlankExercise;
  selectedOption: string | null;
  isChecked: boolean;
  isCorrect: boolean;
  onSelectOption: (option: string) => void;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export default function FillBlankStep({
  exercise,
  selectedOption,
  isChecked,
  isCorrect,
  onSelectOption,
  onCheck,
  onRetry,
  onNext,
}: FillBlankStepProps) {
  // Normalize sentence with canonical blank slot (handles {blank}, ____, ___, __, _)
  const rawSentence = exercise.sentence || '';
  const parts = rawSentence.includes('{blank}')
    ? rawSentence.split('{blank}')
    : rawSentence.split(/_{1,}/);

  const prefix = parts[0] ?? '';
  const suffix = parts.slice(1).join('') ?? '';

  return (
    <View style={styles.container}>
      {/* SENTENCE CARD WITH CANONICAL BLANK SLOT */}
      <View style={styles.sentenceCard}>
        <Text style={styles.sentenceText}>
          <Text style={styles.sentencePartText}>{prefix}</Text>
          <Text
            style={[
              styles.blankHighlight,
              !selectedOption && styles.blankHighlightEmpty,
              selectedOption && styles.blankHighlightFilled,
              isChecked && isCorrect && styles.blankHighlightCorrect,
              isChecked && !isCorrect && styles.blankHighlightIncorrect,
            ]}
          >
            {selectedOption ? ` ${selectedOption} ` : ' _____ '}
          </Text>
          <Text style={styles.sentencePartText}>{suffix}</Text>
        </Text>
      </View>

      <Text style={styles.selectLabel}>Välj rätt ord för luckan:</Text>

      {/* OPTIONS LIST */}
      <View style={styles.optionsList}>
        {exercise.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrectOption = option === exercise.correctAnswer;

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
              onPress={() => onSelectOption(option)}
              accessibilityRole="radio"
              accessibilityState={{
                selected: isSelected,
                disabled: isChecked,
              }}
              accessibilityLabel={`Svarsalternativ: ${option}`}
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
                accessibilityLabel="Försök igen"
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
    width: '100%',
  },
  sentenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sentenceText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 36,
  },
  sentencePartText: {
    color: '#0F172A',
  },
  blankHighlight: {
    fontWeight: '800',
    borderRadius: 8,
    overflow: 'hidden',
  },
  blankHighlightEmpty: {
    color: '#64748B',
    backgroundColor: '#F1F5F9',
  },
  blankHighlightFilled: {
    color: '#1E4E8C',
    backgroundColor: '#E0F2FE',
  },
  blankHighlightCorrect: {
    color: '#047857',
    backgroundColor: '#D1FAE5',
  },
  blankHighlightIncorrect: {
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  optionsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: '#1E4E8C',
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
  },
  optionCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
  },
  optionCardIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
  },
  optionCardPressed: {
    opacity: 0.85,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#1E4E8C',
  },
  radioCircleCorrect: {
    borderColor: '#10B981',
  },
  radioCircleIncorrect: {
    borderColor: '#EF4444',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E4E8C',
  },
  radioInnerCorrect: {
    backgroundColor: '#10B981',
  },
  radioInnerIncorrect: {
    backgroundColor: '#EF4444',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  optionTextSelected: {
    color: '#0C4A6E',
    fontWeight: '700',
  },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '700',
  },
  optionTextIncorrect: {
    color: '#991B1B',
    fontWeight: '700',
  },
  feedbackBoxCorrect: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  feedbackBoxIncorrect: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  feedbackTitleCorrect: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
  },
  feedbackTitleIncorrect: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B91C1C',
  },
  feedbackBodyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: theme.spacing.sm,
    width: '100%',
  },
});
