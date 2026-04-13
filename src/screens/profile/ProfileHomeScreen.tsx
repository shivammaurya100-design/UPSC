import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { mockPracticeStats } from '../../data/practiceData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const USER = {
  name: 'Rahul Sharma',
  stage: 'Mains 2026',
  rank: 'AIR 1,245',
  xp: 4280,
  xpToNextLevel: 5000,
  level: 12,
  joinedDays: 127,
  totalStudyMinutes: 18420,
  targetYear: 2026,
};

const SYLLABUS_PROGRESS = [
  { paper: 'GS I — History & Geography', progress: 68, totalTopics: 48, completed: 33, icon: '🏛️' },
  { paper: 'GS II — Polity & Governance', progress: 54, totalTopics: 38, completed: 21, icon: '⚖️' },
  { paper: 'GS III — Economy & Env', progress: 42, totalTopics: 45, completed: 19, icon: '📊' },
  { paper: 'GS IV — Ethics', progress: 31, totalTopics: 22, completed: 7, icon: '🧠' },
  { paper: 'CSAT — Reasoning', progress: 77, totalTopics: 30, completed: 23, icon: '📐' },
];

const ACHIEVEMENTS = [
  { id: 'ach-001', title: '7-Day Streak', emoji: '🔥', desc: '7 consecutive days of practice', unlocked: true, color: colors.warning },
  { id: 'ach-002', title: 'MCQ Master', emoji: '🎯', desc: '1000+ MCQs attempted', unlocked: true, color: colors.primary },
  { id: 'ach-003', title: 'Early Bird', emoji: '🌅', desc: 'Study before 6 AM', unlocked: true, color: colors.success },
  { id: 'ach-004', title: 'Consistent', emoji: '📚', desc: '30 days on app', unlocked: true, color: colors.info },
  { id: 'ach-005', title: 'Top 10%', emoji: '🏅', desc: 'Rank in top 10% all-India', unlocked: false, color: colors.textTertiary },
  { id: 'ach-006', title: 'Flashcard Pro', emoji: '🃏', desc: '500+ cards reviewed', unlocked: false, color: colors.textTertiary },
];

const WEEKLY_GOAL = {
  targetMinutes: 300,
  completedMinutes: 217,
  daysCompleted: 4,
  totalDays: 7,
};

const GoalProgressRing: React.FC<{ progress: number; label: string; value: string }> = ({
  progress,
  label,
  value,
}) => {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <View style={styles.ringContainer}>
      <View style={styles.ring}>
        <View style={[styles.ringInner, { width: size, height: size }]}>
          <Text style={styles.ringValue}>{value}</Text>
          <Text style={styles.ringLabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
};

export const ProfileHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'achievements'>('overview');

  const xpProgress = Math.round((USER.xp / USER.xpToNextLevel) * 100);

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{USER.name.charAt(0)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{USER.name}</Text>
          <View style={styles.profileMeta}>
            <Badge label={USER.stage} variant="primary" size="sm" />
            <Text style={styles.profileRank}>{USER.rank}</Text>
          </View>
          <View style={styles.xpRow}>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpText}>Lv.{USER.level} · {USER.xp}/{USER.xpToNextLevel} XP</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        {[
          { value: `${USER.joinedDays}`, label: 'Days Active' },
          { value: `${Math.round(USER.totalStudyMinutes / 60)}h`, label: 'Study Time' },
          { value: `${mockPracticeStats.totalAttempted}`, label: 'MCQs Done' },
          { value: `${mockPracticeStats.accuracy}%`, label: 'Accuracy' },
        ].map((stat, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Weekly goal */}
      <View style={styles.weeklyGoalCard}>
        <View style={styles.weeklyGoalHeader}>
          <Text style={styles.weeklyGoalTitle}>📅 Weekly Goal</Text>
          <Badge label={`${WEEKLY_GOAL.daysCompleted}/${WEEKLY_GOAL.totalDays} days`} variant="success" size="sm" />
        </View>
        <View style={styles.weeklyGoalBody}>
          <View style={styles.goalRings}>
            <View style={styles.goalRingWrap}>
              <GoalProgressRing
                progress={Math.round((WEEKLY_GOAL.completedMinutes / WEEKLY_GOAL.targetMinutes) * 100)}
                label="min done"
                value={`${WEEKLY_GOAL.completedMinutes}m`}
              />
              <Text style={styles.goalTarget}>of {WEEKLY_GOAL.targetMinutes} min goal</Text>
            </View>
            <View style={styles.goalDays}>
              {Array.from({ length: WEEKLY_GOAL.totalDays }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dayDot,
                    i < WEEKLY_GOAL.daysCompleted && styles.dayDotActive,
                  ]}
                >
                  <Text style={[styles.dayDotText, i < WEEKLY_GOAL.daysCompleted && styles.dayDotTextActive]}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.goalProgressBar}>
            <ProgressBar
              progress={Math.round((WEEKLY_GOAL.completedMinutes / WEEKLY_GOAL.targetMinutes) * 100)}
              height={8}
              color={colors.success}
            />
            <Text style={styles.goalProgressText}>
              {Math.round((WEEKLY_GOAL.completedMinutes / WEEKLY_GOAL.targetMinutes) * 100)}% of weekly goal
            </Text>
          </View>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'syllabus', label: 'Syllabus' },
          { key: 'achievements', label: 'Badges' },
        ] as const).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && (
          <>
            {/* Quick actions */}
            <View style={styles.quickActions}>
              {[
                { icon: '📖', label: 'Continue Learning', onPress: () => navigation.navigate('LearnHome') },
                { icon: '✍️', label: 'Practice MCQs', onPress: () => navigation.navigate('PracticeHome') },
                { icon: '📝', label: 'Take a Test', onPress: () => navigation.navigate('TestsHome') },
                { icon: '🃏', label: 'Review Cards', onPress: () => navigation.navigate('FlashcardDeck') },
              ].map((action) => (
                <TouchableOpacity key={action.label} style={styles.quickAction} onPress={action.onPress}>
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Today's activity */}
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>📊 Today's Activity</Text>
              <View style={styles.activityRow}>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>47</Text>
                  <Text style={styles.activityLabel}>MCQs</Text>
                </View>
                <View style={styles.activityDivider} />
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>3</Text>
                  <Text style={styles.activityLabel}>Flashcards</Text>
                </View>
                <View style={styles.activityDivider} />
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>28m</Text>
                  <Text style={styles.activityLabel}>Study Time</Text>
                </View>
              </View>
            </View>

            {/* Reminders */}
            <View style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>⏰ Today's Reminders</Text>
              {[
                { task: 'Review Constitution — Fundamental Rights', time: 'Due today', urgent: true },
                { task: 'Complete 20 MCQs — GS II Polity', time: 'Due today', urgent: false },
                { task: 'Flashcard review — 15 cards due', time: 'Due tomorrow', urgent: false },
              ].map((r, i) => (
                <View key={i} style={styles.reminderRow}>
                  <View style={[styles.reminderDot, { backgroundColor: r.urgent ? colors.error : colors.warning }]} />
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTask}>{r.task}</Text>
                    <Text style={styles.reminderTime}>{r.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'syllabus' && (
          <View style={styles.syllabusList}>
            <View style={styles.overallProgress}>
              <Text style={styles.overallProgressTitle}>Overall Completion</Text>
              <View style={styles.overallProgressRow}>
                <Text style={styles.overallProgressValue}>
                  {Math.round(SYLLABUS_PROGRESS.reduce((s, p) => s + p.completed, 0) / SYLLABUS_PROGRESS.reduce((s, p) => s + p.totalTopics, 0) * 100)}%
                </Text>
                <ProgressBar
                  progress={Math.round(SYLLABUS_PROGRESS.reduce((s, p) => s + p.completed, 0) / SYLLABUS_PROGRESS.reduce((s, p) => s + p.totalTopics, 0) * 100)}
                  height={8}
                  style={{ flex: 1 }}
                />
              </View>
              <Text style={styles.overallProgressSub}>
                {SYLLABUS_PROGRESS.reduce((s, p) => s + p.completed, 0)} of {SYLLABUS_PROGRESS.reduce((s, p) => s + p.totalTopics, 0)} topics completed
              </Text>
            </View>

            {SYLLABUS_PROGRESS.map((paper) => (
              <TouchableOpacity key={paper.paper} style={styles.paperCard} activeOpacity={0.7}>
                <View style={styles.paperLeft}>
                  <View style={styles.paperIconWrap}>
                    <Text style={styles.paperIcon}>{paper.icon}</Text>
                  </View>
                  <View style={styles.paperInfo}>
                    <Text style={styles.paperName}>{paper.paper}</Text>
                    <View style={styles.paperProgressRow}>
                      <ProgressBar progress={paper.progress} height={4} style={{ flex: 1 }} />
                      <Text style={styles.paperProgressText}>{paper.completed}/{paper.totalTopics}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.paperRight}>
                  <Text
                    style={[
                      styles.paperPct,
                      { color: paper.progress >= 60 ? colors.success : paper.progress >= 40 ? colors.warning : colors.error },
                    ]}
                  >
                    {paper.progress}%
                  </Text>
                  <Text style={styles.paperArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.achievementsList}>
            <Text style={styles.achievementsSubtitle}>{ACHIEVEMENTS.filter((a) => a.unlocked).length} of {ACHIEVEMENTS.length} unlocked</Text>
            {ACHIEVEMENTS.map((ach) => (
              <View key={ach.id} style={[styles.achCard, !ach.unlocked && styles.achCardLocked]}>
                <View style={[styles.achIconWrap, { backgroundColor: ach.unlocked ? `${ach.color}20` : colors.surfaceElevated }]}>
                  <Text style={[styles.achIcon, !ach.unlocked && styles.achIconLocked]}>{ach.emoji}</Text>
                </View>
                <View style={styles.achInfo}>
                  <Text style={[styles.achTitle, !ach.unlocked && styles.achTitleLocked]}>{ach.title}</Text>
                  <Text style={styles.achDesc}>{ach.desc}</Text>
                </View>
                {ach.unlocked && (
                  <View style={styles.achUnlocked}>
                    <Text style={styles.achCheck}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: '#fff',
  },
  profileInfo: { flex: 1, gap: spacing.xs },
  profileName: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileRank: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  xpRow: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  xpBarTrack: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
  },
  xpBarFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  xpText: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 18 },
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  weeklyGoalCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  weeklyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  weeklyGoalTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  weeklyGoalBody: {
    gap: spacing.lg,
  },
  goalRings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalRingWrap: {
    alignItems: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 40,
  },
  ringValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.success,
  },
  ringLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  goalTarget: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  goalDays: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayDotActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  dayDotText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  dayDotTextActive: {
    color: '#fff',
    fontWeight: typography.bold,
  },
  goalProgressBar: {
    gap: spacing.xs,
  },
  goalProgressText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAction: {
    width: '48%',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  quickActionIcon: { fontSize: 24, marginBottom: spacing.xs },
  quickActionLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  activityTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityItem: { flex: 1, alignItems: 'center' },
  activityDivider: { width: 1, height: 30, backgroundColor: colors.border },
  activityValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  activityLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  reminderCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  reminderTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reminderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  reminderContent: { flex: 1 },
  reminderTask: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  syllabusList: {
    gap: spacing.md,
  },
  overallProgress: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  overallProgressTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  overallProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  overallProgressValue: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  overallProgressSub: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  paperCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  paperLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  paperIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  paperIcon: { fontSize: 18 },
  paperInfo: { flex: 1, gap: spacing.xs },
  paperName: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  paperProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paperProgressText: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  paperRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paperPct: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
  },
  paperArrow: {
    fontSize: typography.body,
    color: colors.textTertiary,
  },
  achievementsList: {
    gap: spacing.md,
  },
  achievementsSubtitle: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  achCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  achCardLocked: {
    opacity: 0.6,
  },
  achIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  achIcon: { fontSize: 24 },
  achIconLocked: { opacity: 0.4 },
  achInfo: { flex: 1 },
  achTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  achTitleLocked: {
    color: colors.textSecondary,
  },
  achDesc: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  achUnlocked: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achCheck: {
    fontSize: typography.body,
    color: '#fff',
    fontWeight: typography.bold,
  },
  bottomPadding: { height: 100 },
});
