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
import { mockTestResult } from '../../data/practiceData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PaperBadge: Record<string, { color: string; bg: string }> = {
  'GS I': { color: colors.primary, bg: 'rgba(99,102,241,0.12)' },
  'GS II': { color: colors.info, bg: 'rgba(59,130,246,0.12)' },
  'GS III': { color: colors.success, bg: 'rgba(16,185,129,0.12)' },
  'GS IV': { color: colors.warning, bg: 'rgba(245,158,11,0.12)' },
  CSAT: { color: colors.error, bg: 'rgba(239,68,68,0.12)' },
  Essay: { color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
};

export const TestsHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const testSeries = [
    {
      id: 'sec-gs1',
      icon: '📝',
      title: 'GS Paper I — Sectional Tests',
      subtitle: '30 questions · 60 min',
      count: 8,
      completedCount: 3,
      papers: ['GS I'],
      badge: 'Sectional',
      badgeColor: 'info',
      onPress: () => navigation.navigate('SectionalTest', { testId: 'sec-gs1' }),
    },
    {
      id: 'sec-gs2',
      icon: '⚖️',
      title: 'GS Paper II — Sectional Tests',
      subtitle: '30 questions · 60 min',
      count: 8,
      completedCount: 1,
      papers: ['GS II'],
      badge: 'Sectional',
      badgeColor: 'info',
      onPress: () => navigation.navigate('SectionalTest', { testId: 'sec-gs2' }),
    },
    {
      id: 'full-prelims',
      icon: '🏆',
      title: 'Prelims Full-Length Mock',
      subtitle: '100 Q (GS + CSAT) · 120 min',
      count: 5,
      completedCount: 0,
      papers: ['GS I', 'CSAT'],
      badge: 'Mock',
      badgeColor: 'primary',
      onPress: () => navigation.navigate('MockTest', { testId: 'full-prelims' }),
    },
    {
      id: 'full-gs1',
      icon: '📖',
      title: 'GS Paper I — Full Mock',
      subtitle: '20 questions · 120 min',
      count: 10,
      completedCount: 2,
      papers: ['GS I'],
      badge: 'Mock',
      badgeColor: 'primary',
      onPress: () => navigation.navigate('MockTest', { testId: 'full-gs1' }),
    },
    {
      id: 'custom-builder',
      icon: '🛠️',
      title: 'Custom Test Builder',
      subtitle: 'Create your own test from question pool',
      count: 0,
      completedCount: 0,
      papers: ['Custom'],
      badge: 'Custom',
      badgeColor: 'neutral',
      onPress: () => {},
    },
  ];

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Test Centre 📝</Text>
          <Text style={styles.title}>Ready for the real test?</Text>
        </View>
        <View style={styles.rankBadge}>
          <Text style={styles.rankNum}>#1,245</Text>
          <Text style={styles.rankLabel}>All-India</Text>
        </View>
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          {[
            { label: 'Tests Taken', value: '12', icon: '✅' },
            { label: 'Avg Score', value: '73%', icon: '📊' },
            { label: 'Percentile', value: '78th', icon: '📈' },
            { label: 'Time Left', value: '8 days', icon: '⏰' },
          ].map((s, i) => (
            <View key={i} style={styles.statGridItem}>
              <Text style={styles.statGridIcon}>{s.icon}</Text>
              <Text style={styles.statGridValue}>{s.value}</Text>
              <Text style={styles.statGridLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Last result */}
      <TouchableOpacity style={styles.lastResultCard} onPress={() => {}}>
        <View style={styles.lastResultLeft}>
          <Text style={styles.lastResultLabel}>Last Result</Text>
          <Text style={styles.lastResultTitle}>{mockTestResult.title}</Text>
          <View style={styles.lastResultMeta}>
            <Badge label={`Rank #${mockTestResult.rank}`} variant="success" size="sm" />
            <Text style={styles.lastResultScore}>
              Score: {mockTestResult.finalScore}/{mockTestResult.maxScore}
            </Text>
          </View>
        </View>
        <View style={styles.lastResultRight}>
          <Text style={styles.lastResultPct}>{Math.round((mockTestResult.finalScore / mockTestResult.maxScore) * 100)}%</Text>
          <Text style={styles.lastResultTime}>{mockTestResult.timeTaken}</Text>
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.sectionTitle}>Test Series</Text>

        {testSeries.map((test) => {
          const progress = test.count > 0 ? (test.completedCount / test.count) * 100 : 0;
          return (
            <TouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={test.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.testCardLeft}>
                <Text style={styles.testIcon}>{test.icon}</Text>
              </View>
              <View style={styles.testCardContent}>
                <View style={styles.testCardHeader}>
                  <Text style={styles.testTitle}>{test.title}</Text>
                  <Badge label={test.badge} variant={test.badgeColor as any} size="sm" />
                </View>
                <Text style={styles.testSubtitle}>{test.subtitle}</Text>
                <View style={styles.testMeta}>
                  <View style={styles.paperTags}>
                    {test.papers.map((p) => {
                      const style = PaperBadge[p] ?? PaperBadge['GS I'];
                      return (
                        <View key={p} style={[styles.paperTag, { backgroundColor: style.bg }]}>
                          <Text style={[styles.paperTagText, { color: style.color }]}>{p}</Text>
                        </View>
                      );
                    })}
                  </View>
                  {test.count > 0 && (
                    <Text style={styles.testCount}>{test.completedCount}/{test.count}</Text>
                  )}
                </View>
                {test.count > 0 && (
                  <ProgressBar
                    progress={progress}
                    height={3}
                    style={{ marginTop: spacing.sm }}
                  />
                )}
              </View>
              <Text style={styles.testArrow}>→</Text>
            </TouchableOpacity>
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
  rankBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rankNum: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  rankLabel: {
    fontSize: typography.overline,
    color: colors.textSecondary,
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statGridItem: { alignItems: 'center' },
  statGridIcon: { fontSize: 20, marginBottom: spacing.xs },
  statGridValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statGridLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  lastResultCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lastResultLeft: { flex: 1 },
  lastResultLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  lastResultTitle: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  lastResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lastResultScore: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  lastResultRight: { alignItems: 'flex-end' },
  lastResultPct: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  lastResultTime: {
    fontSize: typography.caption,
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
  testCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  testCardLeft: {
    width: 44,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  testIcon: { fontSize: 28 },
  testCardContent: { flex: 1 },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  testTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  testSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paperTags: { flexDirection: 'row', gap: spacing.xs },
  paperTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  paperTagText: {
    fontSize: typography.overline,
    fontWeight: typography.bold,
  },
  testCount: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  testArrow: {
    fontSize: 18,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
  bottomPadding: { height: 100 },
});