import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DialogueBlock } from '../../types/lesson';
import { theme } from '../../theme/theme';
import Button from '../Button';
import Icon from '../Icon';

interface DialogueStepProps {
  block: DialogueBlock;
  onNext: () => void;
}

export default function DialogueStep({ block, onNext }: DialogueStepProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Icon name="chatbubble-outline" size={22} color="#1E4E8C" />
        </View>
        <Text style={styles.stepTitle}>{block.title}</Text>
      </View>

      <Text style={styles.scenarioText}>{block.scenario}</Text>

      <View style={styles.dialogueList}>
        {block.lines.map((line, idx) => {
          const isPrimarySpeaker = idx % 2 === 0;
          return (
            <View
              key={idx}
              style={[
                styles.speechBubbleCard,
                isPrimarySpeaker ? styles.bubblePrimary : styles.bubbleSecondary,
              ]}
            >
              <View style={styles.speakerRow}>
                <View
                  style={[
                    styles.speakerBadge,
                    isPrimarySpeaker ? styles.speakerBadgePrimary : styles.speakerBadgeSecondary,
                  ]}
                >
                  <Text
                    style={[
                      styles.speakerBadgeText,
                      isPrimarySpeaker
                        ? styles.speakerBadgeTextPrimary
                        : styles.speakerBadgeTextSecondary,
                    ]}
                  >
                    {line.speaker}
                  </Text>
                </View>
              </View>
              <Text style={styles.lineText}>{line.text}</Text>
            </View>
          );
        })}
      </View>

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
    marginBottom: theme.spacing.xs,
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
  scenarioText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  dialogueList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  speechBubbleCard: {
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
  },
  bubblePrimary: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    width: '100%',
  },
  bubbleSecondary: {
    backgroundColor: '#EBF3FA',
    borderColor: '#BBE0F2',
    alignSelf: 'flex-end',
    width: '100%',
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  speakerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speakerBadgePrimary: {
    backgroundColor: '#E2E8F0',
  },
  speakerBadgeSecondary: {
    backgroundColor: '#1E4E8C',
  },
  speakerBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
  },
  speakerBadgeTextPrimary: {
    color: theme.colors.textPrimary,
  },
  speakerBadgeTextSecondary: {
    color: '#FFFFFF',
  },
  lineText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: theme.spacing.xs,
  },
});
