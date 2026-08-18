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
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleUpdatePassword = async () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.password = 'Lösenord krävs.';
    } else if (newPassword.length < 8) {
      newErrors.password = 'Lösenordet ska innehålla minst 8 tecken.';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Lösenorden matchar inte.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          setStatusMessage(error.message || 'Kunde inte uppdatera lösenordet.');
          setIsSubmitting(false);
          return;
        }
      }

      setIsSuccess(true);
      setStatusMessage('Ditt lösenord har uppdaterats framgångsrikt!');
    } catch (e: any) {
      setStatusMessage(e?.message || 'Ett oväntat fel uppstod.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <BackButton
          onPress={() => router.push('/login')}
          accessibilityLabel="Tillbaka till inloggning"
        />
        <Logo size="sm" />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Välj nytt lösenord</Text>
        <Text style={styles.subtitle}>
          Ange ditt nya lösenord nedan för att återfå åtkomst till ditt konto.
        </Text>
      </View>

      <FormMessage
        message={statusMessage}
        type={isSuccess ? 'info' : 'error'}
        onDismiss={() => setStatusMessage(null)}
      />

      {!isSuccess ? (
        <View style={styles.form}>
          <FormField
            label="Nytt lösenord"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Minst 8 tecken"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <FormField
            label="Bekräfta nytt lösenord"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            placeholder="Upprepa lösenordet"
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          <View style={styles.spacer} />

          <Button
            title={isSubmitting ? 'Uppdaterar...' : 'Spara nytt lösenord'}
            onPress={handleUpdatePassword}
            disabled={isSubmitting}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <Button
            title="Logga in med nytt lösenord"
            onPress={() => router.replace('/login')}
          />
        </View>
      )}

      <View style={styles.footerRow}>
        <Pressable onPress={() => router.push('/login')}>
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
    paddingBottom: theme.spacing.xxl,
  },
  linkText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
