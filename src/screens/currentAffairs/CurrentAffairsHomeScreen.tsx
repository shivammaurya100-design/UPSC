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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock news articles
const TODAY_DIGEST = {
  date: 'April 13, 2026',
  label: "Today's Top Stories",
  readTime: '12 min read',
  source: 'UPSC Pathfinder Editorial',
};

const NEWS_ARTICLES = [
  {
    id: 'ca-001',
    title: 'India–EU Free Trade Agreement: Key Trade Barriers Removed After 7 Years of Negotiations',
    summary: 'India and the EU concluded the long-pending FTA after seven years of negotiations. The agreement covers goods, services, investment, and geographical indications. Key sectors affected include automobiles, pharmaceuticals, and agricultural exports.',
    source: 'The Hindu',
    publishedAt: '2 hours ago',
    linkedTopics: ['gs3-economy', 'gs2-governance'],
    tags: ['International Relations', 'Trade', 'Economy'],
    importance: 'high' as const,
    isBookmarked: false,
  },
  {
    id: 'ca-002',
    title: 'Supreme Court Landmark Ruling: Electoral Bonds Scheme Declared Unconstitutional',
    summary: 'A five-judge bench of the Supreme Court struck down the Electoral Bonds Scheme as violative of the right to information under Article 19(1)(a). The court directed the Election Commission to disclose all bond purchasers. Political funding reform implications discussed.',
    source: 'Indian Express',
    publishedAt: '4 hours ago',
    linkedTopics: ['gs2-constitution', 'gs2-governance'],
    tags: ['Polity', 'Supreme Court', 'Electoral Reform'],
    importance: 'high' as const,
    isBookmarked: false,
  },
  {
    id: 'ca-003',
    title: 'COP31 Host City Announced: Brazil to Host 2026 UN Climate Conference in Belém',
    summary: 'The UNFCCC announced that COP31 will be held in Belém, Brazil — located in the Amazon basin. This location choice emphasizes the critical role of Amazon deforestation in global climate negotiations. India reaffirmed its NDC targets at the pre-COP meeting.',
    source: 'PIB',
    publishedAt: '6 hours ago',
    linkedTopics: ['gs3-environment'],
    tags: ['Environment', 'Climate Change', 'International'],
    importance: 'high' as const,
    isBookmarked: true,
  },
  {
    id: 'ca-004',
    title: 'Gaganyaan Mission Update: ISRO Announces First Uncrewed Test by Q3 2026',
    summary: 'ISRO Chairman announced the first uncrewed test flight of the Gaganyaan mission is scheduled for Q3 2026. The mission aims to send Indian astronauts to space aboard the Gaganyaan orbital spacecraft, making India the fourth nation to send humans to space independently.',
    source: 'PIB',
    publishedAt: '8 hours ago',
    linkedTopics: ['gs3-scitech'],
    tags: ['Science & Technology', 'Space', 'ISRO'],
    importance: 'medium' as const,
    isBookmarked: false,
  },
  {
    id: 'ca-005',
    title: '53rd GST Council Meeting: Revisions to Tax Rates on Insurance Premiums & Renewable Energy',
    summary: 'The GST Council approved revised rates on life insurance premiums (18% cap) and simplified rates for renewable energy components. States voiced concerns over compensation cess shortfall. Revenue buoyancy and compliance improvements discussed.',
    source: 'Economic Times',
    publishedAt: '10 hours ago',
    linkedTopics: ['gs3-economy'],
    tags: ['Economy', 'GST', 'Finance'],
    importance: 'medium' as const,
    isBookmarked: false,
  },
  {
    id: 'ca-006',
    title: 'Bilateral Relations: India–Bangladesh Celebrate 50 Years of Diplomatic Ties',
    summary: 'India and Bangladesh marked 50 years of diplomatic relations with a grand celebration in Dhaka. Key achievements in connectivity, trade ($15B+), and people-to-people ties highlighted. Teesta river water sharing and border fencing remain outstanding issues.',
    source: 'The Hindu',
    publishedAt: 'Yesterday',
    linkedTopics: ['gs2-governance', 'gs3-economy'],
    tags: ['International Relations', 'Neighbourhood', 'Diplomacy'],
    importance: 'medium' as const,
    isBookmarked: false,
  },
  {
    id: 'ca-007',
    title: 'Digital India Report Card: Jan Dhan Accounts Reach 550 Million, UPI Transactions Hit Record',
    summary: 'The Digital India initiative achieved major milestones — Jan Dhan accounts reached 550 million with ₹2.1 lakh crore deposits, UPI transactions crossed 20 billion monthly, and DigiLocker crossed 150 million users. Financial inclusion implications for UPSC discussed.',
    source: 'PIB',
    publishedAt: 'Yesterday',
    linkedTopics: ['gs3-economy', 'gs3-scitech'],
    tags: ['Economy', 'Digital India', 'Finance Inclusion'],
    importance: 'low' as const,
    isBookmarked: false,
  },
  {
    id: 'ca-008',
    title: 'NITI Aayog Draft National Integration Index: Kerala Tops, Bihar Improves but Still Lowest',
    summary: 'NITI Aayog released the draft National Integration Index measuring social, economic, and infrastructure indicators across states. Kerala topped the list while Bihar showed improvement. Inter-state disparities in health, education, and infrastructure discussed.',
    source: 'The Hindu',
    publishedAt: '2 days ago',
    linkedTopics: ['gs3-economy', 'gs2-governance'],
    tags: ['Governance', 'Development', 'Federalism'],
    importance: 'low' as const,
    isBookmarked: false,
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '📋' },
  { key: 'polity', label: 'Polity', emoji: '⚖️' },
  { key: 'economy', label: 'Economy', emoji: '📊' },
  { key: 'env', label: 'Environment', emoji: '🌿' },
  { key: 'intl', label: 'International', emoji: '🌍' },
  { key: 'scitech', label: 'S&T', emoji: '🔬' },
  { key: 'ethics', label: 'Ethics', emoji: '🧠' },
];

const ArticleCard: React.FC<{
  article: typeof NEWS_ARTICLES[0];
  onPress: () => void;
  onBookmark: () => void;
}> = ({ article, onPress, onBookmark }) => {
  const importanceColor = {
    high: colors.error,
    medium: colors.warning,
    low: colors.textTertiary,
  }[article.importance];

  return (
    <TouchableOpacity style={styles.articleCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.articleHeader}>
        <View style={styles.articleMeta}>
          <Text style={styles.articleSource}>{article.source}</Text>
          <Text style={styles.articleDot}>•</Text>
          <Text style={styles.articleTime}>{article.publishedAt}</Text>
        </View>
        <TouchableOpacity onPress={onBookmark} style={styles.bookmarkBtn}>
          <Text style={styles.bookmarkIcon}>{article.isBookmarked ? '🔖' : '📑'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.articleSummary} numberOfLines={3}>
        {article.summary}
      </Text>

      <View style={styles.articleFooter}>
        <View style={styles.tagsRow}>
          {article.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: `${importanceColor}15` }]}>
              <Text style={[styles.tagText, { color: importanceColor }]}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.importanceDot, { backgroundColor: importanceColor }]} />
      </View>
    </TouchableOpacity>
  );
};

const DailyDigestBanner: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.digestBanner} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.digestLeft}>
      <View style={styles.digestIconWrap}>
        <Text style={styles.digestIcon}>📰</Text>
      </View>
      <View style={styles.digestInfo}>
        <Text style={styles.digestLabel}>Daily Digest</Text>
        <Text style={styles.digestTitle}>Today's Top 5 for UPSC</Text>
        <Text style={styles.digestMeta}>{TODAY_DIGEST.readTime} • {TODAY_DIGEST.date}</Text>
      </View>
    </View>
    <View style={styles.digestArrow}>
      <Text style={styles.digestArrowText}>→</Text>
    </View>
  </TouchableOpacity>
);

const YOJANA_CARDS = [
  { month: 'April 2026', title: 'Digital Banking Revolution', theme: 'Finance', cover: '🏦' },
  { month: 'March 2026', title: 'Urban Renewal Mission', theme: 'Governance', cover: '🏙️' },
  { month: 'February 2026', title: 'Agriculture Reforms', theme: 'Economy', cover: '🌾' },
];

export const CurrentAffairsHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(NEWS_ARTICLES.filter((a) => a.isBookmarked).map((a) => a.id)),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredArticles = NEWS_ARTICLES.filter((a) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'polity') return a.tags.some((t) => ['Polity', 'Supreme Court', 'Electoral Reform'].includes(t));
    if (selectedCategory === 'economy') return a.tags.some((t) => ['Economy', 'Finance', 'GST', 'Finance Inclusion', 'Digital India'].includes(t));
    if (selectedCategory === 'env') return a.tags.some((t) => ['Environment', 'Climate Change'].includes(t));
    if (selectedCategory === 'intl') return a.tags.some((t) => ['International Relations', 'Diplomacy', 'Neighbourhood'].includes(t));
    if (selectedCategory === 'scitech') return a.tags.some((t) => ['Science & Technology', 'Space'].includes(t));
    if (selectedCategory === 'ethics') return a.tags.some((t) => ['Governance', 'Development'].includes(t));
    return true;
  });

  const highPriority = filteredArticles.filter((a) => a.importance === 'high');
  const otherArticles = filteredArticles.filter((a) => a.importance !== 'high');

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Current Affairs 📰</Text>
          <Text style={styles.title}>Stay Updated for UPSC</Text>
        </View>
        <View style={styles.headerRight}>
          <Badge label="Live" variant="error" size="sm" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Daily Digest CTA */}
        <DailyDigestBanner onPress={() => {}} />

        {/* Today's Top Stories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{TODAY_DIGEST.label}</Text>
          <Text style={styles.sectionCount}>{highPriority.length} articles</Text>
        </View>

        {highPriority.map((article) => (
          <ArticleCard
            key={article.id}
            article={{ ...article, isBookmarked: bookmarks.has(article.id) }}
            onPress={() => navigation.navigate('ArticleDetail', { article: article as any })}
            onBookmark={() => toggleBookmark(article.id)}
          />
        ))}

        {/* Category filter */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Topic</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterChip, selectedCategory === cat.key && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={styles.filterChipEmoji}>{cat.emoji}</Text>
                <Text
                  style={[styles.filterChipText, selectedCategory === cat.key && styles.filterChipTextActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Other articles */}
        {otherArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={{ ...article, isBookmarked: bookmarks.has(article.id) }}
            onPress={() => navigation.navigate('ArticleDetail', { article: article as any })}
            onBookmark={() => toggleBookmark(article.id)}
          />
        ))}

        {/* Yojana/Kurukshetra section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Magazine Highlights</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.magazineRow}>
            {YOJANA_CARDS.map((mag) => (
              <View key={mag.month} style={styles.magazineCard}>
                <Text style={styles.magazineCover}>{mag.cover}</Text>
                <Text style={styles.magazineMonth}>{mag.month}</Text>
                <Text style={styles.magazineTitle}>{mag.title}</Text>
                <Badge label={mag.theme} variant="primary" size="sm" />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* PIB Summary widget */}
        <View style={styles.pibCard}>
          <View style={styles.pibHeader}>
            <Text style={styles.pibEmoji}>📄</Text>
            <Text style={styles.pibTitle}>PIB Summary — Last 7 Days</Text>
          </View>
          <Text style={styles.pibSummary}>
            47 press releases analysed. Key: GST rate changes, RBI monetary policy, ISRO updates, MoEF notifications.
          </Text>
          <View style={styles.pibTopics}>
            {['RBI Policy', 'GST Council', 'ISRO', 'Agriculture', 'Health'].map((t) => (
              <Badge key={t} label={t} variant="neutral" size="sm" />
            ))}
          </View>
          <Text style={styles.pibCta}>View Full PIB Digest →</Text>
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
  headerRight: { alignItems: 'flex-end' },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  digestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
  },
  digestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  digestIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digestIcon: { fontSize: 22 },
  digestInfo: { flex: 1 },
  digestLabel: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  digestTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  digestMeta: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  digestArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digestArrowText: {
    fontSize: 16,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
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
  articleCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  articleSource: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  articleDot: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  articleTime: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  bookmarkBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkIcon: { fontSize: 16 },
  articleTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    lineHeight: typography.body * typography.normal,
    marginBottom: spacing.sm,
  },
  articleSummary: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.md,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.overline,
    fontWeight: typography.medium,
  },
  importanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipEmoji: { fontSize: 14 },
  filterChipText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  filterChipTextActive: { color: '#fff' },
  magazineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  magazineCard: {
    width: 160,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  magazineCover: { fontSize: 36, marginBottom: spacing.sm },
  magazineMonth: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  magazineTitle: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  pibCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    ...shadows.card,
  },
  pibHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pibEmoji: { fontSize: 20 },
  pibTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  pibSummary: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.md,
  },
  pibTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pibCta: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  bottomPadding: { height: 100 },
});
