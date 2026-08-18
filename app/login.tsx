import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import Logo from '../src/components/Logo';
import FormField from '../src/components/FormField';
import Button from '../src/components/Button';
import ScreenLayout from '../src/components/ScreenLayout';
import FormMessage from '../src/components/FormMessage';
import BackButton from '../src/components/BackButton';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loginAsDemo, isLoading: isAuthLoading } = useAuth();

  // Refs for sequential input focusing
  const passwordRef = useRef<TextInput>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error & Status State
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Email format regex validation
  const validateEmailFormat = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) {
      if (text.trim() && validateEmailFormat(text)) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) {
      if (text.trim()) {
        setErrors((prev) => ({ ...prev, password: undefined }));
      }
    }
  };

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'E-postadress krävs.';
    } else if (!validateEmailFormat(email)) {
      newErrors.email = 'E-postadressen måste ha ett giltigt format.';
    }

    if (!password.trim()) {
      newErrors.password = 'Lösenord krävs.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatusMessage(null);
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setIsSubmitting(true);

    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)/home');
      }
    } else {
      setStatusMessage(result.error || 'Inloggningen misslyckades. Kontrollera dina uppgifter.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    await loginAsDemo('student');
    setIsSubmitting(false);
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <BackButton
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          accessibilityLabel="Gå tillbaka till välkomstskärmen"
          accessibilityHint="Navigerar tillbaka till välkomstsidan."
        />
        <Logo size="sm" />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Välkommen tillbaka</Text>
        <Text style={styles.subtitle}>Logga in och fortsätt din språkinlärning.</Text>
      </View>

      <FormMessage
        message={statusMessage}
        type="error"
        onDismiss={() => setStatusMessage(null)}
      />

      <View style={styles.form}>
        <FormField
          label="E-postadress"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="elev@exempel.se"
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

        <Button
          title={isSubmitting || isAuthLoading ? 'Loggar in...' : 'Logga in'}
          onPress={handleLogin}
          disabled={isSubmitting || isAuthLoading}
        />

        <View style={styles.demoLoginWrapper}>
          <Pressable
            style={({ pressed }) => [styles.demoButton, pressed && { opacity: 0.8 }]}
            onPress={handleQuickDemoLogin}
            accessibilityRole="button"
            accessibilityLabel="Snabb inloggning som elev i demoläge"
          >
            <Text style={styles.demoButtonText}>⚡ Snabbstarta som elev (Demoläge)</Text>
          </Pressable>
        </View>
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

      <View style={styles.adminLinkRow}>
        <Pressable
          onPress={() => router.push('/admin/login')}
          accessibilityRole="link"
          accessibilityLabel="Gå till administratörsinloggning"
        >
          <Text style={styles.adminLinkText}>Är du lärare eller admin? Logga in här</Text>
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
  demoLoginWrapper: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  demoButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  demoButtonText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: '#334155',
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
  adminLinkRow: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  adminLinkText: {
    fontSize: theme.typography.sizes.sm,
    color: '#1E4E8C',
    fontWeight: '600',
  },
});
