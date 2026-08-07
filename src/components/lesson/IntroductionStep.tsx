import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IntroductionBlock } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface IntroductionStepProps {
  block: IntroductionBlock;
  onNext: () => void;
}

export default function IntroductionStep({ block, onNext }: IntroductionStepProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.introHeaderRow}>
        <View style={styles.locationIconBadge}>
          <Icon name="location-outline" size={20} color="#1E4E8C" />
        </View>
        <Text style={styles.stepTitle}>{block.title}</Text>
      </View>

      <Text style={styles.introBodyText}>{block.introduction}</Text>

      <Text style={styles.sectionSublabel}>Exempel:</Text>
      <View style={styles.examplesContainer}>
        {block.examples.map((ex, idx) => (
          <View key={idx} style={styles.exampleRow}>
            <Icon name="chatbubble-outline" size={16} color="#1E4E8C" />
            <Text style={styles.exampleText}>{ex.phrase}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grammaticalNoteBox}>
        <Icon name="information-circle-outline" size={18} color="#1E4E8C" />
        <Text style={styles.grammaticalNoteText}>{block.grammaticalNote}</Text>
      </View>

      <View style={styles.actionContainer}>
        <Button
          title="Börja"
          variant="primary"
          onPress={onNext}
          accessibilityLabel="Börja lektionen"
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
  introHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  locationIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF3FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  introBodyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  sectionSublabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  examplesContainer: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exampleText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
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
  actionContainer: {
    marginTop: theme.spacing.xs,
  },
});
