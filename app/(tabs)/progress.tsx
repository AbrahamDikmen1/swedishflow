import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../src/components/Icon';
import Button from '../../src/components/Button';
import { theme } from '../../src/theme/theme';
import { useProgress } from '../../src/context/ProgressContext';

export default function ProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const { completedMissionIds, missions, activeMission } = useProgress();

  const totalMissions = missions.length;
  const completedCount = completedMissionIds.length;
  const progressPercent = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  // Gather unique skills from completed missions
  const completedMissions = missions.filter((m) => m.status === 'completed');
  const acquiredSkillsSet = new Set<string>();
  completedMissions.forEach((m) => {
    if (m.skills) {
      m.skills.forEach((skill) => acquiredSkillsSet.add(skill));
    }
  });
  const acquiredSkills = Array.from(acquiredSkillsSet);

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
          {/* HEADER */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Framsteg</Text>
            <Text style={styles.subtitle}>Följ din utveckling och dina resultat över tid.</Text>
          </View>

          {/* 1. OVERVIEW / LEVEL PROGRESS CARD */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>A1</Text>
              </View>
              <View style={styles.levelTitleContainer}>
                <Text style={styles.levelTitle}>Nivå A1 – Nybörjare</Text>
                <Text style={styles.levelSubtitle}>
                  {completedCount} av {totalMissions} uppdrag genomförda ({progressPercent}%)
                </Text>
              </View>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            {/* STATS GRID */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{completedCount} / {totalMissions}</Text>
                <Text style={styles.statLabel}>Slutförda uppdrag</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{acquiredSkills.length}</Text>
                <Text style={styles.statLabel}>Tränade färdigheter</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>A1</Text>
                <Text style={styles.statLabel}>Aktuell nivå</Text>
              </View>
            </View>
          </View>

          {/* 2. UPPDRAGSÖVERSIKT */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Uppdragsöversikt A1</Text>
            <Text style={styles.sectionSubtitle}>
              Översikt över din status för uppdragen i A1-kursen.
            </Text>

            <View style={styles.missionList}>
              {missions.map((mission) => {
                const isCompleted = mission.status === 'completed';
                const isActive = mission.status === 'active';
                const isLocked = mission.status === 'locked';

                return (
                  <Pressable
                    key={mission.id}
                    disabled={isLocked}
                    style={({ pressed }) => [
                      styles.missionCard,
                      isCompleted && styles.missionCardCompleted,
                      isActive && styles.missionCardActive,
                      isLocked && styles.missionCardLocked,
                      pressed && !isLocked && { opacity: 0.9 },
                    ]}
                    onPress={() => {
                      if (!isLocked && mission.route) {
                        router.push(mission.route as any);
                      }
                    }}
                    accessibilityRole={isLocked ? 'none' : 'button'}
                    accessibilityState={{ disabled: isLocked }}
                    accessibilityLabel={`Uppdrag ${mission.order}: ${mission.title}. Status: ${
                      isCompleted ? 'Slutfört' : isActive ? 'Pågående' : 'Låst (Ej tillgängligt ännu)'
                    }`}
                  >
                    <View style={styles.missionHeader}>
                      <View style={styles.missionOrderBadge}>
                        <Text style={styles.missionOrderText}>{mission.order}</Text>
                      </View>
                      <View style={styles.missionTitleWrapper}>
                        <Text style={styles.missionTitle}>{mission.title}</Text>
                        <Text style={styles.missionDescription}>{mission.description}</Text>
                      </View>
                    </View>

                    <View style={styles.missionFooter}>
                      {/* STATUS BADGE */}
                      {isCompleted && (
                        <View style={styles.badgeCompleted}>
                          <Icon name="checkmark" size={14} color="#059669" />
                          <Text style={styles.badgeCompletedText}>Slutfört</Text>
                        </View>
                      )}
                      {isActive && (
                        <View style={styles.badgeActive}>
                          <Icon name="arrow-forward" size={14} color="#1E4E8C" />
                          <Text style={styles.badgeActiveText}>Pågående</Text>
                        </View>
                      )}
                      {isLocked && (
                        <View style={styles.badgeLocked}>
                          <Icon name="lock-outline" size={14} color="#64748B" />
                          <Text style={styles.badgeLockedText}>Låst</Text>
                        </View>
                      )}

                      {!isLocked && (
                        <View style={styles.actionArrow}>
                          <Icon name="arrow-forward" size={16} color="#1E4E8C" />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3. TRÄNADE FÄRDIGHETER */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tränade färdigheter</Text>
            <Text style={styles.sectionSubtitle}>
              Moment och färdigheter som du har tränat genom slutförda uppdrag.
            </Text>

            {acquiredSkills.length > 0 ? (
              <View style={styles.skillsGrid}>
                {acquiredSkills.map((skill) => (
                  <View key={skill} style={styles.skillPill}>
                    <Icon name="checkmark" size={14} color="#059669" />
                    <Text style={styles.skillPillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptySkillsCard}>
                <Icon name="bar-chart-outline" size={24} color="#64748B" />
                <Text style={styles.emptySkillsTitle}>Inga färdigheter registrerade än</Text>
                <Text style={styles.emptySkillsText}>
                  När du genomför ditt första uppdrag samlas dina tränade färdigheter här.
                </Text>
              </View>
            )}
          </View>

          {/* 4. ACTION CALLOUT */}
          <View style={styles.calloutCard}>
            <Text style={styles.calloutTitle}>
              {completedCount === totalMissions
                ? 'Alla uppdrag slutförda!'
                : completedCount > 0
                ? 'Fortsätt din utveckling!'
                : 'Redo att starta ditt första uppdrag?'}
            </Text>
            <Text style={styles.calloutBody}>
              {completedCount === totalMissions
                ? 'Du har genomfört alla uppdrag i A1-nivån. Du kan repetera uppdragen när som helst.'
                : activeMission
                ? `Nästa steg är Uppdrag ${activeMission.order}: ${activeMission.title}.`
                : 'Starta Uppdrag 1 för att påbörja din resa i svenska!'}
            </Text>
            <View style={styles.calloutButtonWrapper}>
              <Button
                title={
                  completedCount === totalMissions
                    ? 'Repetera A1-kursen'
                    : activeMission
                    ? `Fortsätt: Uppdrag ${activeMission.order}`
                    : 'Starta Uppdrag 1'
                }
                variant="primary"
                onPress={() => {
                  if (activeMission && activeMission.route) {
                    router.push(activeMission.route as any);
                  } else {
                    router.push('/learn/a1/mission/1');
                  }
                }}
                accessibilityLabel="Fortsätt uppdrag"
              />
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
    paddingTop: theme.spacing.lg,
  },
  tabletScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  mainContainer: {
    width: '100%',
  },
  tabletContainer: {
    maxWidth: 640,
    alignSelf: 'center',
  },
  headerContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  /* SUMMARY CARD */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E4E8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
  },
  levelTitleContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  levelSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1E4E8C',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },

  /* SECTION */
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },

  /* MISSION LIST */
  missionList: {
    gap: theme.spacing.md,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  missionCardCompleted: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  missionCardActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  missionCardLocked: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  missionOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  missionOrderText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  missionTitleWrapper: {
    flex: 1,
  },
  missionTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  missionDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  missionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  badgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeCompletedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  badgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeActiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  badgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeLockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  /* SKILLS */
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  skillPillText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: '#065F46',
  },
  emptySkillsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptySkillsTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 6,
    marginBottom: 2,
  },
  emptySkillsText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  /* CALLOUT CARD */
  calloutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calloutTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  calloutBody: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  calloutButtonWrapper: {
    maxWidth: 240,
  },
});

