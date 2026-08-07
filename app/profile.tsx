import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../src/components/Button';
import Icon from '../src/components/Icon';
import { theme } from '../src/theme/theme';
import { mockStudentDashboard } from '../src/data/mockStudent';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;
  const { user } = mockStudentDashboard;

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
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.subtitle}>Ditt konto och dina inställningar.</Text>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user.firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{user.firstName}</Text>
            <Text style={styles.userLevel}>Nivå {user.levelCode} • {user.levelTitle}</Text>
          </View>

          {/* USER STATS CARD */}
          <View style={styles.infoCard}>
            <Text style={styles.cardSectionTitle}>Kontoinformation</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Namn</Text>
              <Text style={styles.infoValue}>{user.firstName}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aktuell nivå</Text>
              <Text style={styles.infoValue}>{user.levelCode} ({user.levelTitle})</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Genomförda uppdrag</Text>
              <Text style={styles.infoValue}>{user.completedMissionsCount} av {user.totalMissionsCount}</Text>
            </View>
          </View>

          {/* SETTINGS OPTIONS */}
          <View style={styles.settingsCard}>
            <Text style={styles.cardSectionTitle}>Inställningar</Text>

            <View style={styles.settingItem}>
              <Icon name="person-outline" size={20} color="#1E4E8C" />
              <Text style={styles.settingLabel}>Redigera profil</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <Icon name="notifications-outline" size={20} color="#1E4E8C" />
              <Text style={styles.settingLabel}>Påminnelser och notiser</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <Icon name="shield-checkmark-outline" size={20} color="#1E4E8C" />
              <Text style={styles.settingLabel}>Integritet och konto</Text>
            </View>
          </View>

          <View style={styles.logoutWrapper}>
            <Button
              title="Logga ut"
              variant="secondary"
              onPress={() => router.push('/login')}
              accessibilityLabel="Logga ut från SwedishFlow"
            />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF3FA',
    borderWidth: 2,
    borderColor: '#1E4E8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarInitial: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
    color: '#1E4E8C',
  },
  userName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  userLevel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.xl,
  },
  cardSectionTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: theme.spacing.sm,
  },
  settingLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  logoutWrapper: {
    marginTop: theme.spacing.xs,
  },
});
