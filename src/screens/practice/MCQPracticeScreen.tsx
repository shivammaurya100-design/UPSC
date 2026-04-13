import React, { useState } from 'react';
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
import { MCQ } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'MCQPractice'>;

const QUICK_MCQ_IDS = ['mcq-csat-001', 'mcq-csat-002', 'mcq-hist-001', 'mcq-eco-001', 'mcq-env-001'];
const DAILY_MCQ_IDS = ['mcq-hist-001', 'mcq-poly-001', 'mcq-eco-001', 'mcq-csat-001', 'mcq-env-001', 'mcq-st-001', 'mcq-eth-001', 'mcq-hist-002', 'mcq-poly-002', 'mcq-eco-002'];
const GS1_IDS = ['mcq-hist-001', 'mcq-hist-002', 'mcq-hist-003', 'mcq-hist-004', 'mcq-hist-005', 'mcq-env-001', 'mcq-env-002', 'mcq-env-003'];
const GS2_IDS = ['mcq-poly-001', 'mcq-poly-002', 'mcq-poly-003', 'mcq-poly-004', 'mcq-poly-005', 'mcq-st-001', 'mcq-st-002'];
const CSAT_IDS = ['mcq-csat-001', 'mcq-csat-002', 'mcq-csat-003', 'mcq-csat-004', 'mcq-csat-005'];

function getMCQsForTopic(topicId: string): MCQ[] {
  const idMap: Record<string, string[]> = {
    daily: DAILY_MCQ_IDS,
    quick: QUICK_MCQ_IDS,
    gs1: GS1_IDS,
    gs2: GS2_IDS,
    csat: CSAT_IDS,
  };
  const ids = idMap[topicId] ?? QUICK_MCQ_IDS;
  return ids.map((id) => extendedMCQs.find((m) => m.id === id)!).filter(Boolean);
}

function OptionButton({
  option,
  index,
  letter,
  isSelected,
  isCorrect,
  showResult,
  onPress,
}: {
  option: string;
  index: number;
  letter: string;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
  onPress: () => void;
}) {
  let bgColor = colors.surfaceCard;
  let borderColor = colors.border;
  let textColor = colors.textPrimary;
  let icon = null;

  if (showResult) {
    if (isCorrect) {
      bgColor = 'rgba(16,185,129,0.12)';
      borderColor = colors.success;
      icon = '✓';
    } else if (isSelected && !isCorrect) {
      bgColor = 'rgba(239,68,68,0.12)';
      borderColor = colors.error;
      icon = '✗';
    }
  } else if (isSelected) {
    bgColor = 'rgba(99,102,241,0.15)';
    borderColor = colors.primary;
  }

  return (
    <TouchableOpacity
      style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      disabled={showResult}
      activeOpacity={0.7}
    >
      <View style={[styles.optionLetter, isSelected && !showResult && styles.optionLetterActive]}>
        <Text style={[styles.optionLetterText, (isSelected || (showResult && isCorrect)) && styles.optionLetterTextActive]}>
          {showResult && icon ? icon : letter}
        </Text>
      </View>
      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
    </TouchableOpacity>
  );
}

export const MCQPracticeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { topicId } = route.params;

  const questions = getMCQsForTopic(topicId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Map<number, number>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const current = questions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (showResults) return;
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      next.set(currentIndex, optionIndex);
      return next;
    });
  };

  const handleCheck = () => {
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setShowResults(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = () => {
    const correct = questions.filter((q, i) => q.correctOption === selectedOptions.get(i)).length;
    const total = questions.length;
    const accuracy = Math.round((correct / total) * 100);
    Alert.alert(
      'Test Complete! 🎉',
      `Score: ${correct}/${total} (${accuracy}%)`,
      [
        { text: 'Review Answers', onPress: () => { setCurrentIndex(0); setShowResults(true); } },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ],
    );
  };

  const selectedOption = selectedOptions.get(currentIndex);

  // Score summary
  const correctCount = questions.filter((q, i) => q.correctOption === selectedOptions.get(i)).length;

  if (isFinished) {
    return (
      <ScreenWrapper edges={['top']}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🎯</Text>
          <Text style={styles.resultTitle}>Test Complete!</Text>
          <Text style={styles.resultScore}>
            {correctCount}/{questions.length}
          </Text>
          <Text style={styles.resultAccuracy}>
            Accuracy: {Math.round((correctCount / questions.length) * 100)}%
          </Text>
          <View style={styles.resultActions}>
            <Button
              title="Review Answers"
              onPress={() => { setCurrentIndex(0); setShowResults(true); setIsFinished(false); }}
              variant="secondary"
            />
            <Button
              title="Done"
              onPress={() => navigation.goBack()}
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
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>{correctCount} ✓</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{current?.question}</Text>
          {current?.source && (
            <View style={styles.sourceRow}>
              <Badge label={current.source} variant="neutral" size="sm" />
              {current.year && (
                <Text style={styles.yearText}>{current.year}</Text>
              )}
            </View>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {current?.options.map((option, i) => (
            <OptionButton
              key={i}
              option={option}
              index={i}
              letter={String.fromCharCode(65 + i)}
              isSelected={selectedOption === i}
              isCorrect={i === current.correctOption}
              showResult={showResults}
              onPress={() => handleSelectOption(i)}
            />
          ))}
        </View>

        {/* Explanation (shown after check) */}
        {showResults && current?.explanation && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>💡 Explanation</Text>
            <Text style={styles.explanationText}>{current.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        {!showResults ? (
          <Button
            title="Check Answer"
            onPress={handleCheck}
            disabled={selectedOption === undefined}
            fullWidth
          />
        ) : (
          <Button
            title={currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Test →'}
            onPress={currentIndex < questions.length - 1 ? handleNext : handleFinish}
            fullWidth
          />
        )}
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
  scoreChip: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  scoreChipText: {
    fontSize: typography.caption,
    color: colors.success,
    fontWeight: typography.semibold,
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
    ...shadows.card,
  },
  questionText: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    lineHeight: typography.body * typography.normal,
    marginBottom: spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  yearText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    gap: spacing.md,
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
  optionLetterActive: {
    backgroundColor: colors.primary,
  },
  optionLetterText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  optionLetterTextActive: { color: '#fff' },
  optionText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmall * typography.normal,
    paddingTop: 4,
  },
  explanationCard: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.lg,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  resultAccuracy: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  resultActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});