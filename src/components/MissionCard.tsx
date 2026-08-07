import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ViewStyle,
} from 'react-native';
import { Mission } from '../types/mission';
import { theme } from '../theme/theme';
import Icon from './Icon';

interface MissionCardProps {
  mission: Mission;
  onPress?: () => void;
}

export default function MissionCard({ mission, onPress }: MissionCardProps) {
  const isCompleted = mission.status === 'completed';
  const isActive = mission.status === 'active';
  const isAvailable = mission.status === 'available';

  if (isActive) {
    return (
      <View style={styles.activeCard}>
        <View style={styles.activeHeaderRow}>
          <View style={styles.orderBadgeActive}>
            <Text style={styles.orderBadgeActiveText}>{mission.order}</Text>
          </View>
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>Fortsätt här</Text>
          </View>
        </View>

        <Text style={styles.activeTitle}>{mission.title}</Text>
        <Text style={styles.activeDescription}>{mission.description}</Text>

        {mission.skills && mission.skills.length > 0 && (
          <View style={styles.skillsRowActive}>
            {mission.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillPillActive}>
                <Text style={styles.skillPillActiveText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.activeFooterRow}>
          <View style={styles.metaTimeRow}>
            <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaTimeText}>{mission.estimatedMinutes} min</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.activeButton,
              pressed && styles.activeButtonPressed,
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : undefined,
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Fortsätt uppdrag ${mission.order}: ${mission.title}`}
          >
            <Text style={styles.activeButtonText}>Fortsätt</Text>
            <Icon name="arrow-forward" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    );
  }

  if (isAvailable) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.availableCard,
          pressed && styles.availableCardPressed,
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : undefined,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Uppdrag ${mission.order}: ${mission.title}. Tryck för att starta.`}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.leftGroup}>
            <View style={styles.orderBadgeAvailable}>
              <Text style={styles.orderBadgeAvailableText}>{mission.order}</Text>
            </View>
            <Text style={styles.orderTextAvailable}>Uppdrag {mission.order}</Text>
          </View>
          <View style={styles.availableStatusPill}>
            <Text style={styles.availableStatusText}>Tillgängligt</Text>
          </View>
        </View>

        <Text style={styles.availableTitle}>{mission.title}</Text>
        <Text style={styles.availableDescription}>{mission.description}</Text>

        <View style={styles.cardFooterRow}>
          {mission.skills && mission.skills.length > 0 ? (
            <View style={styles.skillsRow}>
              {mission.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : <View />}

          <View style={styles.metaTimeRow}>
            <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaTimeText}>{mission.estimatedMinutes} min</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  if (isCompleted) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.completedCard,
          pressed && styles.completedCardPressed,
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : undefined,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Slutfört uppdrag ${mission.order}: ${mission.title}. Tryck för att repetera.`}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.leftGroup}>
            <View style={styles.completedBadge}>
              <Icon name="checkmark" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.orderTextCompleted}>Uppdrag {mission.order}</Text>
          </View>
          <View style={styles.completedStatusPill}>
            <Text style={styles.completedStatusText}>Klar</Text>
          </View>
        </View>

        <Text style={styles.completedTitle}>{mission.title}</Text>
        <Text style={styles.completedDescription}>{mission.description}</Text>

        {mission.skills && mission.skills.length > 0 && (
          <View style={styles.skillsRow}>
            {mission.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    );
  }

  // Locked status
  return (
    <View
      style={styles.lockedCard}
      accessibilityRole="text"
      accessibilityState={{ disabled: true }}
      accessibilityLabel={`Låst uppdrag ${mission.order}: ${mission.title}`}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.leftGroup}>
          <View style={styles.orderBadgeLocked}>
            <Text style={styles.orderBadgeLockedText}>{mission.order}</Text>
          </View>
          <Text style={styles.orderTextLocked}>Uppdrag {mission.order}</Text>
        </View>
        <View style={styles.lockedStatusPill}>
          <Icon name="lock-outline" size={14} color="#64748B" />
          <Text style={styles.lockedStatusText}>Låst</Text>
        </View>
      </View>

      <Text style={styles.lockedTitle}>{mission.title}</Text>
      <Text style={styles.lockedDescription}>{mission.description}</Text>

      {mission.skills && mission.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {mission.skills.map((skill, idx) => (
            <View key={idx} style={[styles.skillPill, styles.skillPillLocked]}>
              <Text style={[styles.skillPillText, styles.skillPillTextLocked]}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ACTIVE CARD */
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#1E4E8C',
    shadowColor: '#1E4E8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  orderBadgeActive: {
    backgroundColor: '#1E4E8C',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBadgeActiveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  activeTag: {
    backgroundColor: '#EBF3FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  activeTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  activeDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  skillsRowActive: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  skillPillActive: {
    backgroundColor: '#F0F5FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4E2F0',
  },
  skillPillActiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  activeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaTimeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  activeButtonPressed: {
    backgroundColor: '#163B6B',
  },
  activeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: theme.typography.sizes.sm,
  },

  /* AVAILABLE CARD */
  availableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#C8D8E8',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  availableCardPressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#1E4E8C',
  },
  orderBadgeAvailable: {
    backgroundColor: '#EBF3FA',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8D8E8',
  },
  orderBadgeAvailableText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  orderTextAvailable: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  availableStatusPill: {
    backgroundColor: '#EBF3FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  availableStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  availableTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  availableDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },

  /* COMPLETED CARD */
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  completedCardPressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedBadge: {
    backgroundColor: theme.colors.success,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderTextCompleted: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.success,
  },
  completedStatusPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
  completedTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  completedDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },

  /* LOCKED CARD */
  lockedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderBadgeLocked: {
    backgroundColor: '#F1F5F9',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderBadgeLockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  orderTextLocked: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  lockedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  lockedTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  lockedDescription: {
    fontSize: theme.typography.sizes.xs,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
  },

  /* COMMON FOOTERS & SKILLS */
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  skillPillLocked: {
    backgroundColor: '#F8FAFC',
  },
  skillPillTextLocked: {
    color: '#94A3B8',
  },
});
