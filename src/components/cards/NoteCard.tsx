import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { Badge } from '../ui/Badge';

interface NoteCardProps {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  isBookmarked?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  title,
  preview,
  tags,
  isBookmarked = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isBookmarked && <Text style={styles.bookmark}>🔖</Text>}
        </View>
        <Text style={styles.preview} numberOfLines={3}>
          {preview}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.tags}>
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} label={tag} variant="neutral" size="sm" />
          ))}
          {tags.length > 3 && (
            <Text style={styles.moreTag}>+{tags.length - 3}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.readBtn} onPress={onPress}>
          <Text style={styles.readBtnText}>Read →</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  bookmark: {
    fontSize: 14,
  },
  preview: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  moreTag: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    alignSelf: 'center',
  },
  readBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  readBtnText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
});
