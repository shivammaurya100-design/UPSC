import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { mockPracticeStats } from '../../data/practiceData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STATS = mockPracticeStats;

const QuickStatsRow: React.FC = () => (
  <View style={styles.statsRow}>
    {[
      { value: `${STATS.accuracy}%`, label: 'Accuracy', color: colors.success },
      { value: `${STATS.streakDays}🔥`, label: 'Day Streak', color: colors.warning },
      { value: `${STATS.totalAttempted}`, label: 'Attempted', color: colors.info },
      { value: `+${STATS.improvementPercent}%`, label: 'vs last week', color: colors.primary },
    ].map((item, i) => (
      <View key={i} style={styles.statItem}>
        <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
        <Text style={styles.statLabel}>{item.label}</Text>
      </View>
    ))}
  </View>
);

export const PracticeHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const categories = [
    { key: 'all', label: 'All', icon: '📚' },
    { key: 'history', label: 'History', icon: '🏛️' },
    { key: 'polity', label: 'Polity', icon: '⚖️' },
    { key: 'economy', label: 'Economy', icon: '📊' },
    { key: 'csat', label: 'CSAT', icon: '📐' },
    { key: 'ethics', label: 'Ethics', icon: '🧠' },
  ];

  const practiceModules = [
    {
      id: 'mcq-daily',
      icon: '🎯',
      title: 'Daily MCQ Challenge',
      subtitle: '10 questions · 15 min · Build your streak',
      badge: 'Daily',
      badgeVariant: 'warning' as const,
      onPress: () => navigation.navigate('MCQPractice', { topicId: 'daily' }),
    },
    {
      id: 'mcq-gs1',
      icon: '📖',
      title: 'GS Paper I Practice',
      subtitle: '100+ MCQs — History & Geography',
      badge: 'GS I',
      badgeVariant: 'primary' as const,
      onPress: () => navigation.navigate('MCQPractice', { topicId: 'gs1' }),
    },
    {
      id: 'mcq-gs2',
      icon: '⚖️',
      title: 'GS Paper II Practice',
      subtitle: '80+ MCQs — Polity & Governance',
      badge: 'GS II',
      badgeVariant: 'info' as const,
      onPress: () => navigation.navigate('MCQPractice', { topicId: 'gs2' }),
    },
    {
      id: 'mcq-csat',
      icon: '📐',
      title: 'CSAT Reasoning',
      subtitle: '150+ questions — All CSAT topics',
      badge: 'CSAT',
      badgeVariant: 'warning' as const,
      onPress: () => navigation.navigate('MCQPractice', { topicId: 'csat' }),
    },
    {
      id: 'answer-writing',
      icon: '✍️',
      title: 'Answer Writing Practice',
      subtitle: 'GS I–IV + Essay · AI Evaluation ready',
      badge: 'Pro',
      badgeVariant: 'success' as const,
      onPress: () => navigation.navigate('AnswerWriting', { topicId: 'gs4-ethics-basics' }),
    },
    {
      id: 'flashcards',
      icon: '🃏',
      title: 'Flashcard Decks',
      subtitle: 'Spaced repetition · SM-2 algorithm',
      badge: 'SR',
      badgeVariant: 'primary' as const,
      onPress: () => navigation.navigate('FlashcardDeck'),
    },
    {
      id: 'weakness',
      icon: '🎯',
      title: 'Weak Areas Focus',
      subtitle: `${STATS.weakTopics.length} weak topics detected`,
      badge: 'AI',
      badgeVariant: 'error' as const,
      onPress: () => navigation.navigate('WeaknessFocus'),
    },
    {
      id: 'stats',
      icon: '📊',
      title: 'Performance Analytics',
      subtitle: 'Detailed accuracy breakdown by paper',
      badge: 'Stats',
      badgeVariant: 'info' as const,
      onPress: () => navigation.navigate('PracticeStatsDetail'),
    },
  ];

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Practice Hub ✍️</Text>
          <Text style={styles.title}>Ready to test yourself?</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>{STATS.streakDays} day streak</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Performance</Text>
        <QuickStatsRow />
        <View style={styles.statsBottom}>
          <View style={styles.weaknessRow}>
            <Text style={styles.weaknessLabel}>🔴 Weak areas:</Text>
            {STATS.weakTopics.slice(0, 2).map((w) => (
              <Badge key={w} label={w} variant="error" size="sm" />
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Quick filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterChip, selectedCategory === cat.key && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={styles.filterChipIcon}>{cat.icon}</Text>
                <Text
                  style={[styles.filterChipText, selectedCategory === cat.key && styles.filterChipTextActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Practice modules */}
        <Text style={styles.sectionTitle}>Practice Modules</Text>
        {practiceModules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={styles.moduleCard}
            onPress={module.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.moduleIconWrapper}>
              <Text style={styles.moduleIcon}>{module.icon}</Text>
            </View>
            <View style={styles.moduleContent}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Badge label={module.badge} variant={module.badgeVariant} size="sm" />
              </View>
              <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
            </View>
            <Text style={styles.moduleArrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Quick MCQ CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>🎯 Quick 5-Question Check</Text>
          <Text style={styles.ctaSubtitle}>
            Not enough time? Take a quick 5-question micro-test
          </Text>
          <Button
            title="Start Quick Test"
            onPress={() => navigation.navigate('MCQPractice', { topicId: 'quick' })}
            variant="primary"
            size="sm"
            style={{ marginTop: spacing.md }}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  streakBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  streakText: {
    fontSize: typography.caption,
    color: colors.warning,
    fontWeight: typography.semibold,
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  statsTitle: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  statsBottom: { marginTop: spacing.md },
  weaknessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  weaknessLabel: {
    fontSize: typography.caption,
    color: colors.error,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  filterScroll: { marginBottom: spacing.xl },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipIcon: { fontSize: 14 },
  filterChipText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  filterChipTextActive: { color: '#fff' },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  moduleCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  moduleIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  moduleIcon: { fontSize: 22 },
  moduleContent: { flex: 1 },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  moduleTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  moduleSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  moduleArrow: {
    fontSize: 18,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  ctaCard: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    marginBottom: spacing.lg,
  },
  ctaTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ctaSubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  bottomPadding: { height: 100 },
});