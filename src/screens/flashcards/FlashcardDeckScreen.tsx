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
import { extendedFlashcards } from '../../data/practiceData';
import { computeDeckStats } from '../../services/flashcardService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Group flashcards by topic
const flashcardDecks = [
  {
    id: 'gs1-heritage',
    title: 'History & Heritage',
    icon: '🏛️',
    paper: 'GS I',
    cards: extendedFlashcards.filter((f) => f.topicId === 'gs1-heritage'),
  },
  {
    id: 'gs2-constitution',
    title: 'Indian Constitution',
    icon: '⚖️',
    paper: 'GS II',
    cards: extendedFlashcards.filter((f) => f.topicId === 'gs2-constitution'),
  },
  {
    id: 'gs3-economy',
    title: 'Indian Economy',
    icon: '📊',
    paper: 'GS III',
    cards: extendedFlashcards.filter((f) => f.topicId === 'gs3-economy'),
  },
  {
    id: 'gs3-environment',
    title: 'Environment & Ecology',
    icon: '🌿',
    paper: 'GS III',
    cards: extendedFlashcards.filter((f) => f.topicId === 'gs3-environment'),
  },
  {
    id: 'gs4-ethics-basics',
    title: 'Ethics & Integrity',
    icon: '🧠',
    paper: 'GS IV',
    cards: extendedFlashcards.filter((f) => f.topicId === 'gs4-ethics-basics'),
  },
  {
    id: 'csat-reasoning',
    title: 'CSAT Reasoning',
    icon: '📐',
    paper: 'CSAT',
    cards: extendedFlashcards.filter((f) => f.topicId === 'csat-reasoning'),
  },
];

// Stats bar at top
const OverallStats: React.FC<{ decks: typeof flashcardDecks }> = ({ decks }) => {
  const allCards = decks.flatMap((d) => d.cards);
  const stats = computeDeckStats(allCards);
  const progress = Math.round(((stats.learning + stats.mastered) / stats.total) * 100);

  return (
    <View style={styles.overallStats}>
      <View style={styles.overallStatsRow}>
        <View style={styles.overallStat}>
          <Text style={styles.overallStatValue}>{stats.dueToday}</Text>
          <Text style={styles.overallStatLabel}>Due Today</Text>
        </View>
        <View style={styles.overallStatDivider} />
        <View style={styles.overallStat}>
          <Text style={styles.overallStatValue}>{stats.total}</Text>
          <Text style={styles.overallStatLabel}>Total Cards</Text>
        </View>
        <View style={styles.overallStatDivider} />
        <View style={styles.overallStat}>
          <Text style={[styles.overallStatValue, { color: colors.success }]}>
            {stats.mastered}
          </Text>
          <Text style={styles.overallStatLabel}>Mastered</Text>
        </View>
        <View style={styles.overallStatDivider} />
        <View style={styles.overallStat}>
          <Text style={styles.overallStatValue}>{progress}%</Text>
          <Text style={styles.overallStatLabel}>Progress</Text>
        </View>
      </View>
      <ProgressBar progress={progress} height={6} style={{ marginTop: spacing.md }} />
    </View>
  );
};

// Individual deck card
const DeckCard: React.FC<{
  deck: typeof flashcardDecks[0];
  onPress: () => void;
}> = ({ deck, onPress }) => {
  const stats = computeDeckStats(deck.cards);

  return (
    <TouchableOpacity style={styles.deckCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.deckHeader}>
        <View style={styles.deckIcon}>
          <Text style={styles.deckIconText}>{deck.icon}</Text>
        </View>
        <View style={styles.deckInfo}>
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <View style={styles.deckMeta}>
            <Badge label={deck.paper} variant="primary" size="sm" />
            <Text style={styles.deckCardCount}>{deck.cards.length} cards</Text>
          </View>
        </View>
        <View style={styles.deckDue}>
          <Text style={styles.deckDueNum}>{stats.dueToday}</Text>
          <Text style={styles.deckDueLabel}>due</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.deckStatsRow}>
        {[
          { label: 'New', value: stats.new, color: colors.info },
          { label: 'Learning', value: stats.learning, color: colors.warning },
          { label: 'Mastered', value: stats.mastered, color: colors.success },
        ].map((item) => (
          <View key={item.label} style={styles.deckStat}>
            <View style={[styles.deckStatDot, { backgroundColor: item.color }]} />
            <Text style={styles.deckStatValue}>{item.value}</Text>
            <Text style={styles.deckStatLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Progress bar */}
      <ProgressBar
        progress={Math.round(((stats.learning + stats.mastered) / stats.total) * 100)}
        height={4}
        style={{ marginTop: spacing.sm }}
      />

      {stats.dueToday > 0 && (
        <View style={styles.deckStartHint}>
          <Text style={styles.deckStartHintText}>🎯 {stats.dueToday} cards due — start review</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const FlashcardDeckScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Flashcards 🃏</Text>
          <Text style={styles.title}>Spaced Repetition Decks</Text>
        </View>
        <TouchableOpacity style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 12 day streak</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <OverallStats decks={flashcardDecks} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.sectionTitle}>Your Decks</Text>

        {flashcardDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onPress={() => navigation.navigate('FlashcardPractice', { topicId: deck.id })}
          />
        ))}

        {/* How SR works */}
        <View style={styles.srInfoCard}>
          <Text style={styles.srInfoTitle}>🧠 How Spaced Repetition Works</Text>
          <Text style={styles.srInfoBody}>
            Based on the SM-2 algorithm. Cards you find easy appear less often; difficult cards appear more frequently. Consistent daily review maximizes retention with minimum effort.
          </Text>
          <View style={styles.srInfoRow}>
            {[
              { color: colors.info, label: 'New cards shown first' },
              { color: colors.warning, label: 'Learning cards daily' },
              { color: colors.success, label: 'Mastered → less often' },
            ].map((item) => (
              <View key={item.label} style={styles.srInfoItem}>
                <View style={[styles.srInfoDot, { backgroundColor: item.color }]} />
                <Text style={styles.srInfoText}>{item.label}</Text>
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
  overallStats: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  overallStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overallStat: { alignItems: 'center' },
  overallStatDivider: { width: 1, height: 30, backgroundColor: colors.border },
  overallStatValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  overallStatLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  deckCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  deckIconText: { fontSize: 22 },
  deckInfo: { flex: 1 },
  deckTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  deckMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deckCardCount: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  deckDue: {
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  deckDueNum: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.error,
  },
  deckDueLabel: {
    fontSize: typography.overline,
    color: colors.error,
  },
  deckStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  deckStat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  deckStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deckStatValue: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  deckStatLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  deckStartHint: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deckStartHintText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  srInfoCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
  },
  srInfoTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  srInfoBody: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.lg,
  },
  srInfoRow: { gap: spacing.sm },
  srInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  srInfoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  srInfoText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  bottomPadding: { height: 100 },
});