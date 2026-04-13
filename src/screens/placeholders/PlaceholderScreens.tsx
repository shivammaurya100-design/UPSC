import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const PlaceholderScreen: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
}> = ({ icon, title, subtitle, features }) => (
  <ScreenWrapper edges={['top']}>
    <StatusBar barStyle="light-content" backgroundColor={colors.background} />
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.featuresCard}>
        <Text style={styles.featuresLabel}>Coming in Phase 2:</Text>
        {features.map((f, i) => (
          <View key={i} style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  </ScreenWrapper>
);

export const PracticeHomeScreen: React.FC = () => (
  <PlaceholderScreen
    icon="✍️"
    title="Practice Hub"
    subtitle="MCQ Bank, Answer Writing & AI Evaluation"
    features={[
      '50,000+ GS MCQs across all topics',
      'CSAT quantitative & reasoning practice',
      'Answer writing with AI evaluation (Claude)',
      'Daily quick test with streak tracking',
      'Peer review for mains answers',
    ]}
  />
);

export const TestsHomeScreen: React.FC = () => (
  <PlaceholderScreen
    icon="📝"
    title="Test Centre"
    subtitle="Sectional Tests & Full-Length Mocks"
    features={[
      'Sectional tests per topic',
      'Full-length GS I-IV mock tests',
      'All-India ranking system',
      'Detailed analytics & score breakdown',
      'Negative marking simulator',
    ]}
  />
);

export const CurrentAffairsHomeScreen: React.FC = () => (
  <PlaceholderScreen
    icon="📰"
    title="Current Affairs"
    subtitle="Daily Digest & Monthly Magazine"
    features={[
      'Daily news with UPSC lens',
      'PIB & newspaper summaries',
      'Static + current linkage',
      'Monthly Yojana/Kurukshetra compilations',
      'Current affairs MCQ quizzes',
    ]}
  />
);

export const ProfileHomeScreen: React.FC = () => (
  <PlaceholderScreen
    icon="👤"
    title="My Progress"
    subtitle="Statistics, Streak & Goal Setting"
    features={[
      'Syllabus completion tracker',
      'Performance graphs & trends',
      'Study streak & XP system',
      'Smart revision planner',
      'Goal setting & calendar',
    ]}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  icon: { fontSize: 64, marginBottom: spacing.lg },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  featuresCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    ...shadows.card,
  },
  featuresLabel: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureBullet: {
    fontSize: typography.body,
    color: colors.primary,
  },
  featureText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
});
