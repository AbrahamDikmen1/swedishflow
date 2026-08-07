import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme/theme';
import Button from '../../src/components/Button';
import BackButton from '../../src/components/BackButton';

export default function MissionRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Redirect legacy /mission/[id] route to canonical /learn/a1/mission/[missionId] route
  useEffect(() => {
    const rawId = String(id || '4');
    const cleanId = rawId.replace('mission_', '');
    router.replace(`/learn/a1/mission/${cleanId}`);
  }, [id, router]);

  const rawId = String(id || '4');
  const cleanId = rawId.replace('mission_', '');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton
          onPress={() => router.push('/learn/a1')}
          accessibilityLabel="Gå till A1"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Omdirigerar till Uppdrag {cleanId}...</Text>
        <Text style={styles.subtitle}>Du skickas vidare till den kanoniska lektionsskärmen.</Text>
        <View style={styles.buttonWrapper}>
          <Button
            title={`Öppna Uppdrag ${cleanId}`}
            onPress={() => router.replace(`/learn/a1/mission/${cleanId}`)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 280,
  },
});
