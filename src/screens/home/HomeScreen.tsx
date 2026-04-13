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
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { mockPracticeStats } from '../../data/practiceData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TOPICS_TO_REVIEW = [
  { topic: 'World History — Cold War', accuracy: 38, due: '3 days ago', topicId: 'gs1-heritage' },
  { topic: 'Ethics — Case Studies', accuracy: 42, due: '5 days ago', topicId: 'gs4-ethics-basics' },
  { topic: 'Economy — Banking', accuracy: 45, due: '2 days ago', topicId: 'gs3-economy' },
];

const RECENT_NEWS = [
  { id: 'n1', title: 'India–EU Free Trade Agreement concluded after 7 years', tag: 'Economy', time: '2h ago' },
  { id: 'n2', title: 'SC strikes down Electoral Bonds Scheme as unconstitutional', tag: 'Polity', time: '4h ago' },
  { id: 'n3', title: 'ISRO announces Gaganyaan uncrewed test for Q3 2026', tag: 'S&T', time: '8h ago' },
];

const WEEKLY_PROGRESS = [
  { day: 'Mon', minutes: 45, goal: 60 },
  { day: 'Tue', minutes: 62, goal: 60 },
  { day: 'Wed', minutes: 30, goal: 60 },
  { day: 'Thu', minutes: 55, goal: 60 },
  { day: 'Fri', minutes: 70, goal: 60 },
  { day: 'Sat', minutes: 40, goal: 60 },
  { day: 'Sun', minutes: 15, goal: 60 },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const todayTotal = WEEKLY_PROGRESS.reduce((s, d) => s + d.minutes, 0);
  const weeklyGoal = WEEKLY_PROGRESS.reduce((s, d) => s + d.goal, 0);
  const streakDays = mockPracticeStats.streakDays;

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Rahul 👋</Text>
          <View style={styles.headerRow}>
            <Text style={styles.title}>UPSC Pathfinder</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streakDays} day streak</Text>
            </View>
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
        {/* Daily Goal Card */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={styles.goalTitle}>📅 Daily Goal</Text>
              <Text style={styles.goalSubtitle}>60 minutes of focused study</Text>
            </View>
            <Badge
              label={todayTotal >= 60 ? '✓ Done!' : `${todayTotal}/60 min`}
              variant={todayTotal >= 60 ? 'success' : 'warning'}
              size="sm"
            />
          </View>
          <ProgressBar
            progress={Math.min(100, (todayTotal / 60) * 100)}
            height={8}
            color={todayTotal >= 60 ? colors.success : colors.warning}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickAction, { borderColor: `${colors.primary}30` }]}
            onPress={() => navigation.navigate('MCQPractice', { topicId: 'daily' })}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={styles.quickIcon}>🎯</Text>
            </View>
            <Text style={styles.quickTitle}>Daily MCQ</Text>
            <Text style={styles.quickSubtitle}>10 questions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { borderColor: `${colors.success}30` }]}
            onPress={() => navigation.navigate('FlashcardDeck')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: `${colors.success}15` }]}>
              <Text style={styles.quickIcon}>🃏</Text>
            </View>
            <Text style={styles.quickTitle}>Flashcards</Text>
            <Text style={styles.quickSubtitle}>15 due today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { borderColor: `${colors.warning}30` }]}
            onPress={() => navigation.navigate('AnswerWriting', { topicId: 'gs4-ethics-basics' })}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: `${colors.warning}15` }]}>
              <Text style={styles.quickIcon}>✍️</Text>
            </View>
            <Text style={styles.quickTitle}>Answer Writing</Text>
            <Text style={styles.quickSubtitle}>2 topics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { borderColor: `${colors.info}30` }]}
            onPress={() => navigation.navigate('TestsHome')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: `${colors.info}15` }]}>
              <Text style={styles.quickIcon}>📝</Text>
            </View>
            <Text style={styles.quickTitle}>Take a Test</Text>
            <Text style={styles.quickSubtitle}>Sectional</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Snapshot */}
        <View style={styles.perfCard}>
          <Text style={styles.sectionTitle}>📊 Today's Snapshot</Text>
          <View style={styles.perfRow}>
            {[
              { value: `${mockPracticeStats.accuracy}%`, label: 'Accuracy', color: mockPracticeStats.accuracy >= 65 ? colors.success : colors.warning },
              { value: '47', label: 'MCQs Done', color: colors.primary },
              { value: '+8.4%', label: 'vs Last Week', color: colors.success },
              { value: '12', label: 'Day Streak', color: colors.warning },
            ].map((item) => (
              <View key={item.label} style={styles.perfItem}>
                <Text style={[styles.perfValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.perfLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weak Areas Reminder */}
        <View style={styles.weakAreasCard}>
          <View style={styles.weakHeader}>
            <Text style={styles.sectionTitle}>🎯 Areas Needing Attention</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WeaknessFocus')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {TOPICS_TO_REVIEW.map((item, i) => (
            <TouchableOpacity
              key={item.topic}
              style={[styles.weakRow, i < TOPICS_TO_REVIEW.length - 1 && styles.weakRowBorder]}
              onPress={() => navigation.navigate('MCQPractice', { topicId: item.topicId })}
            >
              <View style={styles.weakLeft}>
                <View style={[styles.weakDot, { backgroundColor: colors.error }]} />
                <View>
                  <Text style={styles.weakTopic}>{item.topic}</Text>
                  <Text style={styles.weakMeta}>{item.accuracy}% accuracy · due {item.due}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.weakActionBtn}
                onPress={() => navigation.navigate('MCQPractice', { topicId: item.topicId })}
              >
                <Text style={styles.weakActionText}>Practice</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Affairs */}
        <View style={styles.caCard}>
          <View style={styles.caHeader}>
            <View>
              <Text style={styles.sectionTitle}>📰 Current Affairs</Text>
              <Text style={styles.caSubtitle}>Top UPSC-relevant news</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('CurrentAffairsHome')}>
              <Text style={styles.seeAll}>View all →</Text>
            </TouchableOpacity>
          </View>
          {RECENT_NEWS.map((news) => (
            <TouchableOpacity
              key={news.id}
              style={[styles.newsRow, news.id !== RECENT_NEWS[RECENT_NEWS.length - 1].id && styles.newsRowBorder]}
              onPress={() => {}}
            >
              <View style={styles.newsDot} />
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle} numberOfLines={2}>{news.title}</Text>
                <View style={styles.newsMeta}>
                  <Badge label={news.tag} variant="neutral" size="sm" />
                  <Text style={styles.newsTime}>{news.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Practice Hub */}
        <View style={styles.practiceHubHeader}>
          <View>
            <Text style={styles.sectionTitle}>✍️ Practice Hub</Text>
            <Text style={styles.practiceHubSubtitle}>MCQs, Answer Writing, Flashcards & More</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('PracticeHome')}>
            <Text style={styles.seeAll}>Full practice →</Text>
          </TouchableOpacity>
        </View>

        {/* Daily MCQ Challenge Card */}
        <TouchableOpacity
          style={styles.dailyMcqCard}
          onPress={() => navigation.navigate('MCQPractice', { topicId: 'daily' })}
          activeOpacity={0.7}
        >
          <View style={styles.dailyMcqLeft}>
            <View style={styles.dailyMcqIconWrap}>
              <Text style={styles.dailyMcqIcon}>🎯</Text>
            </View>
            <View style={styles.dailyMcqInfo}>
              <View style={styles.dailyMcqTitleRow}>
                <Text style={styles.dailyMcqTitle}>Daily MCQ Challenge</Text>
                <Badge label="Daily" variant="warning" size="sm" />
              </View>
              <Text style={styles.dailyMcqSubtitle}>10 questions · 15 min · Build your streak</Text>
              <View style={styles.dailyMcqMeta}>
                <View style={styles.dailyMcqMetaItem}>
                  <Text style={styles.dailyMcqMetaValue}>{mockPracticeStats.accuracy}%</Text>
                  <Text style={styles.dailyMcqMetaLabel}>Accuracy</Text>
                </View>
                <View style={styles.dailyMcqMetaDivider} />
                <View style={styles.dailyMcqMetaItem}>
                  <Text style={styles.dailyMcqMetaValue}>+8.4%</Text>
                  <Text style={styles.dailyMcqMetaLabel}>vs last week</Text>
                </View>
                <View style={styles.dailyMcqMetaDivider} />
                <View style={styles.dailyMcqMetaItem}>
                  <Text style={styles.dailyMcqMetaValue}>{mockPracticeStats.totalAttempted}</Text>
                  <Text style={styles.dailyMcqMetaLabel}>Total attempted</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.dailyMcqArrow}>
            <Text style={styles.dailyMcqArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* GS Paper Practice Cards */}
        <View style={styles.gsPracticeRow}>
          {[
            { paper: 'GS I', icon: '🏛️', topic: 'History & Geography', count: 28, color: colors.primary, topicId: 'gs1' },
            { paper: 'GS II', icon: '⚖️', topic: 'Polity & Governance', count: 22, color: colors.info, topicId: 'gs2' },
            { paper: 'GS III', icon: '📊', topic: 'Economy & Env', count: 35, color: colors.success, topicId: 'gs3-economy' },
            { paper: 'GS IV', icon: '🧠', topic: 'Ethics & Integrity', count: 15, color: '#A78BFA', topicId: 'gs4-ethics-basics' },
          ].map((p) => (
            <TouchableOpacity
              key={p.paper}
              style={styles.gsCard}
              onPress={() => navigation.navigate('MCQPractice', { topicId: p.topicId })}
              activeOpacity={0.7}
            >
              <View style={[styles.gsCardIconWrap, { backgroundColor: `${p.color}20` }]}>
                <Text style={styles.gsCardIcon}>{p.icon}</Text>
              </View>
              <Text style={styles.gsCardPaper}>{p.paper}</Text>
              <Text style={styles.gsCardTopic} numberOfLines={1}>{p.topic}</Text>
              <View style={styles.gsCardFooter}>
                <Text style={[styles.gsCardCount, { color: p.color }]}>{p.count} MCQs</Text>
                <Text style={styles.gsCardArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CSAT + Quick Test */}
        <View style={styles.csatRow}>
          <TouchableOpacity
            style={styles.csatCard}
            onPress={() => navigation.navigate('MCQPractice', { topicId: 'csat' })}
            activeOpacity={0.7}
          >
            <View style={[styles.csatIconWrap, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Text style={styles.csatIcon}>📐</Text>
            </View>
            <View style={styles.csatInfo}>
              <Text style={styles.csatTitle}>CSAT Reasoning</Text>
              <Text style={styles.csatSubtitle}>150+ questions</Text>
            </View>
            <Text style={styles.csatArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTestCard}
            onPress={() => navigation.navigate('MCQPractice', { topicId: 'quick' })}
            activeOpacity={0.7}
          >
            <View style={[styles.csatIconWrap, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
              <Text style={styles.csatIcon}>⚡</Text>
            </View>
            <View style={styles.csatInfo}>
              <Text style={styles.csatTitle}>Quick 5-Test</Text>
              <Text style={styles.csatSubtitle}>5 questions · 2 min</Text>
            </View>
            <Text style={styles.csatArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Answer Writing + Flashcards row */}
        <View style={styles.csatRow}>
          <TouchableOpacity
            style={styles.csatCard}
            onPress={() => navigation.navigate('AnswerWriting', { topicId: 'gs4-ethics-basics' })}
            activeOpacity={0.7}
          >
            <View style={[styles.csatIconWrap, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
              <Text style={styles.csatIcon}>✍️</Text>
            </View>
            <View style={styles.csatInfo}>
              <Text style={styles.csatTitle}>Answer Writing</Text>
              <Text style={styles.csatSubtitle}>AI evaluation ready</Text>
            </View>
            <Text style={styles.csatArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTestCard}
            onPress={() => navigation.navigate('FlashcardDeck')}
            activeOpacity={0.7}
          >
            <View style={[styles.csatIconWrap, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
              <Text style={styles.csatIcon}>🃏</Text>
            </View>
            <View style={styles.csatInfo}>
              <Text style={styles.csatTitle}>Flashcard Decks</Text>
              <Text style={styles.csatSubtitle}>SM-2 spaced repetition</Text>
            </View>
            <Text style={styles.csatArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Practice Analytics Links */}
        <View style={styles.analyticsRow}>
          <TouchableOpacity
            style={styles.analyticsCard}
            onPress={() => navigation.navigate('PracticeStatsDetail')}
            activeOpacity={0.7}
          >
            <Text style={styles.analyticsIcon}>📊</Text>
            <View style={styles.analyticsInfo}>
              <Text style={styles.analyticsTitle}>Performance Analytics</Text>
              <Text style={styles.analyticsSubtitle}>Detailed breakdown by paper</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.analyticsCard}
            onPress={() => navigation.navigate('WeaknessFocus')}
            activeOpacity={0.7}
          >
            <Text style={styles.analyticsIcon}>🎯</Text>
            <View style={styles.analyticsInfo}>
              <Text style={styles.analyticsTitle}>Weak Areas Focus</Text>
              <Text style={styles.analyticsSubtitle}>AI-identified improvement areas</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weekly Study Chart */}
        <View style={styles.weeklyCard}>
          <Text style={styles.sectionTitle}>📈 This Week</Text>
          <Text style={styles.weeklySubtitle}>
            {todayTotal} of {weeklyGoal} min goal · {Math.round((todayTotal / weeklyGoal) * 100)}%
          </Text>
          <View style={styles.weeklyBars}>
            {WEEKLY_PROGRESS.map((d) => {
              const pct = Math.min(100, (d.minutes / d.goal) * 100);
              return (
                <View key={d.day} style={styles.weeklyBar}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${pct}%`,
                          backgroundColor: pct >= 80 ? colors.success : pct >= 50 ? colors.warning : colors.error,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barDay}>{d.day.charAt(0)}</Text>
                  <Text style={styles.barMin}>{d.minutes}m</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Test Centre */}
        <TouchableOpacity
          style={styles.testBanner}
          onPress={() => navigation.navigate('TestsHome')}
          activeOpacity={0.7}
        >
          <View style={styles.testBannerLeft}>
            <Text style={styles.testBannerEmoji}>🏆</Text>
            <View>
              <Text style={styles.testBannerTitle}>Test Centre</Text>
              <Text style={styles.testBannerSubtitle}>Sectional + Full-length mocks</Text>
            </View>
          </View>
          <View style={styles.testBannerRight}>
            <Text style={styles.testBannerStat}>12</Text>
            <Text style={styles.testBannerStatLabel}>tests taken</Text>
          </View>
        </TouchableOpacity>

        {/* Flashcard Summary */}
        <TouchableOpacity
          style={styles.flashcardBanner}
          onPress={() => navigation.navigate('FlashcardDeck')}
          activeOpacity={0.7}
        >
          <View style={styles.flashBannerLeft}>
            <Text style={styles.flashEmoji}>🃏</Text>
            <View>
              <Text style={styles.flashTitle}>Flashcard Review</Text>
              <Text style={styles.flashSubtitle}>15 cards due today · 3 new</Text>
            </View>
          </View>
          <View style={styles.flashBannerRight}>
            <Text style={styles.flashCount}>15</Text>
            <Text style={styles.flashLabel}>due</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  goalCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  goalTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  goalSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.card,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickIcon: { fontSize: 18 },
  quickTitle: {
    fontSize: typography.caption,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
    textAlign: 'center',
    marginBottom: 2,
  },
  quickSubtitle: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  perfCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  perfRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  perfItem: { alignItems: 'center' },
  perfValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  perfLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  weakAreasCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  weakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  weakRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  weakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  weakTopic: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    marginBottom: 2,
  },
  weakMeta: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  weakActionBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  weakActionText: {
    fontSize: typography.caption,
    color: colors.error,
    fontWeight: typography.semibold,
  },
  caCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  caHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  caSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  newsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  newsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
    flexShrink: 0,
  },
  newsContent: { flex: 1 },
  newsTitle: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.xs,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  newsTime: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  weeklyCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  weeklySubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  weeklyBar: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  barTrack: {
    width: 20,
    height: 50,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: borderRadius.sm,
  },
  barDay: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  barMin: {
    fontSize: typography.overline,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  modulesCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  moduleBtn: {
    width: '31%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  moduleIcon: { fontSize: 22, marginBottom: spacing.xs },
  moduleLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    textAlign: 'center',
  },
  testBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  testBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  testBannerEmoji: { fontSize: 32 },
  testBannerTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  testBannerSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  testBannerRight: {
    alignItems: 'flex-end',
  },
  testBannerStat: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  testBannerStatLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  flashcardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  flashBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flashEmoji: { fontSize: 32 },
  flashTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  flashSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  flashBannerRight: {
    alignItems: 'flex-end',
  },
  flashCount: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.success,
  },
  flashLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  bottomPadding: { height: 100 },

  // ─── Practice Hub ───────────────────────────────────────────
  practiceHubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  practiceHubSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Daily MCQ Card
  dailyMcqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  dailyMcqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  dailyMcqIconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dailyMcqIcon: { fontSize: 24 },
  dailyMcqInfo: { flex: 1 },
  dailyMcqTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dailyMcqTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  dailyMcqSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  dailyMcqMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyMcqMetaItem: { alignItems: 'center' },
  dailyMcqMetaDivider: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: spacing.md },
  dailyMcqMetaValue: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dailyMcqMetaLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  dailyMcqArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    flexShrink: 0,
  },
  dailyMcqArrowText: {
    fontSize: 16,
    color: colors.primary,
  },

  // GS Paper practice cards (2x2 grid)
  gsPracticeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gsCard: {
    width: '48.5%',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  gsCardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gsCardIcon: { fontSize: 18 },
  gsCardPaper: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  gsCardTopic: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  gsCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gsCardCount: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
  },
  gsCardArrow: {
    fontSize: typography.body,
    color: colors.textTertiary,
  },

  // CSAT + Quick Test row
  csatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  csatCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  csatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  csatIcon: { fontSize: 18 },
  csatInfo: { flex: 1 },
  csatTitle: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  csatSubtitle: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  csatArrow: {
    fontSize: typography.body,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  quickTestCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },

  // Analytics links
  analyticsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  analyticsIcon: { fontSize: 20, marginRight: spacing.sm },
  analyticsInfo: { flex: 1 },
  analyticsTitle: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  analyticsSubtitle: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
});
