import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../src/components/Icon';
import { theme } from '../../src/theme/theme';
import { mockStudentDashboard } from '../../src/data/mockStudent';
import Button from '../../src/components/Button';
import { useProgress } from '../../src/context/ProgressContext';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const { activeMission, completedMissionIds, missions } = useProgress();
  const { user, weeklyProgress } = mockStudentDashboard;

  const currentMission = activeMission;
  const completedCount = completedMissionIds.length;
  const totalCount = missions.length;
  const levelPercentage = Math.round((completedCount / totalCount) * 100);

  // Bottom navigation height (60px base bar + bottom safe area inset) + 24px visual padding
  const bottomPadding = 60 + Math.max(insets.bottom, 10) + 24;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
          isTabletOrWeb && styles.tabletScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContainer, isTabletOrWeb && styles.tabletContainer]}>
          {/* 1. TOPPSEKTION (Header) */}
          <View style={styles.topHeader}>
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greetingSub}>{user.greeting}</Text>
              <Text style={styles.greetingTitle}>Hej, {user.firstName}!</Text>
              <Text style={styles.greetingSubtitle}>Redo att fortsätta din svenska?</Text>
            </View>
          </View>

          {/* 2. AKTUELL NIVÅ */}
          <View style={styles.levelCard}>
            <View style={styles.levelHeaderRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{user.levelCode}</Text>
              </View>
              <View style={styles.levelTitleContainer}>
                <Text style={styles.levelTitle}>{user.levelTitle}</Text>
                <Text style={styles.levelProgressText}>
                  {completedCount} av {totalCount} uppdrag slutförda ({levelPercentage}%)
                </Text>
              </View>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${levelPercentage}%` }]} />
            </View>
          </View>

          {/* 3. FORTSÄTT MED KURSEN (Enkel huvudkort för lektionen) */}
          <View style={styles.continueCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>Fortsätt med kursen</Text>
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>Uppdrag {currentMission.id}</Text>
              </View>
            </View>

            <Text style={styles.missionTitle}>{currentMission.title}</Text>
            <Text style={styles.missionDescription}>
              {currentMission.description}
            </Text>

            <View style={styles.missionMetaRow}>
              <View style={styles.metaItem}>
                <Icon name="flag-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>Uppdrag {currentMission.id}</Text>
              </View>

              <View style={styles.metaDot} />

              <View style={styles.metaItem}>
                <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{currentMission.estimatedMinutes} min</Text>
              </View>
            </View>

            <View style={styles.continueButtonWrapper}>
              <Button
                title="Fortsätt"
                variant="primary"
                onPress={() => router.push(`/learn/a1/mission/${currentMission.id}` as any)}
                accessibilityLabel={`Fortsätt lektion: Uppdrag ${currentMission.id} ${currentMission.title}`}
              />
            </View>
          </View>

          {/* 4. VECKANS FRAMSTEG */}
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyHeaderRow}>
              <Text style={styles.weeklyTitle}>Veckans framsteg</Text>
              <Text style={styles.weeklySummaryText}>
                {weeklyProgress.completedDaysCount} av {weeklyProgress.totalDaysCount} dagar
              </Text>
            </View>

            <View style={styles.daysRow}>
              {weeklyProgress.days.map((dayItem, idx) => {
                return (
                  <View key={idx} style={styles.dayCol}>
                    <View
                      style={[
                        styles.dayCircle,
                        dayItem.isCompleted && styles.dayCircleCompleted,
                        dayItem.isCurrent && styles.dayCircleCurrent,
                      ]}
                    >
                      {dayItem.isCompleted ? (
                        <Icon name="checkmark" size={16} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.dayCircleText,
                            dayItem.isCurrent && styles.dayCircleTextCurrent,
                          ]}
                        >
                          {dayItem.dayLabel.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayLabel,
                        dayItem.isCurrent && styles.dayLabelCurrent,
                      ]}
                    >
                      {dayItem.dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 110, // Generous space so bottom bar doesn't overlap content
  },
  tabletScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  mainContainer: {
    width: '100%',
  },
  tabletContainer: {
    maxWidth: 640,
    alignSelf: 'center',
  },

  /* 1. TOPPSEKTION */
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  greetingSub: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  greetingSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
  },
  avatarButton: {
    marginTop: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  avatarButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF3FA',
    borderWidth: 1.5,
    borderColor: '#C8D8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  /* 2. AKTUELL NIVÅ */
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  levelBadge: {
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: theme.typography.sizes.sm,
    letterSpacing: 0.5,
  },
  levelTitleContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  levelProgressText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success, // Calm soft green #2E7D32
    borderRadius: 4,
  },

  /* 3. FORTSÄTT LÄRA (Prominent Primary Card) */
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#1E4E8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardHeaderTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: '#1E4E8C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EBF3FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  missionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  missionDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  missionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textMuted,
    marginHorizontal: theme.spacing.sm,
  },
  continueButtonWrapper: {
    marginTop: theme.spacing.xs,
  },

  /* 4. VECKANS FRAMSTEG (Lighter, clean container) */
  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  weeklyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  weeklyTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  weeklySummaryText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayCircleCompleted: {
    backgroundColor: theme.colors.success, // Verified active day: Calm soft green
  },
  dayCircleCurrent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#475569', // Neutral slate border for today's date orientation mark
  },
  dayCircleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  dayCircleTextCurrent: {
    color: '#1E293B',
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  dayLabelCurrent: {
    fontWeight: '700',
    color: '#1E293B',
  },
});
