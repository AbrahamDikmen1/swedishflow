import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import Logo from '../../src/components/Logo';
import FormField from '../../src/components/FormField';
import Button from '../../src/components/Button';
import ScreenLayout from '../../src/components/ScreenLayout';
import FormMessage from '../../src/components/FormMessage';
import BackButton from '../../src/components/BackButton';
import Icon from '../../src/components/Icon';
import { useAuth } from '../../src/context/AuthContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, signIn, loginAsDemo, isDemoMode, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async () => {
    if (!email.trim()) {
      setStatusMessage('Vänligen ange e-postadress.');
      return;
    }
    if (!password.trim()) {
      setStatusMessage('Vänligen ange lösenord.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // If using default demo admin credentials in demo mode
    if (isDemoMode && email === 'admin@swedishflow.se') {
      await loginAsDemo('admin');
      setIsSubmitting(false);
      router.replace('/admin');
      return;
    }

    const res = await signIn(email, password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        router.replace('/admin');
      } else {
        setStatusMessage('Detta konto saknar administratörsbehörighet.');
      }
    } else {
      setStatusMessage(res.error || 'Inloggningen misslyckades. Kontrollera dina uppgifter.');
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
              router.push('/login');
            }
          }}
          accessibilityLabel="Gå tillbaka"
        />
        <Logo size="sm" />
      </View>

      {/* ADMIN PORTAL BADGE */}
      <View style={styles.adminBadge}>
        <Icon name="shield-checkmark-outline" size={16} color="#FFFFFF" />
        <Text style={styles.adminBadgeText}>SwedishFlow Adminportal</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Administratörsinloggning</Text>
        <Text style={styles.subtitle}>
          Inloggningsvy för lärare och kursadministratörer.
        </Text>
      </View>

      {/* ALREADY LOGGED IN AS STUDENT NOTICE */}
      {!isLoading && isAuthenticated && !isAdmin && (
        <View style={styles.nonAdminWarningCard}>
          <Icon name="alert-circle" size={20} color="#B45309" />
          <View style={styles.demoWarningTextWrapper}>
            <Text style={styles.nonAdminWarningTitle}>Inloggad som elevkonto</Text>
            <Text style={styles.demoWarningText}>
              Du är inloggad som {user?.email || 'elev'}, vilket saknar administratörsbehörighet. Logga in med ett administratörskonto nedan eller återgå till elevvyn.
            </Text>
            <Pressable
              style={styles.goToStudentViewBtn}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Text style={styles.goToStudentViewBtnText}>Gå till elevvyn →</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* DEMO NOTICE IF IN DEMO MODE */}
      {isDemoMode && (
        <View style={styles.demoWarningCard}>
          <Icon name="information-circle-outline" size={20} color="#1E4E8C" />
          <View style={styles.demoWarningTextWrapper}>
            <Text style={styles.demoWarningTitle}>Demoläge aktivt</Text>
            <Text style={styles.demoWarningText}>
              Använd <Text style={{ fontWeight: '700' }}>admin@swedishflow.se</Text> med lösenord <Text style={{ fontWeight: '700' }}>demo1234</Text> för att testa adminpanelen.
            </Text>
          </View>
        </View>
      )}

      <FormMessage
        message={statusMessage}
        type="error"
        onDismiss={() => setStatusMessage(null)}
      />

      <View style={styles.form}>
        <FormField
          label="Admin e-postadress"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@swedishflow.se"
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="E-post för admin"
        />

        <FormField
          label="Lösenord"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          accessibilityLabel="Lösenord för admin"
        />

        <View style={styles.submitWrapper}>
          <Button
            title={isSubmitting || isLoading ? 'Loggar in...' : 'Logga in som administratör'}
            onPress={handleAdminLogin}
            disabled={isSubmitting || isLoading}
            accessibilityLabel="Logga in i adminpanelen"
          />
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Är du elev?</Text>
        <Pressable
          onPress={() => router.push('/login')}
          accessibilityRole="link"
          accessibilityLabel="Gå till elevinloggning"
        >
          <Text style={styles.linkText}>Gå till elevinloggning</Text>
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
    marginBottom: theme.spacing.md,
  },
  adminBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: theme.spacing.md,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  titleSection: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  demoWarningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EBF3FA',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  demoWarningTextWrapper: {
    flex: 1,
  },
  demoWarningTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: '#1E4E8C',
    marginBottom: 2,
  },
  demoWarningText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  nonAdminWarningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  nonAdminWarningTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  goToStudentViewBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  goToStudentViewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E4E8C',
    textDecorationLine: 'underline',
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  submitWrapper: {
    marginTop: theme.spacing.sm,
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
