import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import Icon from '../../src/components/Icon';
import { theme } from '../../src/theme/theme';
import { useProgress } from '../../src/context/ProgressContext';
import { useAuth } from '../../src/context/AuthContext';
import { getCleanDisplayName } from '../../src/utils/userDisplay';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const { user, signOut } = useAuth();
  const { completedMissionIds, totalPoints, missions, resetProgress } = useProgress();

  const totalMissions = missions.length;
  const completedCount = completedMissionIds.length;
  const progressPercent =
    totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  // Local visual preferences
  const [autoAudio, setAutoAudio] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const bottomPadding = 60 + Math.max(insets.bottom, 10) + 24;

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  const handleResetProgress = async () => {
    await resetProgress();
    showStatus('Din progression har återställts.');
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const displayName = getCleanDisplayName(user, {
    fallback: user?.role === 'admin' ? 'Administratör' : (user?.email ? user.email.split('@')[0] : 'SFI-elev'),
  });
  const displayEmail = user?.email || 'elev@exempel.se';
  const displayRole = user?.role === 'admin' ? 'Administratör' : 'SFI-elev (A1)';
  const displayGoal = user?.targetGoal || (user?.role === 'admin' ? 'Kursadministration & Systemöversikt' : 'Svenska A1 (Samtliga 12 uppdrag)');
  const displayLevel = user?.level || (user?.role === 'admin' ? 'Admin' : 'A1 – Nybörjare');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SF';

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
            <Text style={styles.title}>Profil & Inställningar</Text>
            <Text style={styles.subtitle}>
              Hantera ditt konto, dina visuella inställningar och din progression.
            </Text>
          </View>

          {/* STATUS NOTIFICATION TOAST */}
          {statusMessage && (
            <View style={styles.statusToast}>
              <Icon name="checkmark-circle-outline" size={18} color="#059669" />
              <Text style={styles.statusToastText}>{statusMessage}</Text>
            </View>
          )}

          {/* PROFILE HEADER CARD */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{displayRole}</Text>
            </View>
          </View>

          {/* 1. ANVÄNDARINFORMATION */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Icon name="person-outline" size={20} color="#1E4E8C" />
              <Text style={styles.cardTitle}>Kontoinformation</Text>
              <View style={user?.isDemo ? styles.mockDataBadge : styles.realDataBadge}>
                <Text style={user?.isDemo ? styles.mockDataBadgeText : styles.realDataBadgeText}>
                  {user?.isDemo ? 'Demokonto' : 'Autentiserad'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              Dina kontouppgifter och synkroniseringsstatus.
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Namn</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-postadress</Text>
              <Text style={styles.infoValue}>{displayEmail}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Inlärningsmål</Text>
              <Text style={styles.infoValue}>{displayGoal}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Totalt intjänade poäng</Text>
              <Text style={styles.infoValue}>{totalPoints} poäng</Text>
            </View>

            <View style={styles.securityNoteBox}>
              <Icon name="shield-checkmark-outline" size={16} color="#0369A1" />
              <Text style={styles.securityNoteText}>
                Lösenord och känsliga säkerhetstokens exponeras aldrig i applikationen.
              </Text>
            </View>
          </View>

          {/* 2. PROGRESSION & ÅTERSTÄLLNING */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Icon name="bar-chart-outline" size={20} color="#1E4E8C" />
              <Text style={styles.cardTitle}>Kursframsteg</Text>
              <View style={styles.realDataBadge}>
                <Text style={styles.realDataBadgeText}>Live</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aktuell nivå</Text>
              <Text style={styles.infoValue}>{displayLevel}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Slutförda uppdrag</Text>
              <Text style={styles.infoValue}>
                {completedCount} av {totalMissions} ({progressPercent}%)
              </Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            <View style={styles.resetButtonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleResetProgress}
                accessibilityRole="button"
                accessibilityLabel="Återställ kursprogression"
              >
                <Icon name="refresh-outline" size={16} color="#DC2626" />
                <Text style={styles.resetButtonText}>Återställ kursprogression</Text>
              </Pressable>
            </View>
          </View>

          {/* 3. VISUELLA & APP-INSTÄLLNINGAR */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Icon name="notifications-outline" size={20} color="#1E4E8C" />
              <Text style={styles.cardTitle}>App-inställningar</Text>
            </View>

            {/* AUTOMATISKT LJUD */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Automatisk ljuduppspelning</Text>
                <Text style={styles.settingDescription}>
                  Spela automatiskt upp uttal när nya ord visas i övningar.
                </Text>
              </View>
              <Switch
                value={autoAudio}
                onValueChange={(val) => {
                  setAutoAudio(val);
                  showStatus(val ? 'Automatisk ljuduppspelning aktiverad' : 'Automatisk ljuduppspelning inaktiverad');
                }}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={autoAudio ? '#1E4E8C' : '#F1F5F9'}
              />
            </View>
            <View style={styles.divider} />

            {/* DAGLIGA PÅMINNELSER */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Dagliga studienotiser</Text>
                <Text style={styles.settingDescription}>
                  Få en kort påminnelse för att hålla igång din dagliga träning.
                </Text>
              </View>
              <Switch
                value={dailyReminders}
                onValueChange={(val) => {
                  setDailyReminders(val);
                  showStatus(val ? 'Dagliga studienotiser aktiverade' : 'Dagliga studienotiser inaktiverade');
                }}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={dailyReminders ? '#1E4E8C' : '#F1F5F9'}
              />
            </View>
            <View style={styles.divider} />

            {/* TEXTSTORLEK */}
            <View style={styles.settingRowStacked}>
              <Text style={styles.settingTitle}>Textstorlek i övningar</Text>
              <Text style={styles.settingDescription}>
                Anpassa textstorleken för bästa läsbarhet under lektioner.
              </Text>
              <View style={styles.textSizePillContainer}>
                <Pressable
                  style={[
                    styles.textSizePill,
                    textSize === 'normal' && styles.textSizePillActive,
                  ]}
                  onPress={() => {
                    setTextSize('normal');
                    showStatus('Textstorlek inställd på Standard');
                  }}
                >
                  <Text
                    style={[
                      styles.textSizePillText,
                      textSize === 'normal' && styles.textSizePillTextActive,
                    ]}
                  >
                    Standard
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.textSizePill,
                    textSize === 'large' && styles.textSizePillActive,
                  ]}
                  onPress={() => {
                    setTextSize('large');
                    showStatus('Textstorlek inställd på Stor text');
                  }}
                >
                  <Text
                    style={[
                      styles.textSizePillText,
                      textSize === 'large' && styles.textSizePillTextActive,
                    ]}
                  >
                    Stor text
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.divider} />

            {/* MÖRKT LÄGE */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Mörkt läge (Tema)</Text>
                <Text style={styles.settingDescription}>
                  Växla till mörkt färgschema (ljust tema rekommenderas för läsbarhet).
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={(val) => {
                  setDarkMode(val);
                  showStatus(val ? 'Mörkt tema aktiverat (simulerat)' : 'Ljust tema aktiverat');
                }}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={darkMode ? '#1E4E8C' : '#F1F5F9'}
              />
            </View>
          </View>

          {/* 4. UTLOGGNINGSKNAPP */}
          <View style={styles.logoutCard}>
            <Text style={styles.logoutCardTitle}>Inloggad som {displayName}</Text>
            <Text style={styles.logoutCardSubtitle}>
              Klicka nedan för att avsluta din nuvarande session och återgå till inloggningssidan.
            </Text>

            <View style={styles.logoutButtonWrapper}>
              <Button
                title="Logga ut"
                variant="secondary"
                onPress={handleLogout}
                accessibilityLabel="Logga ut från SwedishFlow"
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  tabletScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  mainContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  tabletContainer: {
    maxWidth: 640,
  },
  headerContainer: {
    marginBottom: theme.spacing.md,
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
  statusToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  statusToastText: {
    flex: 1,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: '#065F46',
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E4E8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarInitial: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  mockDataBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mockDataBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  realDataBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  realDataBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: theme.spacing.xs,
  },
  securityNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
    gap: 8,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1E4E8C',
    borderRadius: 4,
  },
  resetButtonRow: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  resetButtonText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: '#DC2626',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  settingRowStacked: {
    paddingVertical: theme.spacing.xs,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  settingDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  textSizePillContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: theme.spacing.sm,
  },
  textSizePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  textSizePillActive: {
    backgroundColor: '#1E4E8C',
    borderColor: '#1E4E8C',
  },
  textSizePillText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  textSizePillTextActive: {
    color: '#FFFFFF',
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.xl,
  },
  logoutCardTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  logoutCardSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  logoutButtonWrapper: {
    maxWidth: 200,
  },
});
