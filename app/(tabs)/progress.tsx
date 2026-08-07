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
import Icon from '../../src/components/Icon';
import Button from '../../src/components/Button';
import { theme } from '../../src/theme/theme';

export default function ProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

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
            <Text style={styles.title}>Framsteg</Text>
            <Text style={styles.subtitle}>Följ din utveckling över tid.</Text>
          </View>

          {/* EMPTY STATE CARD */}
          <View style={styles.emptyCard}>
            <View style={styles.iconCircle}>
              <Icon name="bar-chart-outline" size={26} color="#1E4E8C" />
            </View>
            <Text style={styles.emptyTitle}>Inga genomförda uppdrag än</Text>
            <Text style={styles.emptyBody}>
              Dina framsteg visas här när du har genomfört ett uppdrag.
            </Text>
            <View style={styles.buttonWrapper}>
              <Button
                title="Gå till kursen"
                variant="primary"
                onPress={() => router.push('/learn/a1/mission/4')}
                accessibilityLabel="Gå till kursen"
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBF3FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
    maxWidth: 380,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 220,
  },
});
