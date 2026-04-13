import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { BadgeVariant } from '../../types';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: 'rgba(99,102,241,0.15)', text: colors.primaryLight },
  success: { bg: 'rgba(16,185,129,0.15)', text: colors.success },
  warning: { bg: 'rgba(245,158,11,0.15)', text: colors.warning },
  error: { bg: 'rgba(239,68,68,0.15)', text: colors.error },
  info: { bg: 'rgba(59,130,246,0.15)', text: colors.info },
  neutral: { bg: 'rgba(100,116,139,0.15)', text: colors.textSecondary },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { bg, text } = variantColors[variant];

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }, size === 'sm' && styles.smText]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  text: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  smText: {
    fontSize: typography.overline,
  },
});
