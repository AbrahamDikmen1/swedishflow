import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';
import { ListenChoiceBlock, ListenChoiceBlockState } from '../../types/lesson';
import Button from '../Button';
import Icon from '../Icon';
import { AudioPlayer } from '../AudioPlayer';

interface ListenChoiceStepProps {
  block: ListenChoiceBlock;
  state: ListenChoiceBlockState | undefined;
  onStateChange: (state: ListenChoiceBlockState) => void;
  onNext: () => void;
}

export const ListenChoiceStep: React.FC<ListenChoiceStepProps> = ({
  block,
  state,
  onStateChange,
  onNext,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    state?.selectedOption ?? null
  );
  const [isChecked, setIsChecked] = useState<boolean>(state?.isChecked ?? false);

  const isCorrect = selectedOption === block.exercise.correctIndex;

  const handleSelect = (index: number) => {
    if (isChecked) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setIsChecked(true);
    onStateChange({
      type: 'listen_choice',
      selectedOption,
      isChecked: true,
      isCorrect,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{block.exercise.prompt}</Text>

      {/* Audio Playback Box */}
      <View style={styles.audioBox}>
        <AudioPlayer
          text={block.exercise.audioPlaceholderText || block.exercise.prompt}
          audioUrl={block.exercise.audioUrl}
          label="Lyssna på frasen"
        />
      </View>

      {/* Options */}
      <View style={styles.optionsList}>
        {block.exercise.options.map((option, index) => {
          const isSelected = selectedOption === index;
          let optionStyle = styles.optionCard;

          if (isChecked) {
            if (index === block.exercise.correctIndex) {
              optionStyle = { ...styles.optionCard, ...styles.optionCorrect };
            } else if (isSelected && !isCorrect) {
              optionStyle = { ...styles.optionCard, ...styles.optionIncorrect };
            }
          } else if (isSelected) {
            optionStyle = { ...styles.optionCard, ...styles.optionSelected };
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleSelect(index)}
              disabled={isChecked}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.radioCircle}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback & Actions */}
      {isChecked && (
        <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={styles.feedbackHeader}>
            <Icon
              name={isCorrect ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={isCorrect ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.feedbackTitle, { color: isCorrect ? theme.colors.success : theme.colors.error }]}>
              {isCorrect ? 'Rätt svar!' : 'Inte helt rätt'}
            </Text>
          </View>
          <Text style={styles.feedbackText}>
            {isCorrect ? block.exercise.explanationCorrect : block.exercise.explanationIncorrect}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!isChecked ? (
          <Button
            title="Kontrollera svar"
            onPress={handleCheck}
            disabled={selectedOption === null}
            variant="primary"
          />
        ) : (
          <Button title="Nästa övning" onPress={onNext} variant="primary" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  prompt: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  audioBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionsList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EBF3FA',
  },
  optionCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: '#DEF7EC',
  },
  optionIncorrect: {
    borderColor: theme.colors.error,
    backgroundColor: '#FDE8E8',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  feedbackBox: {
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.lg,
  },
  feedbackCorrect: {
    backgroundColor: '#DEF7EC',
  },
  feedbackIncorrect: {
    backgroundColor: '#FDE8E8',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  feedbackTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
});
