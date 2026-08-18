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
import { useAuth } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading: isAuthLoading } = useAuth();

  // Refs for sequential input focusing
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error & Banner States
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const validateEmailFormat = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  // Real-time input corrections
  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    if (errors.firstName && text.trim().length >= 2) {
      setErrors((prev) => ({ ...prev, firstName: undefined }));
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email && validateEmailFormat(text)) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password && text.length >= 8) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (errors.confirmPassword && text === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword && text === password) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleToggleTerms = () => {
    const newValue = !agreeTerms;
    setAgreeTerms(newValue);
    if (errors.agreeTerms && newValue) {
      setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
    }
  };

  const handleShowTermsNotice = () => {
    setAlertMessage('Användarvillkor och integritetspolicy gäller för SwedishFlows språktjänster.');
    setStatusMessage(null);
  };

  const handleRegister = async () => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Förnamn krävs.';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'Förnamn ska innehålla minst två tecken.';
    }

    if (!email.trim()) {
      newErrors.email = 'E-postadress krävs.';
    } else if (!validateEmailFormat(email)) {
      newErrors.email = 'E-postadressen måste ha ett giltigt format.';
    }

    if (!password) {
      newErrors.password = 'Lösenord krävs.';
    } else if (password.length < 8) {
      newErrors.password = 'Lösenordet ska innehålla minst åtta tecken.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Bekräftat lösenord krävs.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Lösenorden måste matcha.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Du måste godkänna villkoren för att fortsätta.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatusMessage(null);
      setAlertMessage(null);
      return;
    }

    setErrors({});
    setAlertMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    const result = await signUp(email, password, firstName);
    setIsSubmitting(false);

    if (result.success) {
      router.replace('/(tabs)/home');
    } else {
      setStatusMessage(result.error || 'Kunde inte skapa kontot.');
    }
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
          accessibilityLabel="Gå tillbaka"
          accessibilityHint="Navigerar tillbaka till välkomstsidan."
        />
        <Logo size="sm" />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Skapa ditt konto</Text>
        <Text style={styles.subtitle}>Börja lära dig svenska i din egen takt.</Text>
      </View>

      <FormMessage
        message={statusMessage}
        type="error"
        onDismiss={() => setStatusMessage(null)}
      />

      <FormMessage
        message={alertMessage}
        type="info"
        onDismiss={() => setAlertMessage(null)}
      />

      <View style={styles.form}>
        <FormField
          label="Förnamn"
          value={firstName}
          onChangeText={handleFirstNameChange}
          placeholder="Ditt förnamn"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="givenName"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
          error={errors.firstName}
          accessibilityLabel="Förnamn fält"
        />

        <FormField
          ref={emailRef}
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
          accessibilityLabel="E-postadress fält"
        />

        <FormField
          ref={passwordRef}
          label="Lösenord"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Minst 8 tecken"
          secureTextEntry
          autoComplete="password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          blurOnSubmit={false}
          error={errors.password}
          accessibilityLabel="Lösenord fält"
        />

        <FormField
          ref={confirmPasswordRef}
          label="Bekräfta lösenord"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          placeholder="Upprepa ditt lösenord"
          secureTextEntry
          autoComplete="password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          error={errors.confirmPassword}
          accessibilityLabel="Bekräfta lösenord fält"
        />

        {/* Custom accessibility-friendly checkbox */}
        <View style={styles.checkboxContainer}>
          <Pressable
            onPress={handleToggleTerms}
            style={styles.checkboxTouch}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreeTerms }}
            accessibilityLabel="Jag godkänner användarvillkor och integritetspolicy"
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked, !!errors.agreeTerms && styles.checkboxError]}>
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </Pressable>

          <View style={styles.labelContainer}>
            <Text style={styles.checkboxLabel} onPress={handleToggleTerms}>
              Jag godkänner{' '}
            </Text>
            <Text style={styles.linkLabel} onPress={handleShowTermsNotice}>
              användarvillkor
            </Text>
            <Text style={styles.checkboxLabel} onPress={handleToggleTerms}>
              {' '}och{' '}
            </Text>
            <Text style={styles.linkLabel} onPress={handleShowTermsNotice}>
              integritetspolicy
            </Text>
            <Text style={styles.checkboxLabel} onPress={handleToggleTerms}>
              .
            </Text>
          </View>
        </View>

        {errors.agreeTerms && (
          <Text style={styles.termsError} accessibilityRole="alert">
            {errors.agreeTerms}
          </Text>
        )}

        <View style={styles.spacer} />

        <Button
          title={isSubmitting || isAuthLoading ? 'Skapar konto...' : 'Skapa konto'}
          onPress={handleRegister}
          disabled={isSubmitting || isAuthLoading}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Har du redan ett konto?</Text>
        <Pressable
          onPress={() => router.push('/login')}
          accessibilityRole="link"
          accessibilityLabel="Navigera till inloggningssida"
        >
          <Text style={styles.linkText}>Logga in</Text>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  checkboxTouch: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxError: {
    borderColor: theme.colors.error,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  linkLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  termsError: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
  spacer: {
    height: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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
