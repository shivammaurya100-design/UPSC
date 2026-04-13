import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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

const PAPER_STATS = [
  { paper: 'GS I — History & Geography', accuracy: 72, attempted: 487, correct: 351, icon: '🏛️', color: colors.primary },
  { paper: 'GS II — Polity & Governance', accuracy: 68, attempted: 324, correct: 220, icon: '⚖️', color: colors.info },
  { paper: 'GS III — Economy & Env', accuracy: 61, attempted: 412, correct: 251, icon: '📊', color: colors.warning },
  { paper: 'GS IV — Ethics', accuracy: 58, attempted: 198, correct: 115, icon: '🧠', color: '#A78BFA' },
  { paper: 'CSAT — Reasoning', accuracy: 74, attempted: 426, correct: 315, icon: '📐', color: colors.success },
];

const MONTHLY_TREND = [
  { month: 'Jan', accuracy: 54, attempted: 210 },
  { month: 'Feb', accuracy: 58, attempted: 245 },
  { month: 'Mar', accuracy: 61, attempted: 312 },
  { month: 'Apr', accuracy: 67, attempted: 380 },
  { month: 'May', accuracy: 64, attempted: 290 },
  { month: 'Jun', accuracy: 67, attempted: 410 },
];

const ACCURACY_TREND = [52, 55, 58, 61, 60, 64, 62, 67, 65, 68, 66, 67];

const TIME_BUCKETS = [
  { range: '< 20s', count: 142, color: colors.error },
  { range: '20–40s', count: 486, color: colors.warning },
  { range: '40–60s', count: 724, color: colors.success },
  { range: '60–90s', count: 312, color: colors.info },
  { range: '> 90s', count: 183, color: colors.textTertiary },
];

interface AccuracyChartProps {
  data: number[];
}

const AccuracyChart: React.FC<AccuracyChartProps> = ({ data }) => {
  return (
    <View style={styles.chartContainer}>
      {data.map((val, i) => {
        const heightPct = (val / 100) * 80;
        const isGood = val >= 65;
        return (
          <View key={i} style={styles.chartBar}>
            <View style={styles.chartBarTrack}>
              <View
                style={[
                  styles.chartBarFill,
                  {
                    height: heightPct,
                    backgroundColor: isGood ? colors.success : colors.warning,
                  },
                ]}
              />
            </View>
            <Text style={styles.chartBarLabel}>W{i + 1}</Text>
            <Text style={styles.chartBarValue}>{val}%</Text>
          </View>
        );
      })}
    </View>
  );
};

const PaperStatRow: React.FC<typeof PAPER_STATS[0]> = (stat) => {
  const [expanded, setExpanded] = useState(false);
  const isGood = stat.accuracy >= 65;

  return (
    <>
      <TouchableOpacity
        style={styles.paperRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.paperIconWrap, { backgroundColor: `${stat.color}20` }]}>
          <Text style={styles.paperIcon}>{stat.icon}</Text>
        </View>
        <View style={styles.paperInfo}>
          <Text style={styles.paperName}>{stat.paper}</Text>
          <View style={styles.paperMeta}>
            <Text style={styles.paperMetaText}>{stat.attempted} attempted</Text>
            <View style={styles.paperDot} />
            <Text style={styles.paperMetaText}>{stat.correct} correct</Text>
          </View>
          <ProgressBar
            progress={stat.accuracy}
            height={4}
            style={{ marginTop: spacing.xs }}
            color={isGood ? colors.success : colors.warning}
          />
        </View>
        <View style={styles.paperRight}>
          <Text
            style={[
              styles.paperAccuracy,
              { color: isGood ? colors.success : colors.warning },
            ]}
          >
            {stat.accuracy}%
          </Text>
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.paperExpanded}>
          <View style={styles.paperExpandedRow}>
            <View style={styles.paperExpandedStat}>
              <Text style={styles.paperExpandedVal}>{stat.correct}</Text>
              <Text style={styles.paperExpandedLbl}>Correct</Text>
            </View>
            <View style={styles.paperExpandedDivider} />
            <View style={styles.paperExpandedStat}>
              <Text style={[styles.paperExpandedVal, { color: colors.error }]}>
                {stat.attempted - stat.correct}
              </Text>
              <Text style={styles.paperExpandedLbl}>Wrong</Text>
            </View>
            <View style={styles.paperExpandedDivider} />
            <View style={styles.paperExpandedStat}>
              <Text style={[styles.paperExpandedVal, { color: colors.primary }]}>
                {Math.round(stat.correct / stat.attempted * 100)}%
              </Text>
              <Text style={styles.paperExpandedLbl}>Accuracy</Text>
            </View>
            <View style={styles.paperExpandedDivider} />
            <View style={styles.paperExpandedStat}>
              <Text style={[styles.paperExpandedVal, { color: colors.info }]}>
                {mockPracticeStats.avgTimePerQuestion}s
              </Text>
              <Text style={styles.paperExpandedLbl}>Avg Time</Text>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const TimeDistributionChart: React.FC = () => {
  const total = TIME_BUCKETS.reduce((sum, b) => sum + b.count, 0);
  return (
    <View style={styles.timeChartContainer}>
      {TIME_BUCKETS.map((bucket, i) => {
        const pct = Math.round((bucket.count / total) * 100);
        return (
          <View key={i} style={styles.timeRow}>
            <Text style={styles.timeRange}>{bucket.range}</Text>
            <View style={styles.timeBarTrack}>
              <View
                style={[
                  styles.timeBarFill,
                  { width: `${pct}%`, backgroundColor: bucket.color },
                ]}
              />
            </View>
            <Text style={styles.timeCount}>{bucket.count}</Text>
            <Text style={styles.timePct}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
};

export const PracticeStatsDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const stats = mockPracticeStats;
  const maxAccuracy = Math.max(...ACCURACY_TREND);
  const minAccuracy = Math.min(...ACCURACY_TREND);

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Performance Analytics</Text>
          <Text style={styles.headerSubtitle}>Detailed breakdown</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Key metrics grid */}
        <View style={styles.metricsGrid}>
          {[
            { label: 'Overall Accuracy', value: `${stats.accuracy}%`, subLabel: `${stats.correctAnswers}/${stats.totalAttempted}`, color: stats.accuracy >= 65 ? colors.success : colors.warning, icon: '🎯' },
            { label: 'Day Streak', value: `${stats.streakDays}`, subLabel: 'consecutive days', color: colors.warning, icon: '🔥' },
            { label: 'Avg Time/Q', value: `${stats.avgTimePerQuestion}s`, subLabel: 'per question', color: colors.info, icon: '⏱️' },
            { label: 'vs Last Week', value: `+${stats.improvementPercent}%`, subLabel: 'improvement', color: colors.success, icon: '📈' },
          ].map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{metric.icon}</Text>
              <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricSubLabel}>{metric.subLabel}</Text>
            </View>
          ))}
        </View>

        {/* Accuracy trend */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📊 Accuracy Trend (Last 12 weeks)</Text>
            <Badge label={`↑ ${stats.improvementPercent}%`} variant="success" size="sm" />
          </View>
          <View style={styles.trendRangeRow}>
            <Text style={styles.trendRangeText}>Low: {minAccuracy}%</Text>
            <Text style={styles.trendRangeText}>Current: {ACCURACY_TREND[ACCURACY_TREND.length - 1]}%</Text>
            <Text style={styles.trendRangeText}>Peak: {maxAccuracy}%</Text>
          </View>
          <AccuracyChart data={ACCURACY_TREND} />
          <Text style={styles.chartCaption}>
            Weekly accuracy improving by {stats.improvementPercent}% vs last month
          </Text>
        </View>

        {/* Paper-wise breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Paper-Wise Performance</Text>
          <Text style={styles.cardSubtitle}>Tap a paper to see detailed stats</Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            {PAPER_STATS.map((stat) => (
              <PaperStatRow key={stat.paper} {...stat} />
            ))}
          </View>
        </View>

        {/* Time distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱️ Time Distribution per Question</Text>
          <Text style={styles.cardSubtitle}>How quickly you answer MCQs</Text>
          <TimeDistributionChart />
          <View style={styles.timeLegend}>
            <View style={styles.timeLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Too fast — may be guessing</Text>
            </View>
            <View style={styles.timeLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Optimal — well-considered</Text>
            </View>
          </View>
        </View>

        {/* Strong vs Weak */}
        <View style={styles.twoColCard}>
          <View style={styles.twoColSection}>
            <Text style={styles.twoColTitle}>💪 Strong Areas</Text>
            {stats.strongTopics.map((topic) => (
              <View key={topic} style={styles.topicRow}>
                <View style={[styles.topicDot, { backgroundColor: colors.success }]} />
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
          <View style={styles.twoColDivider} />
          <View style={styles.twoColSection}>
            <Text style={styles.twoColTitle}>🎯 Needs Work</Text>
            {stats.weakTopics.map((topic) => (
              <View key={topic} style={styles.topicRow}>
                <View style={[styles.topicDot, { backgroundColor: colors.error }]} />
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Session history */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Recent Sessions</Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            {[
              { date: 'Today', type: 'Daily MCQ', score: '8/10', accuracy: 80, time: '7 min' },
              { date: 'Yesterday', type: 'GS I Practice', score: '14/20', accuracy: 70, time: '22 min' },
              { date: '2 days ago', type: 'CSAT Reasoning', score: '4/5', accuracy: 80, time: '4 min' },
              { date: '3 days ago', type: 'Daily MCQ', score: '7/10', accuracy: 70, time: '9 min' },
              { date: '4 days ago', type: 'Flashcard Review', score: '18/20', accuracy: 90, time: '12 min' },
            ].map((session) => (
              <View key={session.date} style={styles.sessionRow}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                  <Text style={styles.sessionType}>{session.type}</Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionScore}>{session.score}</Text>
                  <View style={styles.sessionMeta}>
                    <Text
                      style={[
                        styles.sessionAccuracy,
                        { color: session.accuracy >= 70 ? colors.success : colors.warning },
                      ]}
                    >
                      {session.accuracy}%
                    </Text>
                    <Text style={styles.sessionTime}>{session.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: colors.textPrimary },
  headerTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  metricIcon: { fontSize: 20, marginBottom: spacing.xs },
  metricValue: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
  },
  metricLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  metricSubLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  trendRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  trendRangeText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: spacing.lg,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  chartBarTrack: {
    width: 20,
    height: 80,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: borderRadius.sm,
  },
  chartBarLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  chartBarValue: {
    fontSize: typography.overline,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  chartCaption: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  paperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paperIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  paperIcon: { fontSize: 18 },
  paperInfo: { flex: 1 },
  paperName: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
  },
  paperMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paperDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
  },
  paperMetaText: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  paperRight: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  paperAccuracy: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
  },
  expandIcon: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  paperExpanded: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  paperExpandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  paperExpandedStat: { alignItems: 'center' },
  paperExpandedDivider: { width: 1, height: 30, backgroundColor: colors.border },
  paperExpandedVal: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  paperExpandedLbl: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  timeChartContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeRange: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    width: 52,
    fontWeight: typography.medium,
  },
  timeBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  timeBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  timeCount: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
  timePct: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    width: 30,
  },
  timeLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  twoColCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  twoColSection: { flex: 1 },
  twoColDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  twoColTitle: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  topicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  topicText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: typography.caption * typography.normal,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionLeft: {},
  sessionDate: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  sessionType: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionScore: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionAccuracy: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
  },
  sessionTime: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  bottomPadding: { height: spacing.xxxl },
});
