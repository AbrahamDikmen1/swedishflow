import React from 'react';
import { Pressable, StyleSheet, Platform, TextStyle, View } from 'react-native';
import { theme } from '../theme/theme';

interface BackButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function BackButton({ onPress, accessibilityLabel = 'Gå tillbaka', accessibilityHint }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : undefined,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.arrowContainer}>
        {/* Arrow stem */}
        <View style={styles.arrowStem} />
        {/* Arrow head */}
        <View style={styles.arrowHead} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  buttonPressed: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.textMuted,
    transform: [{ scale: 0.95 }],
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  arrowStem: {
    width: 14,
    height: 2,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    left: 4,
  },
  arrowHead: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: theme.colors.primary,
    position: 'absolute',
    left: 4,
    transform: [{ rotate: '-45deg' }],
  },
});

