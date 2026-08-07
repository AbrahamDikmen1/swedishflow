import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { theme } from '../theme/theme';

interface FormErrorProps {
  message?: string;
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    fontWeight: '500',
  },
});
