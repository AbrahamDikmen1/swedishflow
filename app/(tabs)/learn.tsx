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
import MissionCard from '../../src/components/MissionCard';
import { theme } from '../../src/theme/theme';
import { useProgress } from '../../src/context/ProgressContext';

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const { activeMission, chapters } = useProgress();

  const handleMissionPress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

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
          {/* DEL 1 – SIDHUVUD */}
          <View style={styles.headerContainer}>
            <Pressable
              style={({ pressed }) => [styles.levelBadge, pressed && { opacity: 0.8 }]}
              onPress={() => router.push('/learn/a1')}
              accessibilityRole="button"
              accessibilityLabel="Visa A1 nivåöversikt"
            >
              <Text style={styles.levelBadgeText}>A1</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Kursöversikt</Text>
            <Text style={styles.pageSubtitle}>
              Följ din väg genom svenskan, ett uppdrag i taget.
            </Text>
          </View>

          {/* DEL 2 – PROGRESSIONSÖVERSIKT */}
          {activeMission && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>Aktuellt uppdrag</Text>
                <Text style={styles.progressNextText}>Uppdrag {activeMission.order}</Text>
              </View>

              <View style={styles.progressValueRow}>
                <Text style={styles.progressValueText}>
                  {activeMission.title}
                </Text>
              </View>
            </View>
          )}

          {/* DEL 3 – KAPITEL OCH UPPDRAGSLISTOR */}
          <View style={styles.chaptersSection}>
            {chapters.map((chapter) => {
              const chapterCompleted = chapter.missions.filter((m) => m.status === 'completed').length;
              const chapterTotal = chapter.missions.length;

              return (
                <View key={chapter.id} style={styles.chapterCard}>
                  {/* KAPITELSIDHUVUD */}
                  <View style={styles.chapterHeader}>
                    <View style={styles.chapterHeaderLeft}>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                      <Text style={styles.chapterDescription}>{chapter.description}</Text>
                    </View>
                    <View style={styles.chapterBadge}>
                      <Text style={styles.chapterBadgeText}>
                        {chapterCompleted}/{chapterTotal}
                      </Text>
                    </View>
                  </View>

                  {/* KAPITLETS UPPDRAGSLISTA */}
                  <View style={styles.missionsList}>
                    {chapter.missions.map((mission) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        onPress={
                          mission.status !== 'locked' && mission.route
                            ? () => handleMissionPress(mission.route)
                            : undefined
                        }
                      />
                    ))}
                  </View>
                </View>
              );
            })}
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
    paddingBottom: 110,
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

  /* DEL 1 – SIDHUVUD */
  headerContainer: {
    marginBottom: theme.spacing.lg,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: theme.spacing.xs,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: theme.typography.sizes.sm,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  /* DEL 2 – PROGRESSIONSÖVERSIKT */
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressNextText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  progressValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressValueText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  /* DEL 3 – KAPITEL SEKTION */
  chaptersSection: {
    gap: theme.spacing.xl,
  },
  chapterCard: {
    backgroundColor: 'transparent',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chapterHeaderLeft: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  chapterTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  chapterDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  chapterBadge: {
    backgroundColor: '#EBF3FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  chapterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  missionsList: {
    gap: theme.spacing.md,
  },
});
