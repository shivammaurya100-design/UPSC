import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme';
import { ButtonVariant } from '../../types';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  size = 'md',
}) => {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Container` as keyof typeof styles] as ViewStyle,
    styles[`${size}Size` as keyof typeof styles] as ViewStyle,
    fullWidth ? styles.fullWidth : undefined,
    isDisabled ? styles.disabled : undefined,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    isDisabled ? styles.disabledText : undefined,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.textInverse : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.button,
  },
  // Sizes
  smSize: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 36 },
  mdSize: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 44 },
  lgSize: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, minHeight: 52 },
  // Variants
  primaryContainer: { backgroundColor: colors.primary },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  // Disabled
  disabled: { opacity: 0.5 },
  disabledText: { opacity: 0.7 },
  // Full width
  fullWidth: { width: '100%' },
  // Text base
  text: {
    fontWeight: typography.semibold,
    textAlign: 'center',
  },
  // Text sizes
  smText: { fontSize: typography.bodySmall, fontWeight: typography.medium },
  mdText: { fontSize: typography.body },
  lgText: { fontSize: typography.h3 },
  // Text variants
  primaryText: { color: '#FFFFFF' },
  secondaryText: { color: colors.primary },
  ghostText: { color: colors.primary },
});
