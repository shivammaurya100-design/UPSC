import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList, Topic, GSPaper } from '../../types';
import { getTopicsByPaper, getCategoryMeta } from '../../services/contentService';
import { allSyllabusNodes, flattenSyllabus } from '../../services/contentService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'TopicList'>;

interface SubTopicItemProps {
  id: string;
  title: string;
  isCompleted: boolean;
  depth: number;
  onPress: (id: string, title: string) => void;
}

const SubTopicItem: React.FC<SubTopicItemProps> = ({
  title,
  isCompleted,
  depth,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.subTopicItem, { marginLeft: depth * 16 }]}
    onPress={() => onPress(title, title)}
    activeOpacity={0.7}
  >
    <View style={[styles.checkbox, isCompleted && styles.checkboxDone]}>
      {isCompleted && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text
      style={[styles.subTopicTitle, isCompleted && styles.subTopicDone]}
      numberOfLines={2}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export const TopicListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, paper } = route.params;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const loadTopics = useCallback(async () => {
    const data = await getTopicsByPaper(paper);
    setTopics(data);
    // Seed completed IDs from existing progress
    const completed = new Set(
      data.filter((t) => t.progress === 100).map((t) => t.id),
    );
    setCompletedIds(completed);
  }, [paper]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  }, [loadTopics]);

  const categoryMeta = getCategoryMeta(category);
  const flatNodes = flattenSyllabus(allSyllabusNodes);
  const subNodes = flatNodes.filter(
    (n) => n.depth === 1 && n.paper === paper,
  );

  const handleSubTopicPress = (id: string, title: string) => {
    const topic = topics.find(
      (t) => t.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]),
    );
    if (topic) {
      navigation.navigate('TopicDetail', { topic });
    }
  };

  // Calculate paper-level progress
  const paperProgress = Math.round(
    topics.length > 0
      ? topics.reduce((s, t) => s + t.progress, 0) / topics.length
      : 0,
  );

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
          <Text style={styles.paperBadge}>{paper}</Text>
          <Text style={styles.categoryLabel}>{categoryMeta?.label}</Text>
        </View>
        <Text style={styles.headerIcon}>{categoryMeta?.icon}</Text>
      </View>

      {/* Progress card */}
      <View style={styles.progressCard}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Paper Progress</Text>
          <Text style={styles.progressValue}>{paperProgress}%</Text>
        </View>
        <ProgressBar progress={paperProgress} height={8} />
      </View>

      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          subNodes.length > 0 ? (
            <View style={styles.syllabusSection}>
              <Text style={styles.sectionLabel}>📋 Syllabus Breakdown</Text>
              {subNodes.map((node) => (
                <SubTopicItem
                  key={node.id}
                  id={node.id}
                  title={node.title}
                  isCompleted={node.isCompleted}
                  depth={node.depth}
                  onPress={handleSubTopicPress}
                />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const diffColors = {
            easy: 'success' as const,
            medium: 'warning' as const,
            hard: 'error' as const,
          };
          return (
            <TouchableOpacity
              style={styles.topicItem}
              onPress={() => navigation.navigate('TopicDetail', { topic: item })}
              activeOpacity={0.7}
            >
              <View style={styles.topicItemLeft}>
                <Text style={styles.topicTitle}>{item.title}</Text>
                <View style={styles.topicMeta}>
                  <Badge
                    label={item.difficulty}
                    variant={diffColors[item.difficulty]}
                    size="sm"
                  />
                  <Text style={styles.topicSubCount}>
                    {item.subtopics.length} subtopics
                  </Text>
                  <Text style={styles.topicMinutes}>
                    {item.estimatedMinutes} min
                  </Text>
                </View>
              </View>
              <View style={styles.topicItemRight}>
                <Text style={styles.progressPct}>{item.progress}%</Text>
                <ProgressBar progress={item.progress} height={4} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No topics yet</Text>
            <Text style={styles.emptySubtitle}>
              Pull to refresh and load topics
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
      />
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
  backBtnText: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerText: {
    flex: 1,
  },
  paperBadge: {
    fontSize: typography.overline,
    color: colors.primary,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryLabel: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerIcon: {
    fontSize: 24,
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  syllabusSection: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  subTopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: typography.bold,
  },
  subTopicTitle: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  subTopicDone: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  topicItem: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.card,
  },
  topicItemLeft: {
    flex: 1,
    marginRight: spacing.lg,
  },
  topicTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  topicSubCount: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  topicMinutes: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  topicItemRight: {
    width: 80,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  progressPct: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
  },
  listFooter: {
    height: 40,
  },
});
