import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import Logo from '../src/components/Logo';
import FormField from '../src/components/FormField';
import Button from '../src/components/Button';
import ScreenLayout from '../src/components/ScreenLayout';
import FormMessage from '../src/components/FormMessage';
import BackButton from '../src/components/BackButton';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState('');

  // Status & Error States
  const [error, setError] = useState<string | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const validateEmailFormat = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Remove error dynamically when correct
    if (error) {
      if (text.trim() && validateEmailFormat(text)) {
        setError(undefined);
      }
    }
  };

  const handleSendResetLink = () => {
    if (!email.trim()) {
      setError('E-postadress krävs.');
      setStatusMessage(null);
      return;
    }

    if (!validateEmailFormat(email)) {
      setError('E-postadressen måste ha ett giltigt format.');
      setStatusMessage(null);
      return;
    }

    setError(undefined);
    setStatusMessage(
      'Om det finns ett konto med den angivna e-postadressen kommer en återställningslänk att skickas.'
    );
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <BackButton
          onPress={() => router.push('/login')}
          accessibilityLabel="Tillbaka till inloggning"
          accessibilityHint="Navigerar till inloggningssidan."
        />
        <Logo size="sm" />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Glömt lösenordet?</Text>
        <Text style={styles.subtitle}>
          Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord.
        </Text>
      </View>

      <FormMessage
        message={statusMessage}
        type="info"
        onDismiss={() => setStatusMessage(null)}
      />

      <View style={styles.form}>
        <FormField
          label="E-postadress"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="exempel@epost.se"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={handleSendResetLink}
          error={error}
          accessibilityLabel="E-postadress återställningsfält"
        />

        <View style={styles.spacer} />

        <Button title="Skicka återställningslänk" onPress={handleSendResetLink} />
      </View>

      <View style={styles.footerRow}>
        <Pressable
          onPress={() => router.push('/login')}
          accessibilityRole="link"
          accessibilityLabel="Navigera tillbaka till inloggning"
        >
          <Text style={styles.linkText}>Tillbaka till inloggning</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  titleSection: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  spacer: {
    height: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl, // bottom padding for comfortable scroll with keyboard open
  },
  linkText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
