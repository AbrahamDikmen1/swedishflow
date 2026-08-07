import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VocabularyBlock } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface VocabularyStepProps {
  block: VocabularyBlock;
  onNext: () => void;
  onBack: () => void;
}

export default function VocabularyStep({
  block,
  onNext,
  onBack,
}: VocabularyStepProps) {
  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>{block.title}</Text>

      <View style={styles.phrasesList}>
        {block.phrases.map((item, idx) => (
          <View key={idx} style={styles.phraseCard}>
            <Text style={styles.phraseMainText}>{item.phrase}</Text>
            <Text style={styles.phraseExplanationText}>{item.explanation}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grammaticalNoteBox}>
        <Icon name="information-circle-outline" size={18} color="#1E4E8C" />
        <Text style={styles.grammaticalNoteText}>{block.infoBox}</Text>
      </View>

      <View style={styles.dualButtonRow}>
        <View style={styles.flexButton}>
          <Button
            title="Tillbaka"
            variant="secondary"
            onPress={onBack}
            accessibilityLabel="Gå tillbaka till introduktionen"
          />
        </View>
        <View style={styles.flexButton}>
          <Button
            title="Fortsätt"
            variant="primary"
            onPress={onNext}
            accessibilityLabel="Gå vidare till kontrollfrågan"
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
  stepTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  phrasesList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  phraseCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phraseMainText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  phraseExplanationText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  grammaticalNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EBF3FA',
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBE0F2',
    marginBottom: theme.spacing.xl,
  },
  grammaticalNoteText: {
    fontSize: theme.typography.sizes.sm,
    color: '#1E4E8C',
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  dualButtonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  flexButton: {
    flex: 1,
  },
});
