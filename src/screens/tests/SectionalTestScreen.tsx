import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { extendedMCQs } from '../../data/practiceData';
import { mockTestResult } from '../../data/practiceData';
import { TestAnalytics } from '../../types/practice';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'SectionalTest'>;

const TEST_MCQS = extendedMCQs.slice(0, 10).map((m) => ({
  id: m.id,
  question: m.question,
  options: m.options,
  correctOption: m.correctOption,
  explanation: m.explanation,
  selectedOption: null as number | null,
  isAnswered: false,
  isMarked: false,
}));

export const SectionalTestScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { testId } = route.params;

  const [questions, setQuestions] = useState(TEST_MCQS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 10); // 10 min
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, number>>(new Map());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft < 60 ? colors.error : colors.textPrimary;

  const handleSelect = (optIdx: number) => {
    const q = questions[currentIndex];
    setQuestions((prev) =>
      prev.map((item, i) =>
        i === currentIndex ? { ...item, selectedOption: optIdx, isAnswered: true } : item,
      ),
    );
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      next.set(q.id, optIdx);
      return next;
    });
  };

  const handleToggleMark = () => {
    setQuestions((prev) =>
      prev.map((item, i) =>
        i === currentIndex ? { ...item, isMarked: !item.isMarked } : item,
      ),
    );
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleReview = () => {
    setIsSubmitted(true);
    setShowExplanation(true);
    setCurrentIndex(0);
  };

  const handleExit = () => {
    Alert.alert('Exit Test?', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  // Result screen
  if (isSubmitted) {
    const analytics = mockTestResult.analytics;
    const answeredCount = Array.from(selectedOptions.values()).length;
    const correctCount = questions.filter((q) => selectedOptions.get(q.id) === q.correctOption).length;

    return (
      <ScreenWrapper edges={['top']}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={styles.resultTitle}>Test Complete!</Text>

          {/* Score circle */}
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreCircleNum}>{correctCount}</Text>
            <Text style={styles.scoreCircleDen}>/{questions.length}</Text>
          </View>
          <Text style={styles.scorePct}>
            {Math.round((correctCount / questions.length) * 100)}% Score
          </Text>

          {/* Breakdown */}
          <View style={styles.breakdownRow}>
            {[
              { label: 'Attempted', value: answeredCount, color: colors.info },
              { label: 'Correct', value: correctCount, color: colors.success },
              { label: 'Incorrect', value: answeredCount - correctCount, color: colors.error },
              { label: 'Skipped', value: questions.length - answeredCount, color: colors.textTertiary },
            ].map((item) => (
              <View key={item.label} style={styles.breakdownItem}>
                <Text style={[styles.breakdownValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Topic-wise */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>📊 Topic-wise Analysis</Text>
            {Object.entries(analytics.topicWiseScore).map(([topic, data]) => (
              <View key={topic} style={styles.analyticsRow}>
                <Text style={styles.analyticsTopic}>{topic}</Text>
                <View style={styles.analyticsBar}>
                  <ProgressBar
                    progress={(data.correct / data.total) * 100}
                    height={6}
                    color={data.correct / data.total >= 0.6 ? colors.success : colors.warning}
                  />
                </View>
                <Text style={styles.analyticsScore}>
                  {data.correct}/{data.total}
                </Text>
              </View>
            ))}
          </View>

          {/* Weak areas */}
          <View style={styles.weakAreasCard}>
            <Text style={styles.weakAreasTitle}>📌 Improvement Areas</Text>
            {analytics.improvementAreas.map((area) => (
              <View key={area} style={styles.weakAreaItem}>
                <Text style={styles.weakAreaBullet}>•</Text>
                <Text style={styles.weakAreaText}>{area}</Text>
              </View>
            ))}
          </View>

          <View style={styles.resultActions}>
            <Button title="Review Answers" onPress={handleReview} variant="secondary" />
            <Button title="Back to Tests" onPress={() => navigation.goBack()} variant="ghost" />
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // Test in progress
  const current = questions[currentIndex];
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const markedCount = questions.filter((q) => q.isMarked).length;

  return (
    <ScreenWrapper edges={['top']}>
      {/* Timer bar */}
      <View style={styles.timerBar}>
        <TouchableOpacity onPress={handleExit}>
          <Text style={styles.exitText}>✕ Exit</Text>
        </TouchableOpacity>
        <View style={styles.timerCenter}>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <ProgressBar
            progress={(timeLeft / 600) * 100}
            height={4}
            color={timeLeft < 60 ? colors.error : colors.primary}
            trackColor={colors.progressTrack}
            style={{ width: 120 }}
          />
        </View>
        <View style={styles.statusPills}>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{answeredCount}/{questions.length}</Text>
          </View>
          {markedCount > 0 && (
            <View style={[styles.statusPill, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Text style={[styles.statusPillText, { color: colors.warning }]}>⚑ {markedCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Question palette */}
      <View style={styles.palette}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.paletteRow}>
            {questions.map((q, i) => {
              let bg = colors.surfaceCard;
              let border = colors.border;
              if (q.isAnswered) { bg = 'rgba(99,102,241,0.2)'; border = colors.primary; }
              if (q.isMarked) { bg = 'rgba(245,158,11,0.15)'; border = colors.warning; }
              if (i === currentIndex) { border = colors.primaryLight; }
              return (
                <TouchableOpacity
                  key={q.id}
                  style={[styles.paletteItem, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => setCurrentIndex(i)}
                >
                  <Text style={[
                    styles.paletteNum,
                    i === currentIndex && { color: colors.primaryLight },
                  ]}>
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Question */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Badge label={`Q${currentIndex + 1}`} variant="primary" size="sm" />
            <TouchableOpacity onPress={handleToggleMark}>
              <Text style={styles.markBtn}>{current.isMarked ? '⚑ Marked' : '⚑ Mark for review'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.questionText}>{current.question}</Text>
        </View>

        {/* Options */}
        {current.options.map((opt, i) => {
          const isSelected = current.selectedOption === i;
          let bg = colors.surfaceCard;
          let border = colors.border;
          if (isSelected) { bg = 'rgba(99,102,241,0.12)'; border = colors.primary; }
          if (showExplanation && i === current.correctOption) {
            bg = 'rgba(16,185,129,0.12)';
            border = colors.success;
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(i)}
              disabled={showExplanation}
            >
              <View style={[styles.optionLetter, isSelected && styles.optionLetterActive]}>
                <Text style={styles.optionLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>
              {showExplanation && i === current.correctOption && (
                <Text style={styles.correctMark}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Explanation */}
        {showExplanation && current.explanation && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>💡 Explanation</Text>
            <Text style={styles.explanationText}>{current.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}>← Prev</Text>
        </TouchableOpacity>
        <View style={styles.footerCenter}>
          {answeredCount === questions.length ? (
            <Button title="Submit Test" onPress={handleSubmit} variant="primary" size="sm" />
          ) : (
            <Text style={styles.footerHint}>{answeredCount} of {questions.length} answered</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={currentIndex === questions.length - 1}
        >
          <Text style={[styles.navBtn, currentIndex === questions.length - 1 && styles.navBtnDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-between',
  },
  exitText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  timerCenter: { alignItems: 'center', gap: spacing.xs },
  timerText: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    fontVariant: ['tabular-nums'],
  },
  statusPills: { flexDirection: 'row', gap: spacing.sm },
  statusPill: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusPillText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  palette: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  paletteRow: { flexDirection: 'row', gap: spacing.sm },
  paletteItem: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteNum: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  questionCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markBtn: {
    fontSize: typography.caption,
    color: colors.warning,
  },
  questionText: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    lineHeight: typography.body * typography.normal,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionLetterActive: { backgroundColor: colors.primary },
  optionLetterText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: typography.bodySmall * typography.normal,
    paddingTop: 4,
  },
  correctMark: {
    fontSize: 16,
    color: colors.success,
    fontWeight: typography.bold,
  },
  explanationCard: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: spacing.md,
  },
  explanationLabel: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  explanationText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navBtn: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: typography.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navBtnDisabled: { color: colors.textTertiary },
  footerCenter: { flex: 1, alignItems: 'center' },
  footerHint: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  resultContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  resultEmoji: { fontSize: 64, marginBottom: spacing.md },
  resultTitle: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  scoreCircleNum: {
    fontSize: 56,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  scoreCircleDen: {
    fontSize: typography.h2,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  scorePct: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  breakdownItem: { alignItems: 'center' },
  breakdownValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  breakdownLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  analyticsCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  analyticsTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  analyticsTopic: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    width: 80,
  },
  analyticsBar: { flex: 1 },
  analyticsScore: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
    width: 30,
    textAlign: 'right',
  },
  weakAreasCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  weakAreasTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  weakAreaItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  weakAreaBullet: {
    fontSize: typography.bodySmall,
    color: colors.warning,
  },
  weakAreaText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  resultActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});