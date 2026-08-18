import React, { useMemo } from 'react';
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

export interface WordToken {
  id: string;
  word: string;
}

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
  // Calculate expected token count based on correct target sentence words
  const expectedTokenCount = useMemo(() => {
    return exercise.correctSentence.trim().split(/\s+/).filter(Boolean).length;
  }, [exercise.correctSentence]);

  // Kontrollera button is enabled ONLY when exact number of tokens needed for target sentence is placed
  const canCheck = placedWords.length === expectedTokenCount;

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
                key={`placed-slot-${index}-${word}`}
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
              key={`bank-slot-${index}-${word}`}
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
          {!isCorrect && (
            <Text style={styles.correctSentenceHint}>
              Rätt mening: <Text style={styles.correctSentenceBold}>{exercise.correctSentence}</Text>
            </Text>
          )}
        </View>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actionContainer}>
        {!isChecked ? (
          <Button
            title="Kontrollera"
            variant="primary"
            disabled={!canCheck}
            onPress={onCheck}
            accessibilityLabel="Kontrollera din mening"
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
                accessibilityLabel="Försök bygga meningen igen"
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
  instructionText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 28,
  },
  answerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: theme.spacing.md,
    minHeight: 120,
    marginBottom: theme.spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  answerBoxCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  answerBoxIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  answerBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  answerBoxLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  resetButtonPressed: {
    backgroundColor: '#E2E8F0',
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  placeholderText: {
    fontSize: 15,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: theme.spacing.md,
    textAlign: 'center',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  wordTilePlaced: {
    backgroundColor: '#1E4E8C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  wordTilePlacedCorrect: {
    backgroundColor: '#059669',
  },
  wordTilePlacedIncorrect: {
    backgroundColor: '#DC2626',
  },
  wordTilePlacedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  wordTilePlacedTextIncorrect: {
    color: '#FFFFFF',
  },
  bankContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  bankLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  wordTileBank: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  wordTilePressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  wordTileBankText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  bankEmptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 6,
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
  correctSentenceHint: {
    marginTop: 8,
    fontSize: 14,
    color: '#475569',
  },
  correctSentenceBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  actionContainer: {
    marginTop: theme.spacing.sm,
    width: '100%',
  },
});
