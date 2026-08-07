import React, { useState, forwardRef, useRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
} from 'react-native';
import { theme } from '../theme/theme';
import FormError from './FormError';

const EyeIcon = ({ visible }: { visible: boolean }) => {
  return (
    <View style={eyeStyles.container}>
      <View style={eyeStyles.eyeOuter}>
        <View style={eyeStyles.eyePupil} />
      </View>
      {!visible && <View style={eyeStyles.slash} />}
    </View>
  );
};

export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: any;
  textContentType?: any;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  error?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  error,
  accessibilityLabel,
  accessibilityHint,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const localInputRef = useRef<TextInput>(null);

  // Expose localInputRef through the forwarded ref
  useImperativeHandle(ref, () => localInputRef.current!);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
    // Programmatically refocus after toggling to ensure the keyboard doesn't hide
    // and the cursor stays in the password field.
    setTimeout(() => {
      localInputRef.current?.focus();
    }, 60);
  };

  const hasError = !!error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        <TextInput
          ref={localInputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          style={[
            styles.input,
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : undefined,
          ]}
        />
        {secureTextEntry && (
          <Pressable
            onPress={togglePasswordVisibility}
            style={styles.toggleButton}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Dölj lösenord' : 'Visa lösenord'}
            accessibilityHint="Växlar om lösenordet visas."
          >
            <EyeIcon visible={isPasswordVisible} />
          </Pressable>
        )}
      </View>
      <FormError message={error} />
    </View>
  );
});

export default FormField;

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.base,
    padding: 0,
    marginRight: theme.spacing.sm, // Prevent text from overlapping with "Visa/Dölj" button
  },
  toggleButton: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const eyeStyles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eyeOuter: {
    width: 20,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  slash: {
    width: 22,
    height: 2,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
});
