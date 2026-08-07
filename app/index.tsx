import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import Logo from '../src/components/Logo';
import Button from '../src/components/Button';
import ScreenLayout from '../src/components/ScreenLayout';
import NordicWelcomeIllustration from '../src/components/NordicWelcomeIllustration';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenLayout scrollEnabled={true}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Logo size="lg" />
        </View>

        {/* Nordic Premium Scene Illustration showing human conversation in a Swedish environment */}
        <View style={styles.illustrationContainer}>
          <View style={styles.focalZoneBg} />
          <NordicWelcomeIllustration />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.headline}>Ditt liv i Sverige börjar här</Text>
          <Text style={styles.paragraph}>
            Lär dig svenska för verkliga samtal, större självförtroende och en tryggare vardag.
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Kom igång"
            variant="primary"
            elevated={true}
            onPress={() => router.push('/register')}
            accessibilityLabel="Kom igång, skapa ett konto"
          />
          <Button
            title="Jag har redan ett konto"
            variant="secondary"
            onPress={() => router.push('/login')}
            accessibilityLabel="Logga in på ditt befintliga konto"
          />
        </View>

      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    width: '100%',
  },
  topSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  illustrationContainer: {
    marginVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  focalZoneBg: {
    position: 'absolute',
    width: 260,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0F5FB',
    opacity: 0.65,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headline: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.primary, // Deep premium blue #1E4E8C
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  paragraph: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  buttonSection: {
    width: '100%',
    maxWidth: 340,
    marginBottom: theme.spacing.xs,
  },
});
