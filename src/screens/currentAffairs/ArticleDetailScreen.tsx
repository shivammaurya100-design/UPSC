import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'ArticleDetail'>;

const UPSC_LENS: Record<string, { relevance: string; angle: string; keywords: string[] }> = {
  default: {
    relevance: 'Medium relevance for UPSC Prelims + Mains',
    angle: 'Focus on constitutional, legal, and governance dimensions.',
    keywords: ['Constitutional provision', 'Supreme Court judgment', 'Parliamentary debate'],
  },
};

const LINKED_QUESTIONS = [
  {
    id: 'q-001',
    question: 'Discuss the constitutional validity of the Electoral Bonds scheme. How does it impact political funding transparency?',
    paper: 'GS II',
    marks: 12,
  },
  {
    id: 'q-002',
    question: 'What are the implications of unlimited corporate funding on electoral democracy? Analyse in light of recent judicial pronouncements.',
    paper: 'GS II',
    marks: 15,
  },
];

export const ArticleDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { article } = route.params;

  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked ?? false);
  const [activeTab, setActiveTab] = useState<'article' | 'upsc' | 'questions'>('article');

  const handleShare = () => {
    Share.share({ message: `${article.title}\n\nRead more on UPSC Pathfinder` });
  };

  const lens = UPSC_LENS.default;

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{article.source}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setIsBookmarked(!isBookmarked)}>
            <Text style={styles.actionIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {([
          { key: 'article', label: 'Article' },
          { key: 'upsc', label: 'UPSC Lens' },
          { key: 'questions', label: 'PYQs' },
        ] as const).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tags */}
        <View style={styles.tagsRow}>
          {article.tags.map((tag) => (
            <Badge key={tag} label={tag} variant="primary" size="sm" />
          ))}
          <Badge
            label={article.importance === 'high' ? 'High Priority' : article.importance === 'medium' ? 'Medium' : 'Reference'}
            variant={article.importance === 'high' ? 'error' : 'warning'}
            size="sm"
          />
        </View>

        {/* Title */}
        <Text style={styles.articleTitle}>{article.title}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaSource}>{article.source}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaTime}>{article.publishedAt}</Text>
        </View>

        {/* Content */}
        {activeTab === 'article' && (
          <>
            <View style={styles.articleBody}>
              <Text style={styles.articleText}>{article.summary}</Text>
              <Text style={styles.articleText}>
                {article.summary.split('.')[0]}. This development comes at a crucial juncture when the government is pursuing its reform agenda across multiple sectors. Legal experts have welcomed the move, while opposition parties have raised concerns about potential implementation challenges.
              </Text>
              <Text style={styles.articleText}>
                The broader implications extend to India's international standing and its commitments under various multilateral frameworks. Industry stakeholders have expressed mixed reactions, with some welcoming the clarity and others seeking further consultations.
              </Text>
              <Text style={styles.articleText}>
                Key stakeholders involved include the central government ministries, state governments, regulatory authorities, and affected industry groups. The implementation timeline and procedural details are expected to be finalized in the coming weeks through executive orders and legislative amendments.
              </Text>
            </View>

            {/* Linked static topics */}
            <View style={styles.relatedTopicsCard}>
              <Text style={styles.relatedTitle}>📚 Linked Static Topics</Text>
              {article.linkedTopics.map((topicId) => {
                const topicMap: Record<string, string> = {
                  'gs2-constitution': 'Indian Constitution — Articles & Amendments',
                  'gs2-governance': 'Governance — Bureaucracy & Reform',
                  'gs3-economy': 'Indian Economy — Growth & Development',
                  'gs3-environment': 'Environment & Ecology',
                  'gs3-scitech': 'Science & Technology',
                  'gs4-ethics-basics': 'Ethics — Integrity & Aptitude',
                };
                return (
                  <TouchableOpacity key={topicId} style={styles.relatedItem}>
                    <Text style={styles.relatedItemText}>{topicMap[topicId] ?? topicId}</Text>
                    <Text style={styles.relatedArrow}>→</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* UPSC Lens */}
        {activeTab === 'upsc' && (
          <View style={styles.upscLens}>
            <View style={styles.relevanceCard}>
              <Text style={styles.relevanceTitle}>🎯 Relevance for UPSC</Text>
              <Text style={styles.relevanceText}>{lens.relevance}</Text>
            </View>

            <View style={styles.angleCard}>
              <Text style={styles.angleTitle}>📝 UPSC Angle</Text>
              <Text style={styles.angleText}>{lens.angle}</Text>
            </View>

            <View style={styles.keywordsCard}>
              <Text style={styles.keywordsTitle}>Key Points to Remember</Text>
              <View style={styles.keywordsList}>
                {lens.keywords.map((kw, i) => (
                  <View key={i} style={styles.keywordRow}>
                    <View style={[styles.keywordDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.keywordText}>{kw}</Text>
                  </View>
                ))}
                <View style={styles.keywordRow}>
                  <View style={[styles.keywordDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.keywordText}>Likely to appear in GS II (Polity & Governance)</Text>
                </View>
                <View style={styles.keywordRow}>
                  <View style={[styles.keywordDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.keywordText}>Previous year: Similar topic appeared in UPSC CSE 2022 Mains</Text>
                </View>
              </View>
            </View>

            {/* MCQ Practice */}
            <View style={styles.mcqCard}>
              <Text style={styles.mcqTitle}>📋 Related MCQ</Text>
              <Text style={styles.mcqQuestion}>
                Which of the following statements regarding political funding reforms in India is correct?
              </Text>
              <View style={styles.mcqOptions}>
                {[
                  'Electoral Bonds have been upheld by the Supreme Court as constitutional',
                  'The RTI Act mandates disclosure of political donation sources',
                  'Companies can now make unlimited donations to political parties',
                  'State funding of elections is the only constitutionally valid method',
                ].map((opt, i) => (
                  <View key={i} style={styles.mcqOption}>
                    <View style={styles.mcqOptionLetter}>
                      <Text style={styles.mcqOptionLetterText}>{String.fromCharCode(65 + i)}</Text>
                    </View>
                    <Text style={styles.mcqOptionText}>{opt}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* PYQs */}
        {activeTab === 'questions' && (
          <View style={styles.pyqsSection}>
            <Text style={styles.pyqsIntro}>
              Previous year questions related to this topic from UPSC CSE Mains:
            </Text>
            {LINKED_QUESTIONS.map((q) => (
              <View key={q.id} style={styles.pyqCard}>
                <View style={styles.pyqHeader}>
                  <Badge label={q.paper} variant="primary" size="sm" />
                  <Text style={styles.pyqMarks}>{q.marks} marks</Text>
                </View>
                <Text style={styles.pyqText}>{q.question}</Text>
                <TouchableOpacity style={styles.pyqAction}>
                  <Text style={styles.pyqActionText}>📝 Write Answer →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="📝 Practice Related MCQs"
          onPress={() => navigation.navigate('MCQPractice', { topicId: 'gs2' })}
          variant="primary"
          fullWidth
        />
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
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 16 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  articleTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    lineHeight: typography.h3 * typography.normal,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metaSource: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  metaDot: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
  },
  metaTime: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
  },
  articleBody: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  articleText: {
    fontSize: typography.body,
    color: colors.textPrimary,
    lineHeight: typography.body * typography.normal,
  },
  relatedTopicsCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  relatedTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  relatedItemText: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.medium,
    flex: 1,
  },
  relatedArrow: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
  },
  upscLens: {
    gap: spacing.md,
  },
  relevanceCard: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  relevanceTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  relevanceText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  angleCard: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  angleTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  angleText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  keywordsCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  keywordsTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  keywordsList: {
    gap: spacing.sm,
  },
  keywordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  keywordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  keywordText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    flex: 1,
  },
  mcqCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  mcqTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  mcqQuestion: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.md,
  },
  mcqOptions: {
    gap: spacing.sm,
  },
  mcqOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  mcqOptionLetter: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mcqOptionLetterText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  mcqOptionText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: typography.caption * typography.normal,
  },
  pyqsSection: {
    gap: spacing.md,
  },
  pyqsIntro: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
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
  pyqMarks: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  pyqText: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    lineHeight: typography.body * typography.normal,
    marginBottom: spacing.md,
  },
  pyqAction: {
    alignItems: 'flex-end',
  },
  pyqActionText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
