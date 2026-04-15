import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { TopicCard } from '../../components/cards/TopicCard';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList, SyllabusCategory } from '../../types';
import {
  getTopics,
  getCategories,
  getOverallProgress,
} from '../../services/contentService';
import { Topic } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GS_PAPER_ORDER = ['GS I', 'GS II', 'GS III', 'GS IV', 'CSAT'] as const;

export const LearnHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState<{
    overallPercent: number;
    totalTopics: number;
    completedTopics: number;
    totalStudyMinutes: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    const [loadedTopics, progress] = await Promise.all([
      getTopics(),
      getOverallProgress(),
    ]);
    setTopics(loadedTopics);
    setProgressData(progress);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const categories = getCategories();

  // Group topics by GS paper
  const grouped: Record<string, Topic[]> = {};
  for (const topic of topics) {
    if (!grouped[topic.paper]) grouped[topic.paper] = [];
    grouped[topic.paper].push(topic);
  }

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.title}>UPSC Pathfinder</Text>
        </View>
        <TouchableOpacity
          style={styles.syllabusBtn}
          onPress={() => navigation.navigate('SyllabusBrowser')}
        >
          <Text style={styles.syllabusBtnText}>📋 Syllabus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.syllabusBtn}
          onPress={() => navigation.navigate('DoubtAssistant', {})}
        >
          <Text style={styles.syllabusBtnText}>🤖 Ask Doubt</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      {progressData && (
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progressData.overallPercent}%</Text>
              <Text style={styles.statLabel}>Overall</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progressData.completedTopics}/{progressData.totalTopics}</Text>
              <Text style={styles.statLabel}>Topics Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(progressData.totalStudyMinutes / 60)}h
              </Text>
              <Text style={styles.statLabel}>Study Time</Text>
            </View>
          </View>
          <ProgressBar
            progress={progressData.overallPercent}
            height={8}
            style={{ marginTop: spacing.md }}
          />
        </View>
      )}

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
        {/* GS Paper Sections */}
        {GS_PAPER_ORDER.map((paper) => {
          const paperTopics = grouped[paper];
          if (!paperTopics || paperTopics.length === 0) return null;

          return (
            <View key={paper} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{paper}</Text>
                <Text style={styles.sectionCount}>
                  {paperTopics.length} topics
                </Text>
              </View>

              <View style={styles.topicGrid}>
                {paperTopics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    id={topic.id}
                    title={topic.title}
                    category={topic.category}
                    subtopicCount={topic.subtopics.length}
                    progress={topic.progress}
                    difficulty={topic.difficulty}
                    estimatedMinutes={topic.estimatedMinutes}
                    onPress={() =>
                      navigation.navigate('TopicDetail', { topic })
                    }
                  />
                ))}
              </View>
            </View>
          );
        })}

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
  syllabusBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  syllabusBtnText: {
    fontSize: typography.caption,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  sectionCount: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  topicGrid: {
    gap: spacing.md,
  },
  bottomPadding: {
    height: 100,
  },
});
