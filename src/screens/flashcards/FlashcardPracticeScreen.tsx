import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { extendedFlashcards } from '../../data/practiceData';
import {
  SRSession,
  SRRating,
  RATING_LABELS,
  calculateNextReview,
  isNew,
  isLearning,
  isMastered,
  logReview,
  recordProgress,
} from '../../services/flashcardService';
import { Flashcard } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'FlashcardPractice'>;

// Topic metadata
const TOPIC_META: Record<string, { title: string; icon: string; paper: string }> = {
  'gs1-heritage': { title: 'History & Heritage', icon: '🏛️', paper: 'GS I' },
  'gs2-constitution': { title: 'Indian Constitution', icon: '⚖️', paper: 'GS II' },
  'gs3-economy': { title: 'Indian Economy', icon: '📊', paper: 'GS III' },
  'gs3-environment': { title: 'Environment & Ecology', icon: '🌿', paper: 'GS III' },
  'gs4-ethics-basics': { title: 'Ethics & Integrity', icon: '🧠', paper: 'GS IV' },
  'csat-reasoning': { title: 'CSAT Reasoning', icon: '📐', paper: 'CSAT' },
};

// Rating button component
const RatingButton: React.FC<{
  rating: SRRating;
  onPress: (r: SRRating) => void;
  disabled: boolean;
}> = ({ rating, onPress, disabled }) => {
  const config = RATING_LABELS[rating];
  return (
    <TouchableOpacity
      style={[styles.ratingBtn, { borderColor: config.color }]}
      onPress={() => onPress(rating)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.ratingEmoji}>{config.emoji}</Text>
      <Text style={[styles.ratingLabel, { color: config.color }]}>{config.label}</Text>
      <Text style={styles.ratingDesc}>{config.description}</Text>
    </TouchableOpacity>
  );
};

// Flip card component
const FlipCard: React.FC<{
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}> = ({ card, isFlipped, onFlip }) => {
  const cardState = isNew(card) ? 'New' : isLearning(card) ? 'Learning' : isMastered(card) ? 'Mastered' : 'Review';

  return (
    <TouchableOpacity
      style={styles.flipCardOuter}
      onPress={onFlip}
      activeOpacity={0.95}
    >
      <View style={styles.flipCard}>
        {/* Front */}
        <View style={[styles.cardFace, styles.cardFront]}>
          <View style={styles.cardHeader}>
            <Badge label={cardState} variant={isNew(card) ? 'info' : isLearning(card) ? 'warning' : isMastered(card) ? 'success' : 'primary'} size="sm" />
            <Text style={styles.flipHint}>{isFlipped ? '' : 'Tap to reveal'}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.questionMark}>❓</Text>
            <Text style={styles.cardQuestion}>{card.front}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Remember: Think before flipping</Text>
          </View>
        </View>

        {/* Back (revealed) */}
        <View style={[styles.cardFace, styles.cardBack]}>
          <View style={styles.cardHeader}>
            <Badge label="Answer" variant="success" size="sm" />
            <Text style={styles.flipHint}>Answer revealed</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.answerMark}>💡</Text>
            <Text style={styles.cardAnswer}>{card.back}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>How well did you recall this?</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const FlashcardPracticeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { topicId } = route.params;

  const topicMeta = TOPIC_META[topicId] ?? { title: 'Flashcards', icon: '🃏', paper: '' };
  const allCards = extendedFlashcards.filter((f) => f.topicId === topicId);

  const [session, setSession] = useState<SRSession>(() => ({
    topicId,
    cards: allCards.slice(0, 10),
    currentIndex: 0,
    results: [],
    startedAt: new Date().toISOString(),
  }));
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const currentCard = session.cards[session.currentIndex];

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setShowRating(true);
    }
  };

  const handleRate = (rating: SRRating) => {
    if (!currentCard) return;

    // Update card with new SR values (applied via calculateNextReview)
    calculateNextReview(currentCard, rating);

    // Log the review
    logReview(currentCard, rating);

    // Move to next
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.cards.length) {
      // Session complete
      const correctCount = session.results.filter((r) => r.isCorrect).length;
      recordProgress(session.cards.length, session.results.filter((result) => result.isCorrect).length, correctCount + (rating >= 3 ? 1 : 0));
      setIsSessionComplete(true);
    } else {
      setSession((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        results: [...prev.results, { cardId: currentCard.id, rating, isCorrect: rating >= 3 }],
      }));
      setIsFlipped(false);
      setShowRating(false);
    }
  };

  const handleSkip = () => {
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.cards.length) {
      setIsSessionComplete(true);
    } else {
      setSession((prev) => ({ ...prev, currentIndex: nextIndex }));
      setIsFlipped(false);
      setShowRating(false);
    }
  };

  const handleRestart = () => {
    setSession((prev) => ({ ...prev, currentIndex: 0, results: [] }));
    setIsFlipped(false);
    setShowRating(false);
    setIsSessionComplete(false);
  };

  const progress = ((session.currentIndex) / session.cards.length) * 100;
  const correctCount = session.results.filter((r) => r.isCorrect).length;

  // Session complete screen
  if (isSessionComplete) {
    const totalReviewed = session.results.length + 1;
    const accuracy = Math.round((correctCount / totalReviewed) * 100);
    return (
      <ScreenWrapper edges={['top']}>
        <ScrollView contentContainerStyle={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Session Complete!</Text>
          <Text style={styles.completeSubtitle}>
            You reviewed {totalReviewed} cards from {topicMeta.title}
          </Text>

          {/* Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNum}>{accuracy}%</Text>
            <Text style={styles.scoreLabel}>Accuracy</Text>
            <View style={styles.scoreStatsRow}>
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatVal}>{correctCount}</Text>
                <Text style={styles.scoreStatLabel}>Correct</Text>
              </View>
              <View style={styles.scoreStatDivider} />
              <View style={styles.scoreStat}>
                <Text style={[styles.scoreStatVal, { color: colors.error }]}>
                  {totalReviewed - correctCount}
                </Text>
                <Text style={styles.scoreStatLabel}>Needs Work</Text>
              </View>
            </View>
          </View>

          {/* Next review info */}
          <View style={styles.nextReviewCard}>
            <Text style={styles.nextReviewTitle}>📅 Next Review</Text>
            <Text style={styles.nextReviewText}>
              {topicMeta.title} cards are scheduled based on your performance.
              New cards will appear again sooner; mastered cards will appear less frequently.
            </Text>
            <View style={styles.nextReviewStats}>
              <View style={styles.nextReviewStat}>
                <Text style={styles.nextReviewStatVal}>📚</Text>
                <Text style={styles.nextReviewStatLabel}>{totalReviewed} reviewed today</Text>
              </View>
              <View style={styles.nextReviewStat}>
                <Text style={styles.nextReviewStatVal}>🧠</Text>
                <Text style={styles.nextReviewStatLabel}>Keep it consistent!</Text>
              </View>
            </View>
          </View>

          <View style={styles.completeActions}>
            <TouchableOpacity
              style={styles.restartBtn}
              onPress={handleRestart}
            >
              <Text style={styles.restartBtnText}>🔁 Practice Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneBtnText}>← Back to Decks</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{topicMeta.icon} {topicMeta.title}</Text>
          <Text style={styles.headerSubtitle}>
            {session.currentIndex + 1} of {session.cards.length}
          </Text>
        </View>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>✓ {correctCount}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <ProgressBar progress={progress} height={4} style={styles.progress} />

      {/* Card */}
      {currentCard && (
        <View style={styles.cardContainer}>
          <FlipCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        </View>
      )}

      {/* Rating buttons (shown after flip) */}
      {showRating && isFlipped && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingPrompt}>How well did you recall this?</Text>
          <View style={styles.ratingRow}>
            {([1, 2, 3, 4, 5] as SRRating[]).map((rating) => (
              <RatingButton
                key={rating}
                rating={rating}
                onPress={handleRate}
                disabled={false}
              />
            ))}
          </View>
        </View>
      )}

      {/* Skip / Next */}
      {!showRating && (
        <View style={styles.skipContainer}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipBtnText}>Skip →</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
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
  progress: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    justifyContent: 'center',
  },
  flipCardOuter: {
    alignItems: 'center',
  },
  flipCard: {
    width: '100%',
    minHeight: 350,
  },
  cardFace: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 350,
    justifyContent: 'space-between',
    ...shadows.card,
  },
  cardFront: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardBack: {
    borderWidth: 2,
    borderColor: 'rgba(16,185,129,0.4)',
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  flipHint: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  questionMark: { fontSize: 48, marginBottom: spacing.lg },
  answerMark: { fontSize: 48, marginBottom: spacing.lg },
  cardQuestion: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: typography.h3 * typography.tight,
  },
  cardAnswer: {
    fontSize: typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: typography.body * typography.relaxed,
  },
  cardFooter: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardFooterText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  ratingContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ratingPrompt: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceCard,
    gap: spacing.xs,
  },
  ratingEmoji: { fontSize: 20 },
  ratingLabel: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
  },
  ratingDesc: {
    fontSize: 9,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  skipContainer: {
    padding: spacing.lg,
    alignItems: 'flex-end',
  },
  skipBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  skipBtnText: {
    color: colors.textTertiary,
    fontSize: typography.body,
  },
  // Completion screen
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60,
  },
  completeEmoji: { fontSize: 80, marginBottom: spacing.lg },
  completeTitle: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  completeSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  scoreCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    ...shadows.card,
  },
  scoreNum: {
    fontSize: 64,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  scoreLabel: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  scoreStatsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  scoreStat: { alignItems: 'center' },
  scoreStatDivider: { width: 1, backgroundColor: colors.border },
  scoreStatVal: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.success,
  },
  scoreStatLabel: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  nextReviewCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    ...shadows.card,
  },
  nextReviewTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  nextReviewText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.lg,
  },
  nextReviewStats: { gap: spacing.sm },
  nextReviewStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextReviewStatVal: { fontSize: 18 },
  nextReviewStatLabel: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  completeActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  restartBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  restartBtnText: {
    color: '#fff',
    fontWeight: typography.semibold,
  },
  doneBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  doneBtnText: {
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
});