import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExplanationBlock } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface ExplanationStepProps {
  block: ExplanationBlock;
  onNext: () => void;
}

export default function ExplanationStep({ block, onNext }: ExplanationStepProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Icon name="book-outline" size={22} color="#1E4E8C" />
        </View>
        <Text style={styles.stepTitle}>{block.title}</Text>
      </View>

      {block.instruction && (
        <Text style={styles.instructionText}>{block.instruction}</Text>
      )}

      {block.body ? (
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>{block.body}</Text>
        </View>
      ) : null}

      {block.examples && block.examples.length > 0 && (
        <View style={styles.examplesSection}>
          <Text style={styles.sectionSublabel}>Exempel:</Text>
          <View style={styles.examplesList}>
            {block.examples.map((ex, idx) => (
              <View key={idx} style={styles.exampleRow}>
                <Icon name="arrow-forward" size={16} color="#1E4E8C" />
                <Text style={styles.exampleText}>{ex.phrase}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {block.infoBox ? (
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color="#1E4E8C" />
          <Text style={styles.infoBoxText}>{block.infoBox}</Text>
        </View>
      ) : null}

      <View style={styles.actionContainer}>
        <Button
          title="Fortsätt"
          variant="primary"
          onPress={onNext}
          accessibilityLabel="Gå vidare till nästa steg"
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  iconCircle: {
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
  instructionText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: '#1E4E8C',
    marginBottom: theme.spacing.md,
  },
  bodyContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
  },
  bodyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  examplesSection: {
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
  examplesList: {
    gap: theme.spacing.xs,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  infoBox: {
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
  infoBoxText: {
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
