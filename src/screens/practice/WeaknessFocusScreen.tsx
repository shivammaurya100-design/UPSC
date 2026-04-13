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
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { mockPracticeStats } from '../../data/practiceData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WEAK_AREAS = [
  {
    id: 'wa-001',
    topic: 'World History — Cold War',
    accuracy: 38,
    questionsAttempted: 24,
    lastAttempted: '3 days ago',
    subTopics: ['Cold War Origins', 'Non-Aligned Movement', 'US-Soviet Relations', 'Decolonisation'],
    aiInsight: 'You struggle with conceptual questions on superpower rivalry. Focus on understanding causes and consequences rather than dates.',
    recommendedAction: 'Review NMMC & Cold War MCQs — focus on causes vs effects framing.',
    mcqCount: 15,
  },
  {
    id: 'wa-002',
    topic: 'Ethics — Case Studies',
    accuracy: 42,
    questionsAttempted: 18,
    lastAttempted: '5 days ago',
    subTopics: ['Dilemma Analysis', 'Stakeholder Balance', 'Value Conflict'],
    aiInsight: 'Your ethical reasoning is developing but you tend to pick idealistic over pragmatic answers. UPSC expects context-aware responses.',
    recommendedAction: 'Practice 3 case studies daily. Focus on identifying stakeholders first.',
    mcqCount: 12,
  },
  {
    id: 'wa-003',
    topic: 'Economy — Banking & Financial Sector',
    accuracy: 45,
    questionsAttempted: 31,
    lastAttempted: '2 days ago',
    subTopics: ['RBI Functions', 'Monetary Policy', 'NPAs & Banking Reforms', 'Financial Inclusion'],
    aiInsight: 'Banking concepts need more clarity. You confuse instruments of monetary policy with fiscal policy tools.',
    recommendedAction: 'Revise RBI Annual Report key terms and current monetary policy rates.',
    mcqCount: 20,
  },
];

const STRONG_AREAS = [
  { topic: 'Indian Constitution', accuracy: 84, trend: '↑ improving' },
  { topic: 'Ancient History', accuracy: 79, trend: '↑ improving' },
  { topic: 'Environment & Ecology', accuracy: 76, trend: '→ stable' },
  { topic: 'Physical Geography', accuracy: 73, trend: '↑ improving' },
];

interface WeakAreaCardProps {
  area: typeof WEAK_AREAS[0];
  onPractice: () => void;
}

const WeakAreaCard: React.FC<WeakAreaCardProps> = ({ area, onPractice }) => {
  const [expanded, setExpanded] = useState(false);

  let progressColor = colors.error;
  if (area.accuracy >= 40) progressColor = colors.warning;

  return (
    <View style={styles.weakCard}>
      <TouchableOpacity
        style={styles.weakCardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.weakLeft}>
          <View style={[styles.weakIconWrap, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
            <Text style={styles.weakIcon}>🎯</Text>
          </View>
          <View style={styles.weakInfo}>
            <Text style={styles.weakTopic}>{area.topic}</Text>
            <View style={styles.weakMeta}>
              <Badge label={`${area.accuracy}% acc.`} variant="error" size="sm" />
              <Text style={styles.weakMetaText}>{area.questionsAttempted} qs attempted</Text>
            </View>
          </View>
        </View>
        <View style={styles.weakRight}>
          <View style={styles.accuracyRing}>
            <Text style={[styles.accuracyRingText, { color: progressColor }]}>
              {area.accuracy}%
            </Text>
          </View>
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.weakDetail}>
          {/* Sub-topics */}
          <Text style={styles.detailLabel}>Sub-topics with gaps:</Text>
          <View style={styles.subTopicsRow}>
            {area.subTopics.map((st) => (
              <Badge key={st} label={st} variant="error" size="sm" />
            ))}
          </View>

          {/* AI Insight */}
          <View style={styles.aiInsightCard}>
            <View style={styles.aiInsightHeader}>
              <Text style={styles.aiInsightEmoji}>🤖</Text>
              <Text style={styles.aiInsightTitle}>AI Analysis</Text>
            </View>
            <Text style={styles.aiInsightText}>{area.aiInsight}</Text>
          </View>

          {/* Recommended action */}
          <View style={styles.actionCard}>
            <Text style={styles.actionLabel}>📌 Recommended Action</Text>
            <Text style={styles.actionText}>{area.recommendedAction}</Text>
          </View>

          {/* Practice CTA */}
          <Button
            title={`Practice ${area.mcqCount} MCQs →`}
            onPress={onPractice}
            variant="primary"
            size="sm"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
    </View>
  );
};

const StrongAreaRow: React.FC<{ area: typeof STRONG_AREAS[0] }> = ({ area }) => (
  <View style={styles.strongRow}>
    <View style={styles.strongLeft}>
      <View style={[styles.strongDot, { backgroundColor: colors.success }]} />
      <Text style={styles.strongTopic}>{area.topic}</Text>
    </View>
    <View style={styles.strongRight}>
      <Text style={[styles.strongAccuracy, { color: colors.success }]}>{area.accuracy}%</Text>
      <Text style={styles.strongTrend}>{area.trend}</Text>
    </View>
  </View>
);

export const WeaknessFocusScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const overallAccuracy = mockPracticeStats.accuracy;
  const weakCount = WEAK_AREAS.length;

  // Calculate improvement trajectory
  const improvementScore = Math.min(100, Math.round(
    (overallAccuracy / 100) * 50 +
    (weakCount === 0 ? 50 : 25) +
    (mockPracticeStats.streakDays * 0.5)
  ));

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Weak Areas Focus</Text>
          <Text style={styles.headerSubtitle}>AI-identified improvement areas</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>🤖 AI</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall readiness score */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessHeader}>
            <Text style={styles.readinessTitle}>Readiness Score</Text>
            <Badge label="AI Powered" variant="primary" size="sm" />
          </View>
          <View style={styles.readinessBody}>
            <View style={styles.readinessScore}>
              <Text style={styles.readinessScoreText}>{improvementScore}</Text>
              <Text style={styles.readinessScoreLabel}>/ 100</Text>
            </View>
            <View style={styles.readinessRight}>
              <Text style={styles.readinessMsg}>
                {improvementScore >= 80
                  ? 'Excellent! Focus on maintaining your strong areas.'
                  : improvementScore >= 60
                  ? 'Good progress. Prioritize your weakest topics.'
                  : 'Keep building fundamentals — focus on one weak area at a time.'}
              </Text>
              <View style={styles.readinessStats}>
                <View style={styles.readinessStat}>
                  <Text style={styles.readinessStatVal}>{weakCount}</Text>
                  <Text style={styles.readinessStatLbl}>Weak Areas</Text>
                </View>
                <View style={styles.readinessStatDivider} />
                <View style={styles.readinessStat}>
                  <Text style={styles.readinessStatVal}>{overallAccuracy}%</Text>
                  <Text style={styles.readinessStatLbl}>Overall Acc.</Text>
                </View>
                <View style={styles.readinessStatDivider} />
                <View style={styles.readinessStat}>
                  <Text style={styles.readinessStatVal}>{mockPracticeStats.streakDays}</Text>
                  <Text style={styles.readinessStatLbl}>Day Streak</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly trend */}
        <View style={styles.trendCard}>
          <Text style={styles.trendTitle}>📈 Weekly Accuracy Trend</Text>
          <View style={styles.trendBars}>
            {[
              { day: 'Mon', accuracy: 58 },
              { day: 'Tue', accuracy: 62 },
              { day: 'Wed', accuracy: 60 },
              { day: 'Thu', accuracy: 67 },
              { day: 'Fri', accuracy: 65 },
              { day: 'Sat', accuracy: 71 },
              { day: 'Sun', accuracy: 67 },
            ].map((d) => (
              <View key={d.day} style={styles.trendBar}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${d.accuracy}%`,
                        backgroundColor: d.accuracy >= 65 ? colors.success : colors.warning,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{d.day}</Text>
                <Text style={styles.barAccuracy}>{d.accuracy}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weak areas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Areas Needing Attention</Text>
          <Text style={styles.sectionSubtitle}>{weakCount} topics detected</Text>
        </View>

        {WEAK_AREAS.map((area) => (
          <WeakAreaCard
            key={area.id}
            area={area}
            onPractice={() => navigation.navigate('MCQPractice', { topicId: 'daily' })}
          />
        ))}

        {/* Strong areas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Strong Areas</Text>
          <Text style={styles.sectionSubtitle}>Keep practicing to maintain</Text>
        </View>

        <View style={styles.strongCard}>
          {STRONG_AREAS.map((area, i) => (
            <React.Fragment key={area.topic}>
              <StrongAreaRow area={area} />
              {i < STRONG_AREAS.length - 1 && <View style={styles.strongDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Focus plan */}
        <View style={styles.focusPlanCard}>
          <Text style={styles.focusPlanTitle}>📋 Weekly Focus Plan</Text>
          {[
            { day: 'Day 1–2', focus: 'World History — Cold War', action: '15 MCQs + Notes revision' },
            { day: 'Day 3–4', focus: 'Ethics — Case Studies', action: '10 case study MCQs + answer review' },
            { day: 'Day 5–6', focus: 'Economy — Banking', action: '20 MCQs + RBI functions note' },
            { day: 'Day 7', focus: 'Review & Revision', action: 'Mixed practice of all weak areas' },
          ].map((plan) => (
            <View key={plan.day} style={styles.planRow}>
              <View style={styles.planDay}>
                <Text style={styles.planDayText}>{plan.day}</Text>
              </View>
              <View style={styles.planContent}>
                <Text style={styles.planFocus}>{plan.focus}</Text>
                <Text style={styles.planAction}>{plan.action}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Start Focused Practice"
          onPress={() => navigation.navigate('MCQPractice', { topicId: 'gs2' })}
          variant="primary"
          fullWidth
        />
      </View>
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
  aiBadge: {
    backgroundColor: 'rgba(99,102,241,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: 'auto',
  },
  aiBadgeText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  readinessCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  readinessTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  readinessBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  readinessScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  readinessScoreText: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  readinessScoreLabel: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  readinessRight: { flex: 1, gap: spacing.md },
  readinessMsg: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  readinessStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  readinessStat: { alignItems: 'center' },
  readinessStatDivider: { width: 1, height: 20, backgroundColor: colors.border },
  readinessStatVal: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  readinessStatLbl: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  trendCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  trendTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  trendBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  barTrack: {
    width: 24,
    height: 60,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: borderRadius.sm,
  },
  barLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  barAccuracy: {
    fontSize: typography.overline,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  weakCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  weakCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  weakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  weakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  weakIcon: { fontSize: 20 },
  weakInfo: { flex: 1 },
  weakTopic: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  weakMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weakMetaText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  weakRight: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  accuracyRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyRingText: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
  },
  expandIcon: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  weakDetail: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  subTopicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  aiInsightCard: {
    backgroundColor: 'rgba(99,102,241,0.07)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  aiInsightEmoji: { fontSize: 14 },
  aiInsightTitle: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  aiInsightText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: typography.caption * typography.normal,
  },
  actionCard: {
    backgroundColor: 'rgba(16,185,129,0.07)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  actionLabel: {
    fontSize: typography.caption,
    color: colors.success,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: typography.caption * typography.normal,
  },
  strongCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  strongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  strongDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  strongLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  strongDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strongTopic: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  strongRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  strongAccuracy: {
    fontSize: typography.bodySmall,
    fontWeight: typography.bold,
  },
  strongTrend: {
    fontSize: typography.caption,
    color: colors.success,
    fontWeight: typography.medium,
  },
  focusPlanCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
    ...shadows.card,
  },
  focusPlanTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  planRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  planDay: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  planDayText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  planContent: { flex: 1 },
  planFocus: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
  },
  planAction: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  bottomPadding: { height: spacing.xxxl },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
