import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { DifficultyLevel, SyllabusCategory } from '../../types';

// Category icons mapping
const CATEGORY_ICONS: Record<SyllabusCategory, string> = {
  history: '🏛️',
  geography: '🌍',
  polity: '⚖️',
  economy: '📊',
  environment: '🌿',
  science: '🔬',
  currentAffairs: '📰',
  ethics: '🧠',
  csat: '📐',
  optional: '📚',
};

const DIFFICULTY_BADGE: Record<DifficultyLevel, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  easy: { label: 'Easy', variant: 'success' },
  medium: { label: 'Medium', variant: 'warning' },
  hard: { label: 'Hard', variant: 'error' },
};

interface TopicCardProps {
  id: string;
  title: string;
  category: SyllabusCategory;
  subtopicCount: number;
  progress: number;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  onPress: () => void;
  style?: ViewStyle;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  title,
  category,
  subtopicCount,
  progress,
  difficulty,
  estimatedMinutes,
  onPress,
  style,
}) => {
  const icon = CATEGORY_ICONS[category] ?? '📖';
  const diff = DIFFICULTY_BADGE[difficulty];

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.meta}>
          <Badge label={diff.label} variant={diff.variant} size="sm" />
          <Text style={styles.duration}>{estimatedMinutes} min</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      {/* Subtopic count */}
      <Text style={styles.subtopicCount}>
        {subtopicCount} {subtopicCount === 1 ? 'topic' : 'topics'}
      </Text>

      {/* Progress */}
      <View style={styles.footer}>
        <ProgressBar progress={progress} showLabel />
        <Text style={styles.progressLabel}>
          {progress === 0
            ? 'Not started'
            : progress === 100
            ? 'Complete!'
            : 'In progress'}
        </Text>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  duration: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: typography.h3 * typography.tight,
  },
  subtopicCount: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
});
