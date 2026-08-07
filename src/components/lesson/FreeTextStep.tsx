import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ViewStyle,
} from 'react-native';
import { FreeTextExercise } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface FreeTextStepProps {
  exercise: FreeTextExercise;
  textInput: string;
  isChecked: boolean;
  isCorrect: boolean;
  feedbackType?: 'correct' | 'empty' | 'incomplete' | 'incorrect';
  onChangeText: (text: string) => void;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export default function FreeTextStep({
  exercise,
  textInput,
  isChecked,
  isCorrect,
  feedbackType,
  onChangeText,
  onCheck,
  onRetry,
  onNext,
}: FreeTextStepProps) {
  const [showHint, setShowHint] = useState(false);

  const getFeedbackMessage = () => {
    switch (feedbackType) {
      case 'correct':
        return exercise.explanationCorrect;
      case 'empty':
        return exercise.explanationEmpty;
      case 'incomplete':
        return exercise.explanationIncomplete;
      case 'incorrect':
      default:
        return exercise.explanationIncorrect;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>{exercise.instruction}</Text>
      <Text style={styles.promptText}>{exercise.prompt}</Text>

      {/* DISCREET HINT BUTTON */}
      {exercise.hintExample ? (
        <View style={styles.hintContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.hintButton,
              pressed && styles.hintButtonPressed,
              Platform.OS === 'web'
                ? ({ outlineStyle: 'none' } as unknown as ViewStyle)
                : undefined,
            ]}
            onPress={() => setShowHint(!showHint)}
            accessibilityRole="button"
            accessibilityLabel="Visa exempel"
          >
            <Icon
              name="information-circle-outline"
              size={16}
              color="#1E4E8C"
            />
            <Text style={styles.hintButtonText}>
              {showHint ? 'Dölj exempel' : 'Visa exempel'}
            </Text>
          </Pressable>

          {showHint && (
            <View style={styles.hintCard}>
              <Text style={styles.hintCardText}>
                Exempel: {exercise.hintExample}
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* TEXT INPUT FIELD */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.textInput,
            isChecked && isCorrect && styles.inputCorrect,
            isChecked && !isCorrect && styles.inputIncorrect,
          ]}
          value={textInput}
          onChangeText={onChangeText}
          editable={!isChecked}
          placeholder={exercise.placeholder || 'Skriv ditt svar här...'}
          placeholderTextColor="#94A3B8"
          autoCapitalize="sentences"
          autoCorrect={false}
          accessibilityLabel="Fritextfält"
        />
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
          <Text style={styles.feedbackBodyText}>{getFeedbackMessage()}</Text>
        </View>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actionContainer}>
        {!isChecked ? (
          <Button
            title="Kontrollera"
            variant="primary"
            onPress={onCheck}
            accessibilityLabel="Kontrollera din text"
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
                accessibilityLabel="Försök igen på skriva"
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
    marginBottom: theme.spacing.xs,
  },
  promptText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  hintContainer: {
    marginBottom: theme.spacing.md,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EBF3FA',
  },
  hintButtonPressed: {
    backgroundColor: '#D6E8F7',
  },
  hintButtonText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  hintCard: {
    marginTop: theme.spacing.xs,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hintCardText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  inputWrapper: {
    marginBottom: theme.spacing.lg,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  inputCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.success,
  },
  inputIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    color: '#991B1B',
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
