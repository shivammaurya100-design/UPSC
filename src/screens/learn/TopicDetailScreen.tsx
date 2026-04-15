import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionTab } from '../../components/ui/SectionTab';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { NoteCard } from '../../components/cards/NoteCard';
import { FlashcardPreview } from '../../components/cards/FlashcardPreview';
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList, Note, Flashcard, PYQ, MindMapNode } from '../../types';
import {
  getNotesForTopic,
  getFlashcardsForTopic,
  getPYQsForTopic,
  getMindMapForTopic,
  updateTopicProgress,
} from '../../services/contentService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'TopicDetail'>;

type TabKey = 'notes' | 'mindmap' | 'pyqs' | 'flashcards';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'notes', label: '📝 Notes' },
  { key: 'mindmap', label: '🗺️ Mind Map' },
  { key: 'pyqs', label: '📋 PYQs' },
  { key: 'flashcards', label: '🃏 Flashcards' },
];

// Simple recursive mind map renderer
const MindMapNodeView: React.FC<{
  node: MindMapNode;
  depth: number;
}> = ({ node, depth }) => (
  <View style={{ marginLeft: depth * 12, marginBottom: spacing.xs }}>
    <View style={styles.mindMapNode}>
      {node.isRoot && (
        <View style={styles.rootNodeInner}>
          <Text style={styles.rootNodeText}>{node.label}</Text>
        </View>
      )}
      {!node.isRoot && (
        <View style={styles.branchNode}>
          <View style={styles.branchDot} />
          <Text style={styles.branchNodeText}>{node.label}</Text>
        </View>
      )}
    </View>
    {node.children?.map((child) => (
      <MindMapNodeView key={child.id} node={child} depth={depth + 1} />
    ))}
  </View>
);

export const TopicDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { topic } = route.params;

  const [activeTab, setActiveTab] = useState<TabKey>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [mindMapRoot, setMindMapRoot] = useState<MindMapNode | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [localProgress, setLocalProgress] = useState(topic.progress);

  const loadContent = useCallback(async () => {
    const [n, f, p, mm] = await Promise.all([
      getNotesForTopic(topic.id),
      getFlashcardsForTopic(topic.id),
      getPYQsForTopic(topic.id),
      getMindMapForTopic(topic.id),
    ]);
    setNotes(n);
    setFlashcards(f);
    setPyqs(p);
    setMindMapRoot(mm?.root ?? null);
  }, [topic.id]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  }, [loadContent]);

  const markComplete = async () => {
    const newProgress = localProgress === 100 ? 0 : 100;
    setLocalProgress(newProgress);
    await updateTopicProgress(topic.id, newProgress);
  };

  const diffColors = {
    easy: 'success' as const,
    medium: 'warning' as const,
    hard: 'error' as const,
  };

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.paperLabel}>{topic.paper}</Text>
          <Text style={styles.topicTitle} numberOfLines={1}>
            {topic.title}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookmarkBtn, topic.isBookmarked && styles.bookmarkActive]}
        >
          <Text style={styles.bookmarkIcon}>
            {topic.isBookmarked ? '🔖' : '📑'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => navigation.navigate('DoubtAssistant', { topicId: topic.id })}
        >
          <Text style={styles.bookmarkIcon}>🤖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Topic overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <Badge
              label={topic.difficulty}
              variant={diffColors[topic.difficulty]}
            />
            <Text style={styles.overviewMinutes}>
              ⏱ {topic.estimatedMinutes} min
            </Text>
          </View>
          <Text style={styles.overviewDesc}>{topic.description}</Text>
          <View style={styles.subtopicsRow}>
            {topic.subtopics.map((s) => (
              <View key={s} style={styles.subtopicChip}>
                <Text style={styles.subtopicChipText}>{s}</Text>
              </View>
            ))}
          </View>
          <View style={styles.progressRow}>
            <ProgressBar progress={localProgress} height={6} showLabel />
          </View>
          <Button
            title={localProgress === 100 ? '✓ Marked Complete' : 'Mark Complete'}
            onPress={markComplete}
            variant={localProgress === 100 ? 'secondary' : 'primary'}
            fullWidth
            size="sm"
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Tab switcher */}
        <SectionTab
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as TabKey)}
          style={{ marginBottom: spacing.lg }}
        />

        {/* Tab Content */}
        {activeTab === 'notes' && (
          <View style={styles.tabContent}>
            {notes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyTitle}>No notes yet</Text>
                <Text style={styles.emptySubtitle}>
                  Notes for this topic will appear here
                </Text>
              </View>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  preview={note.content.slice(0, 120) + '...'}
                  tags={note.tags}
                  isBookmarked={false}
                  onPress={() => {}}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'mindmap' && (
          <View style={styles.tabContent}>
            {mindMapRoot ? (
              <View style={styles.mindMapContainer}>
                <Text style={styles.mindMapTitle}>🗺️ Concept Map</Text>
                <MindMapNodeView node={mindMapRoot} depth={0} />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🗺️</Text>
                <Text style={styles.emptyTitle}>No mind map available</Text>
                <Text style={styles.emptySubtitle}>
                  Mind map for this topic is being prepared
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'pyqs' && (
          <View style={styles.tabContent}>
            {pyqs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyTitle}>No PYQs found</Text>
                <Text style={styles.emptySubtitle}>
                  Previous year questions will appear here
                </Text>
              </View>
            ) : (
              pyqs.map((pyq) => (
                <View key={pyq.id} style={styles.pyqCard}>
                  <View style={styles.pyqHeader}>
                    <Badge
                      label={`${pyq.year} ${pyq.set}`}
                      variant="primary"
                      size="sm"
                    />
                    <Text style={styles.pyqSource}>{pyq.source}</Text>
                  </View>
                  <Text style={styles.pyqQuestion}>{pyq.question}</Text>
                  <View style={styles.pyqOptions}>
                    {pyq.options.map((opt, i) => (
                      <View
                        key={i}
                        style={[
                          styles.pyqOption,
                          i === pyq.correctOption && styles.pyqOptionCorrect,
                        ]}
                      >
                        <Text style={styles.pyqOptionLetter}>
                          {String.fromCharCode(65 + i)}.
                        </Text>
                        <Text
                          style={[
                            styles.pyqOptionText,
                            i === pyq.correctOption && styles.pyqOptionTextCorrect,
                          ]}
                        >
                          {opt}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationLabel}>💡 Explanation</Text>
                    <Text style={styles.explanationText}>{pyq.explanation}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'flashcards' && (
          <View style={styles.tabContent}>
            {flashcards.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🃏</Text>
                <Text style={styles.emptyTitle}>No flashcards yet</Text>
                <Text style={styles.emptySubtitle}>
                  Spaced-repetition flashcards coming soon
                </Text>
              </View>
            ) : (
              flashcards.map((card) => (
                <FlashcardPreview
                  key={card.id}
                  flashcard={card}
                  onPress={() => {}}
                />
              ))
            )}
          </View>
        )}

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
  headerText: { flex: 1 },
  paperLabel: {
    fontSize: typography.overline,
    color: colors.primary,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topicTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkActive: {
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  bookmarkIcon: { fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  overviewCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overviewMinutes: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  overviewDesc: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.md,
  },
  subtopicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  subtopicChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtopicChipText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  progressRow: { marginTop: spacing.sm },
  tabContent: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  mindMapContainer: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  mindMapTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  mindMapNode: {},
  rootNodeInner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  rootNodeText: {
    color: '#fff',
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  branchNode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  branchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
  },
  branchNodeText: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  pyqCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  pyqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pyqSource: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  pyqQuestion: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    lineHeight: typography.body * typography.normal,
    marginBottom: spacing.lg,
  },
  pyqOptions: { gap: spacing.sm, marginBottom: spacing.lg },
  pyqOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pyqOptionCorrect: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: colors.success,
  },
  pyqOptionLetter: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  pyqOptionText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  pyqOptionTextCorrect: {
    color: colors.success,
    fontWeight: typography.semibold,
  },
  explanationBox: {
    backgroundColor: 'rgba(99,102,241,0.08)',
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
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  bottomPadding: { height: 120 },
});
