import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../../src/components/BackButton';
import MissionCard from '../../src/components/MissionCard';
import AdminPreviewBanner from '../../src/components/AdminPreviewBanner';
import { theme } from '../../src/theme/theme';
import { useProgress } from '../../src/context/ProgressContext';

export default function A1LevelOverviewScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const { activeMission, missions, chapters } = useProgress();

  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const totalCount = missions.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/learn');
    }
  };

  const handleMissionPress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AdminPreviewBanner />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isTabletOrWeb && styles.tabletScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContainer, isTabletOrWeb && styles.tabletContainer]}>
          {/* DEL 1 – SIDHUVUD OCH TILLBAKANAVIGERING */}
          <View style={styles.topBar}>
            <BackButton
              onPress={handleBack}
              accessibilityLabel="Tillbaka till Lär dig"
            />
          </View>

          <View style={styles.headerContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>A1</Text>
            </View>
            <Text style={styles.levelTitle}>Nybörjare</Text>
            <Text style={styles.levelDescription}>
              Lär dig grunderna och använd svenska i enkla vardagssituationer.
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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

  /* TOP BAR & SIDHUVUD */
  topBar: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
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
  levelTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  /* PROGRESSIONSÖVERSIKT */
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
    marginBottom: 8,
  },
  progressValueText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  progressPercentageText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '800',
    color: theme.colors.success,
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
    backgroundColor: theme.colors.success,
    borderRadius: 4,
  },

  /* KAPITEL SEKTION */
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
