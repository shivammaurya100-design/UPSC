import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { extendedMCQs } from '../../data/practiceData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'MCQReview'>;

// ID sets matching MCQPracticeScreen
const QUICK_MCQ_IDS = ['mcq-csat-001', 'mcq-csat-002', 'mcq-hist-001', 'mcq-eco-001', 'mcq-env-001'];
const DAILY_MCQ_IDS = ['mcq-hist-001', 'mcq-poly-001', 'mcq-eco-001', 'mcq-csat-001', 'mcq-env-001', 'mcq-st-001', 'mcq-eth-001', 'mcq-hist-002', 'mcq-poly-002', 'mcq-eco-002'];
const GS1_IDS = ['mcq-hist-001', 'mcq-hist-002', 'mcq-hist-003', 'mcq-hist-004', 'mcq-hist-005', 'mcq-env-001', 'mcq-env-002', 'mcq-env-003'];
const GS2_IDS = ['mcq-poly-001', 'mcq-poly-002', 'mcq-poly-003', 'mcq-poly-004', 'mcq-poly-005', 'mcq-st-001', 'mcq-st-002'];
const CSAT_IDS = ['mcq-csat-001', 'mcq-csat-002', 'mcq-csat-003', 'mcq-csat-004', 'mcq-csat-005'];

const ID_MAP: Record<string, string[]> = {
  daily: DAILY_MCQ_IDS,
  quick: QUICK_MCQ_IDS,
  gs1: GS1_IDS,
  gs2: GS2_IDS,
  csat: CSAT_IDS,
};

function getMCQsForTopic(topicId: string) {
  const ids = ID_MAP[topicId] ?? QUICK_MCQ_IDS;
  return ids
    .map((id) => extendedMCQs.find((m) => m.id === id)!)
    .filter(Boolean);
}

// Seeded user answers (simulating what was selected during the session)
const SESSION_ANSWERS: Record<string, number> = {
  'mcq-hist-001': 0, // correct
  'mcq-poly-001': 2, // wrong
  'mcq-eco-001': 1,   // correct
  'mcq-csat-001': 0,  // correct
  'mcq-env-001': 3,   // wrong
  'mcq-st-001': 1,    // correct
  'mcq-eth-001': 1,   // correct
  'mcq-hist-002': 0,  // wrong
  'mcq-poly-002': 1,  // wrong
  'mcq-eco-002': 1,   // correct
  'mcq-csat-002': 0,  // correct
  'mcq-csat-003': 0,  // correct
  'mcq-csat-004': 3,  // wrong
  'mcq-csat-005': 0,  // correct
  'mcq-hist-003': 1,  // correct
  'mcq-hist-004': 1,  // wrong
  'mcq-hist-005': 0,  // correct
  'mcq-poly-003': 1,  // wrong
  'mcq-poly-004': 2,  // correct
  'mcq-poly-005': 1,  // correct
  'mcq-st-002': 1,    // correct
  'mcq-env-002': 1,   // wrong
  'mcq-env-003': 0,  // correct
};

interface ReviewQuestionProps {
  question: (typeof extendedMCQs)[0];
  index: number;
  userAnswer: number | undefined;
  isExpanded: boolean;
  onToggle: () => void;
}

const ReviewQuestion: React.FC<ReviewQuestionProps> = ({
  question,
  index,
  userAnswer,
  isExpanded,
  onToggle,
}) => {
  const isCorrect = userAnswer === question.correctOption;
  const isUnanswered = userAnswer === undefined;
  const userLetter = userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) : '—';
  const correctLetter = String.fromCharCode(65 + question.correctOption);

  let statusColor = colors.textSecondary;
  let statusBg = colors.surfaceElevated;
  let statusLabel = 'Not answered';
  let statusIcon = '○';

  if (isUnanswered) {
    statusColor = colors.warning;
    statusBg = 'rgba(245,158,11,0.1)';
    statusLabel = 'Not answered';
    statusIcon = '○';
  } else if (isCorrect) {
    statusColor = colors.success;
    statusBg = 'rgba(16,185,129,0.1)';
    statusLabel = `Correct — ${userLetter}`;
    statusIcon = '✓';
  } else {
    statusColor = colors.error;
    statusBg = 'rgba(239,68,68,0.1)';
    statusLabel = `Wrong — ${userLetter} (correct: ${correctLetter})`;
    statusIcon = '✗';
  }

  return (
    <View style={styles.questionCard}>
      <TouchableOpacity
        style={styles.questionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.questionNumBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.questionNumText, { color: statusColor }]}>{index + 1}</Text>
        </View>
        <View style={styles.questionMeta}>
          <Text style={styles.questionTitle} numberOfLines={2}>
            {question.question}
          </Text>
          <View style={styles.questionHeaderRow}>
            {question.source && (
              <Badge label={question.source} variant="neutral" size="sm" />
            )}
            {question.year && (
              <Text style={styles.yearText}>{question.year}</Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusIcon, { color: statusColor }]}>{statusIcon}</Text>
        </View>
      </TouchableOpacity>

      {/* Expandable detail */}
      {isExpanded && (
        <View style={styles.detailSection}>
          {/* User's answer */}
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>Your answer:</Text>
            <View style={[styles.answerChip, {
              backgroundColor: isUnanswered ? 'rgba(245,158,11,0.12)' :
                isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            }]}>
              <Text style={[styles.answerChipText, {
                color: isUnanswered ? colors.warning :
                  isCorrect ? colors.success : colors.error,
              }]}>
                {isUnanswered ? 'Not answered' : question.options[userAnswer!]}
              </Text>
            </View>
          </View>

          {/* Correct answer (only if wrong) */}
          {!isUnanswered && !isCorrect && (
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Correct:</Text>
              <View style={[styles.answerChip, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                <Text style={[styles.answerChipText, { color: colors.success }]}>
                  {question.options[question.correctOption]}
                </Text>
              </View>
            </View>
          )}

          {/* Explanation */}
          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>💡 Explanation</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>

          {/* All options */}
          <View style={styles.allOptions}>
            {question.options.map((option, i) => {
              const isThisCorrect = i === question.correctOption;
              const isThisSelected = i === userAnswer;

              let optBg = colors.surfaceElevated;
              let optBorder = colors.border;
              let optColor = colors.textSecondary;
              let prefix = `${String.fromCharCode(65 + i)}. `;

              if (isThisCorrect) {
                optBg = 'rgba(16,185,129,0.08)';
                optBorder = colors.success;
                optColor = colors.success;
                prefix = '✓ ';
              } else if (isThisSelected && !isCorrect) {
                optBg = 'rgba(239,68,68,0.08)';
                optBorder = colors.error;
                optColor = colors.error;
                prefix = '✗ ';
              }

              return (
                <View
                  key={i}
                  style={[styles.optionRow, { backgroundColor: optBg, borderColor: optBorder }]}
                >
                  <Text style={[styles.optionText, { color: optColor }]}>
                    {prefix}{option}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Toggle hint */}
      <TouchableOpacity style={styles.toggleRow} onPress={onToggle}>
        <Text style={styles.toggleText}>
          {isExpanded ? '▲ Collapse' : '▼ Show answer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const MCQReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { topicId } = route.params;

  const questions = getMCQsForTopic(topicId);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');

  const filteredQuestions = questions.filter((q) => {
    const userAns = SESSION_ANSWERS[q.id];
    if (filter === 'all') return true;
    if (filter === 'correct') return userAns === q.correctOption;
    if (filter === 'wrong') return userAns !== undefined && userAns !== q.correctOption;
    if (filter === 'unanswered') return userAns === undefined;
    return true;
  });

  const correctCount = questions.filter(
    (q) => SESSION_ANSWERS[q.id] === q.correctOption,
  ).length;
  const wrongCount = questions.filter(
    (q) => SESSION_ANSWERS[q.id] !== undefined && SESSION_ANSWERS[q.id] !== q.correctOption,
  ).length;
  const unansweredCount = questions.filter(
    (q) => SESSION_ANSWERS[q.id] === undefined,
  ).length;

  const topicLabel = {
    daily: 'Daily MCQ Challenge',
    quick: 'Quick 5-Test',
    gs1: 'GS Paper I',
    gs2: 'GS Paper II',
    csat: 'CSAT Reasoning',
  }[topicId] ?? 'Practice';

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{topicLabel}</Text>
          <Text style={styles.headerSubtitle}>Review Answers</Text>
        </View>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('PracticeHome')}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        {[
          { label: 'Correct', value: correctCount, color: colors.success },
          { label: 'Wrong', value: wrongCount, color: colors.error },
          { label: 'Skipped', value: unansweredCount, color: colors.warning },
        ].map((item) => (
          <View key={item.label} style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: item.color }]} />
            <Text style={styles.summaryValue}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
        <View style={[styles.summaryItem, styles.summaryAccuracy]}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {Math.round((correctCount / questions.length) * 100)}%
          </Text>
          <Text style={styles.summaryLabel}>Accuracy</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {([
            { key: 'all', label: `All (${questions.length})` },
            { key: 'correct', label: `Correct (${correctCount})` },
            { key: 'wrong', label: `Wrong (${wrongCount})` },
            { key: 'unanswered', label: `Skipped (${unansweredCount})` },
          ] as const).map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredQuestions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>No {filter} questions</Text>
            <Text style={styles.emptyBody}>
              {filter === 'correct' ? 'Great job! You got everything right.' :
                filter === 'wrong' ? 'No mistakes to review — keep it up!' :
                  'You answered every question. Nice work!'}
            </Text>
          </View>
        ) : (
          filteredQuestions.map((q, arrIdx) => {
            const origIndex = questions.indexOf(q);
            return (
              <ReviewQuestion
                key={q.id}
                question={q}
                index={origIndex}
                userAnswer={SESSION_ANSWERS[q.id]}
                isExpanded={expandedIndex === origIndex}
                onToggle={() =>
                  setExpandedIndex(expandedIndex === origIndex ? null : origIndex)
                }
              />
            );
          })
        )}

        {/* Study tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📝 Study Tip</Text>
          <Text style={styles.tipBody}>
            For each question you got wrong, spend 2 minutes identifying the concept gap.
            Open the related topic in the Learn tab and review the notes before attempting the next session.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <Button
          title={`Retry ${topicLabel}`}
          onPress={() => navigation.navigate('MCQPractice', { topicId })}
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
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  doneBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  doneBtnText: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceCard,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  summaryItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  summaryAccuracy: { alignItems: 'center' },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryValue: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  filterScroll: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  filterChipTextActive: { color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  questionNumBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questionNumText: {
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  questionMeta: { flex: 1 },
  questionTitle: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.xs,
  },
  questionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  yearText: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusIcon: {
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  detailSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  answerLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    width: 80,
  },
  answerChip: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  answerChipText: {
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
  explanationCard: {
    backgroundColor: 'rgba(99,102,241,0.07)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  explanationLabel: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  explanationText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: typography.caption * typography.normal,
  },
  allOptions: {
    gap: spacing.sm,
  },
  optionRow: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  optionText: {
    fontSize: typography.caption,
    lineHeight: typography.caption * typography.normal,
  },
  toggleRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  tipCard: {
    backgroundColor: 'rgba(99,102,241,0.07)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
    marginTop: spacing.sm,
  },
  tipTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipBody: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
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
