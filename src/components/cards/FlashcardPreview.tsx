import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { Flashcard } from '../../types';

interface FlashcardPreviewProps {
  flashcard: Flashcard;
  onPress: () => void;
  style?: ViewStyle;
}

export const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({
  flashcard,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.labelRow}>
        <Text style={styles.flashcardLabel}>Flashcard</Text>
        <Text style={styles.count}>
          📚 {flashcard.repetitions} rev
        </Text>
      </View>
      <Text style={styles.front} numberOfLines={2}>
        {flashcard.front}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.back} numberOfLines={2}>
        {flashcard.back}
      </Text>
      <TouchableOpacity style={styles.practiceBtn} onPress={onPress}>
        <Text style={styles.practiceBtnText}>Practice →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  flashcardLabel: {
    fontSize: typography.overline,
    color: colors.primary,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  count: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  front: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: typography.body * typography.normal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  back: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.bodySmall * typography.normal,
  },
  practiceBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: borderRadius.md,
  },
  practiceBtnText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
});
