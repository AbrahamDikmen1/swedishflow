import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function AdminPreviewBanner() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 480;

  if (!isAdmin) {
    return null;
  }

  const handleReturnToAdmin = () => {
    router.push('/admin');
  };

  return (
    <View
      style={[
        styles.bannerContainer,
        { paddingTop: Math.max(insets.top, 8) + 4 },
      ]}
    >
      <View style={[styles.innerContent, isCompact && styles.compactInnerContent]}>
        <View style={styles.leftSection}>
          <View style={styles.iconCircle}>
            <Icon name="shield-checkmark-outline" size={14} color="#1E4E8C" />
          </View>
          <Text style={styles.bannerText}>
            {isCompact
              ? 'Elevvy (Adminläge)'
              : 'Du förhandsgranskar elevvyn som administratör'}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.returnButton,
            pressed && styles.returnButtonPressed,
          ]}
          onPress={handleReturnToAdmin}
          accessibilityRole="button"
          accessibilityLabel="Tillbaka till adminpanelen"
        >
          <Icon name="arrow-back" size={14} color="#FFFFFF" />
          <Text style={styles.returnButtonText}>Tillbaka till admin</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 8,
    zIndex: 100,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
      } as any,
    }),
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  },
  compactInnerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E3A8A',
    flexShrink: 1,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E4E8C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  returnButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  returnButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
