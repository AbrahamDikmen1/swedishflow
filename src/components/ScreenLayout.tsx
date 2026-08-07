import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Keyboard,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollEnabled?: boolean;
}

export default function ScreenLayout({ children, scrollEnabled = true }: ScreenLayoutProps) {
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const containerStyle = [
    styles.contentContainer,
    isTabletOrWeb && styles.tabletContainer,
  ];

  const content = scrollEnabled ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        isTabletOrWeb && styles.tabletScrollContent,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={containerStyle}>
        {children}
      </View>
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flexContent,
        isTabletOrWeb && styles.tabletFlexContent,
        containerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  tabletScrollContent: {
    paddingVertical: theme.spacing.xxl,
  },
  flexContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  tabletFlexContent: {
    paddingVertical: theme.spacing.xxl,
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  tabletContainer: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
});
