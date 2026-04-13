// Mock test screen — full-length GS paper tests
// Referenced in navigation as 'MockTest' screen

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'MockTest'>;

const PAPER_MCQS: Record<string, string[]> = {
  'full-prelims': [
    'mcq-hist-001', 'mcq-hist-002', 'mcq-poly-001', 'mcq-poly-002', 'mcq-eco-001',
    'mcq-eco-002', 'mcq-env-001', 'mcq-env-002', 'mcq-csat-001', 'mcq-csat-002',
    'mcq-st-001', 'mcq-eth-001', 'mcq-hist-003', 'mcq-poly-003', 'mcq-eco-003',
  ],
  'full-gs1': [
    'mcq-hist-001', 'mcq-hist-002', 'mcq-hist-003', 'mcq-hist-004', 'mcq-hist-005',
    'mcq-env-001', 'mcq-env-002', 'mcq-env-003',
  ],
  'full-gs2': [
    'mcq-poly-001', 'mcq-poly-002', 'mcq-poly-003', 'mcq-poly-004', 'mcq-poly-005',
    'mcq-st-001', 'mcq-st-002', 'mcq-eth-001', 'mcq-eth-002',
  ],
};

function getMCQsForTest(testId: string) {
  const ids = PAPER_MCQS[testId] ?? PAPER_MCQS['full-prelims'];
  return ids.map((id) => extendedMCQs.find((m) => m.id === id)!).filter(Boolean);
}

interface TestTimerProps {
  remainingSeconds: number;
}

const TestTimer: React.FC<TestTimerProps> = ({ remainingSeconds }) => {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const isLow = remainingSeconds < 300; // < 5 min warning

  return (
    <View style={[styles.timerBadge, isLow && styles.timerBadgeWarning]}>
      <Text style={[styles.timerText, isLow && styles.timerTextWarning]}>
        ⏱️ {mins}:{secs.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

const QuestionPalette: React.FC<{
  total: number;
  answered: Set<number>;
  flagged: Set<number>;
  current: number;
  onSelect: (i: number) => void;
}> = ({ total, answered, flagged, current, onSelect }) => (
  <View style={styles.palette}>
    <View style={styles.paletteLegend}>
      {[
        { color: colors.surfaceElevated, label: 'Not visited', border: colors.border },
        { color: 'rgba(99,102,241,0.2)', label: 'Current', border: colors.primary },
        { color: 'rgba(16,185,129,0.2)', label: 'Answered', border: colors.success },
        { color: 'rgba(245,158,11,0.2)', label: 'Flagged', border: colors.warning },
      ].map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color, borderWidth: 1, borderColor: item.border }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
    <View style={styles.paletteGrid}>
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === current;
        const isAnswered = answered.has(i);
        const isFlagged = flagged.has(i);

        let bg = colors.surfaceElevated;
        let border = colors.border;
        if (isCurrent) { bg = 'rgba(99,102,241,0.2)'; border = colors.primary; }
        else if (isAnswered) { bg = 'rgba(16,185,129,0.2)'; border = colors.success; }
        else if (isFlagged) { bg = 'rgba(245,158,11,0.2)'; border = colors.warning; }

        return (
          <TouchableOpacity
            key={i}
            style={[styles.paletteDot, { backgroundColor: bg, borderColor: border }]}
            onPress={() => onSelect(i)}
          >
            <Text style={[styles.paletteDotText, { color: border }]}>{i + 1}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export const MockTestScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { testId } = route.params;

  const questions = getMCQsForTest(testId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Map<number, number>>(new Map());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showPalette, setShowPalette] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer — 1 min per question as default, or 60 min for full test
  const DURATION_SECONDS = questions.length * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(DURATION_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      next.set(currentIndex, optionIndex);
      return next;
    });
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  const current = questions[currentIndex];
  const answered = new Set(selectedOptions.keys());
  const correctCount = questions.filter((q, i) => q.correctOption === selectedOptions.get(i)).length;
  const accuracy = Math.round((correctCount / questions.length) * 100);

  const flaggedCount = flagged.size;
  const unansweredCount = questions.length - answered.size;

  if (isSubmitted) {
    return (
      <ScreenWrapper edges={['top']}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>
            {accuracy >= 70 ? '🏆' : accuracy >= 50 ? '👍' : '📚'}
          </Text>
          <Text style={styles.resultTitle}>Test Complete!</Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{correctCount}/{questions.length}</Text>
            <Text style={styles.scoreLabel}>Correct</Text>
            <Text style={[styles.scoreAccuracy, { color: accuracy >= 70 ? colors.success : accuracy >= 50 ? colors.warning : colors.error }]}>
              {accuracy}% Accuracy
            </Text>
          </View>

          <View style={styles.resultBreakdown}>
            {[
              { label: 'Answered', value: answered.size, color: colors.success },
              { label: 'Wrong', value: answered.size - correctCount, color: colors.error },
              { label: 'Skipped', value: unansweredCount, color: colors.warning },
              { label: 'Flagged reviewed', value: flaggedCount, color: colors.info },
            ].map((item) => (
              <View key={item.label} style={styles.breakdownItem}>
                <Text style={[styles.breakdownValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.resultActions}>
            <Button
              title="Review Answers"
              onPress={() => navigation.navigate('MCQReview', { topicId: testId })}
              variant="primary"
            />
            <Button
              title="Back to Test Centre"
              onPress={() => navigation.navigate('TestsHome')}
              variant="ghost"
            />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <Text style={styles.progressText}>
            Q {currentIndex + 1}/{questions.length}
          </Text>
          <ProgressBar
            progress={((currentIndex + 1) / questions.length) * 100}
            height={4}
          />
        </View>
        <TestTimer remainingSeconds={remainingSeconds} />
        <TouchableOpacity
          style={styles.paletteBtn}
          onPress={() => setShowPalette(!showPalette)}
        >
          <Text style={styles.paletteBtnText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Question palette */}
      {showPalette && (
        <View style={styles.palettePanel}>
          <QuestionPalette
            total={questions.length}
            answered={answered}
            flagged={flagged}
            current={currentIndex}
            onSelect={(i) => { setCurrentIndex(i); setShowPalette(false); }}
          />
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Question card */}
        <View style={styles.questionCard}>
          <View style={styles.questionMeta}>
            {current?.source && (
              <Badge label={current.source} variant="neutral" size="sm" />
            )}
            {flagged.has(currentIndex) && (
              <Badge label="Flagged" variant="warning" size="sm" />
            )}
          </View>
          <Text style={styles.questionText}>{current?.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {current?.options.map((option, i) => {
            const isSelected = selectedOptions.get(currentIndex) === i;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.optionBtn,
                  isSelected && styles.optionBtnSelected,
                ]}
                onPress={() => handleSelectOption(i)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                  <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextSelected]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
                {isSelected && <Text style={styles.optionCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TouchableOpacity style={styles.flagBtn} onPress={toggleFlag}>
            <Text style={[styles.flagBtnText, flagged.has(currentIndex) && styles.flagBtnTextActive]}>
              🚩 {flagged.has(currentIndex) ? 'Unflag' : 'Flag for review'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRight}>
          <Button
            title="← Previous"
            onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            variant="ghost"
            size="sm"
            disabled={currentIndex === 0}
          />
          {currentIndex < questions.length - 1 ? (
            <Button
              title="Next →"
              onPress={() => setCurrentIndex((i) => i + 1)}
              variant="primary"
              size="sm"
            />
          ) : (
            <Button
              title="Submit Test"
              onPress={() =>
                Alert.alert(
                  'Submit Test?',
                  `You have ${unansweredCount} unanswered questions. ${flaggedCount > 0 ? `${flaggedCount} flagged. ` : ''}Are you sure you want to submit?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Submit', onPress: handleSubmit },
                  ],
                )
              }
              variant="primary"
              size="sm"
            />
          )}
        </View>
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
  progressWrapper: { flex: 1, gap: spacing.xs },
  progressText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  timerBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  timerBadgeWarning: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  timerText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  timerTextWarning: {
    color: colors.error,
  },
  paletteBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteBtnText: { fontSize: 18 },
  palettePanel: {
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  palette: {},
  paletteLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
  },
  legendText: {
    fontSize: typography.overline,
    color: colors.textSecondary,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  paletteDot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteDotText: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  questionCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  questionText: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    lineHeight: typography.body * typography.normal,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
    gap: spacing.md,
  },
  optionBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionLetterSelected: {
    backgroundColor: colors.primary,
  },
  optionLetterText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  optionLetterTextSelected: {
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: typography.bodySmall * typography.normal,
    paddingTop: 4,
  },
  optionCheck: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: typography.bold,
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
    gap: spacing.md,
  },
  footerLeft: { flex: 1 },
  footerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flagBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  flagBtnText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  flagBtnTextActive: {
    color: colors.warning,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.xl,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    ...shadows.card,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scoreAccuracy: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    marginTop: spacing.md,
  },
  resultBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  breakdownItem: { alignItems: 'center' },
  breakdownValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
  },
  breakdownLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  resultActions: {
    gap: spacing.md,
    width: '100%',
  },
});
