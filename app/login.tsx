import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import Logo from '../src/components/Logo';
import FormField from '../src/components/FormField';
import Button from '../src/components/Button';
import ScreenLayout from '../src/components/ScreenLayout';
import FormMessage from '../src/components/FormMessage';
import BackButton from '../src/components/BackButton';

export default function LoginScreen() {
  const router = useRouter();

  // Refs for sequential input focusing
  const passwordRef = useRef<TextInput>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error & Status State
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Email format regex validation
  const validateEmailFormat = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Remove error dynamically when corrected
    if (errors.email) {
      if (text.trim() && validateEmailFormat(text)) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Remove error dynamically when corrected
    if (errors.password) {
      if (text.trim()) {
        setErrors((prev) => ({ ...prev, password: undefined }));
      }
    }
  };

  const handleLogin = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'E-postadress krävs.';
    } else if (!validateEmailFormat(email)) {
      newErrors.email = 'E-postadressen måste ha ett giltigt format.';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Lösenord krävs.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatusMessage(null);
      return;
    }

    // Clear errors and navigate to student dashboard
    setErrors({});
    setStatusMessage(null);
    router.push('/home');
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <BackButton
          onPress={() => router.push('/')}
          accessibilityLabel="Gå tillbaka till välkomstskärmen"
          accessibilityHint="Navigerar tillbaka till välkomstsidan."
        />
        <Logo size="sm" />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Välkommen tillbaka</Text>
        <Text style={styles.subtitle}>Logga in och fortsätt där du slutade.</Text>
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
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
          error={errors.email}
          accessibilityLabel="E-postadress-fält"
          accessibilityHint="Ange din registrerade e-postadress"
        />

        <FormField
          ref={passwordRef}
          label="Lösenord"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Ange ditt lösenord"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          error={errors.password}
          accessibilityLabel="Lösenords-fält"
          accessibilityHint="Ange ditt hemliga lösenord"
        />

        <View style={styles.forgotPasswordRow}>
          <Pressable
            onPress={() => router.push('/forgot-password')}
            accessibilityRole="link"
            accessibilityLabel="Återställ lösenord"
          >
            <Text style={styles.forgotPasswordText}>Glömt lösenordet?</Text>
          </Pressable>
        </View>

        <Button title="Logga in" onPress={handleLogin} />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Har du inget konto?</Text>
        <Pressable
          onPress={() => router.push('/register')}
          accessibilityRole="link"
          accessibilityLabel="Skapa konto-sida"
        >
          <Text style={styles.linkText}>Skapa konto</Text>
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
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  footerText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  linkText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
