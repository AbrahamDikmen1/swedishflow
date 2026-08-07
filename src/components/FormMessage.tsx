import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme/theme';

interface FormMessageProps {
  message: string | null;
  type?: 'success' | 'info' | 'error';
  onDismiss?: () => void;
}

export default function FormMessage({ message, type = 'success', onDismiss }: FormMessageProps) {
  if (!message) return null;

  const stylesByType = {
    success: {
      container: styles.successContainer,
      text: styles.successText,
    },
    info: {
      container: styles.infoContainer,
      text: styles.infoText,
    },
    error: {
      container: styles.errorContainer,
      text: styles.errorText,
    },
  }[type];

  return (
    <View style={[styles.container, stylesByType.container]} accessibilityLiveRegion="assertive">
      <View style={styles.textWrapper}>
        <Text style={[styles.text, stylesByType.text]}>{message}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.closeButton} accessibilityLabel="Stäng meddelande">
          <Text style={[styles.closeText, stylesByType.text]}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    width: '100%',
  },
  textWrapper: {
    flex: 1,
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: '#E6F4EA',
    borderColor: '#34A853',
  },
  successText: {
    color: '#137333',
  },
  infoContainer: {
    backgroundColor: '#E8F0FE',
    borderColor: '#1967D2',
  },
  infoText: {
    color: '#1A73E8',
  },
  errorContainer: {
    backgroundColor: '#FCE8E6',
    borderColor: '#C5221F',
  },
  errorText: {
    color: '#C5221F',
  },
  closeButton: {
    paddingLeft: theme.spacing.sm,
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
