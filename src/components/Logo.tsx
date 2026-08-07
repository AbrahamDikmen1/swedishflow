import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme/theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'column' | 'row';
  accessibilityLabel?: string;
}

export default function Logo({
  size = 'md',
  layout = 'column',
  accessibilityLabel = 'SwedishFlow Logotyp',
}: LogoProps) {
  const symbolSize = {
    sm: 36,
    md: 52,
    lg: 64,
  }[size];

  const fontSize = {
    sm: 18,
    md: 22,
    lg: 26,
  }[size];

  return (
    <View
      style={[styles.container, layout === 'row' && styles.rowLayout]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={symbolSize} height={symbolSize} viewBox="0 0 64 64" fill="none">
        {/* Primary Nordic Flow Wave - Deep Blue (#1E4E8C) */}
        <Path
          d="M 12 48 C 12 33, 24 22, 33 22 C 42 22, 48 16, 48 12"
          stroke="#1E4E8C"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Secondary Nordic Flow Wave - Soft Nordic Blue (#3A70B2) */}
        <Path
          d="M 20 52 C 20 41, 28 32, 36 32 C 44 32, 52 26, 52 20"
          stroke="#3A70B2"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      <Text
        style={[
          styles.brandText,
          { fontSize },
          layout === 'row' && styles.brandTextRow,
        ]}
      >
        SwedishFlow
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLayout: {
    flexDirection: 'row',
    gap: 10,
  },
  brandText: {
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    letterSpacing: -0.4,
  },
  brandTextRow: {
    marginTop: 0,
  },
});


