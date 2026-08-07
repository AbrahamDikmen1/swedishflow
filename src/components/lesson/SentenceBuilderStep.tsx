import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ViewStyle,
} from 'react-native';
import { SentenceBuilderExercise } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface SentenceBuilderStepProps {
  exercise: SentenceBuilderExercise;
  placedWords: string[];
  availableWords: string[];
  isChecked: boolean;
  isCorrect: boolean;
  onSelectAvailableWord: (word: string, index: number) => void;
  onSelectPlacedWord: (word: string, index: number) => void;
  onReset: () => void;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export default function SentenceBuilderStep({
  exercise,
  placedWords,
  availableWords,
  isChecked,
  isCorrect,
  onSelectAvailableWord,
  onSelectPlacedWord,
  onReset,
  onCheck,
  onRetry,
  onNext,
}: SentenceBuilderStepProps) {
  const isCompleteSentence = placedWords.length === exercise.initialWords.length;

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>{exercise.instruction}</Text>

      {/* ANSWER BOX / PLACED WORDS */}
      <View
        style={[
          styles.answerBox,
          isChecked && isCorrect && styles.answerBoxCorrect,
          isChecked && !isCorrect && styles.answerBoxIncorrect,
        ]}
      >
        <View style={styles.answerBoxHeader}>
          <Text style={styles.answerBoxLabel}>Din mening:</Text>
          {placedWords.length > 0 && !isChecked && (
            <Pressable
              onPress={onReset}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.resetButtonPressed,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : undefined,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Återställ orden"
            >
              <Icon name="refresh-outline" size={14} color="#64748B" />
              <Text style={styles.resetButtonText}>Återställ</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.tilesContainer}>
          {placedWords.length === 0 ? (
            <Text style={styles.placeholderText}>
              Tryck på ordbrickorna nedan för att bygga meningen...
            </Text>
          ) : (
            placedWords.map((word, index) => (
              <Pressable
                key={`placed-${index}-${word}`}
                disabled={isChecked}
                style={({ pressed }) => [
                  styles.wordTilePlaced,
                  isChecked && isCorrect && styles.wordTilePlacedCorrect,
                  isChecked && !isCorrect && styles.wordTilePlacedIncorrect,
                  pressed && !isChecked && styles.wordTilePressed,
                  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : undefined,
                ]}
                onPress={() => onSelectPlacedWord(word, index)}
                accessibilityRole="button"
                accessibilityLabel={`Ta bort ordet ${word} från meningen`}
              >
                <Text
                  style={[
                    styles.wordTilePlacedText,
                    isChecked && !isCorrect && styles.wordTilePlacedTextIncorrect,
                  ]}
                >
                  {word}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </View>

      {/* AVAILABLE WORD BANK */}
      <View style={styles.bankContainer}>
        <Text style={styles.bankLabel}>Tillgängliga ord:</Text>
        <View style={styles.tilesContainer}>
          {availableWords.map((word, index) => (
            <Pressable
              key={`avail-${index}-${word}`}
              disabled={isChecked}
              style={({ pressed }) => [
                styles.wordTileBank,
                pressed && !isChecked && styles.wordTilePressed,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : undefined,
              ]}
              onPress={() => onSelectAvailableWord(word, index)}
              accessibilityRole="button"
              accessibilityLabel={`Välj ordet ${word}`}
            >
              <Text style={styles.wordTileBankText}>{word}</Text>
            </Pressable>
          ))}
          {availableWords.length === 0 && (
            <Text style={styles.bankEmptyText}>Alla ord har placerats.</Text>
          )}
        </View>
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

      {/* ACTION BUTTON */}
      <View style={styles.actionContainer}>
        {!isChecked ? (
          <Button
            title="Kontrollera"
            variant="primary"
            disabled={!isCompleteSentence}
            onPress={onCheck}
            accessibilityLabel="Kontrollera meningen"
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
                accessibilityLabel="Försök igen att bygga meningen"
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

  /* ANSWER BOX */
  answerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    minHeight: 110,
    marginBottom: theme.spacing.lg,
  },
  answerBoxCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.success,
  },
  answerBoxIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  answerBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  answerBoxLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  resetButtonPressed: {
    backgroundColor: '#CBD5E1',
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  placeholderText: {
    fontSize: theme.typography.sizes.sm,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 8,
  },

  /* TILES */
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  wordTilePlaced: {
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  wordTilePlacedCorrect: {
    backgroundColor: '#2E7D32',
  },
  wordTilePlacedIncorrect: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  wordTilePlacedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: theme.typography.sizes.base,
  },
  wordTilePlacedTextIncorrect: {
    color: '#991B1B',
  },

  /* BANK */
  bankContainer: {
    marginBottom: theme.spacing.lg,
  },
  bankLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  wordTileBank: {
    backgroundColor: '#EBF3FA',
    borderWidth: 1,
    borderColor: '#1E4E8C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  wordTilePressed: {
    opacity: 0.8,
  },
  wordTileBankText: {
    color: '#1E4E8C',
    fontWeight: '700',
    fontSize: theme.typography.sizes.base,
  },
  bankEmptyText: {
    fontSize: theme.typography.sizes.xs,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  /* FEEDBACK BOX */
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
  correctAnswerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  actionContainer: {
    marginTop: theme.spacing.xs,
  },
});
