import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { mockCommunityPosts, mockStudyGroups } from '../../data/practiceData';
import { CommunityPost, PostType } from '../../types/practice';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const POST_TYPE_CONFIG: Record<PostType, { label: string; color: string; bg: string; icon: string }> = {
  discussion: { label: 'Discussion', color: colors.primary, bg: 'rgba(99,102,241,0.12)', icon: '💬' },
  doubt: { label: 'Doubt', color: colors.warning, bg: 'rgba(245,158,11,0.12)', icon: '❓' },
  strategy: { label: 'Strategy', color: colors.success, bg: 'rgba(16,185,129,0.12)', icon: '📊' },
  motivation: { label: 'Motivation', color: '#A855F7', bg: 'rgba(168,85,247,0.12)', icon: '🔥' },
};

const PostCard: React.FC<{ post: CommunityPost; onPress: () => void }> = ({ post, onPress }) => {
  const config = POST_TYPE_CONFIG[post.type];
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={[styles.typeTag, { backgroundColor: config.bg }]}>
          <Text style={styles.typeIcon}>{config.icon}</Text>
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
        </View>
        {post.isPinned && <Badge label="📌 Pinned" variant="warning" size="sm" />}
        {post.isAnswered && <Badge label="✓ Answered" variant="success" size="sm" />}
      </View>

      {/* Title */}
      <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>

      {/* Body preview */}
      <Text style={styles.postBody} numberOfLines={3}>{post.body}</Text>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {post.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
        {post.paper && (
          <View style={styles.paperTag}>
            <Text style={styles.paperTagText}>{post.paper}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.postFooter}>
        <Text style={styles.authorText}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          · {timeAgo}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>▲ {post.upvotes}</Text>
          <Text style={styles.statItem}>💬 {post.comments}</Text>
          <Text style={styles.statItem}>👁 {post.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<PostType | 'all'>('all');

  const tabs: Array<{ key: PostType | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'doubt', label: 'Doubt' },
    { key: 'discussion', label: 'Discussion' },
    { key: 'motivation', label: 'Motivation' },
  ];

  const filteredPosts = activeTab === 'all'
    ? mockCommunityPosts
    : mockCommunityPosts.filter((p) => p.type === activeTab);

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Community 👥</Text>
          <Text style={styles.title}>Connect & Grow Together</Text>
        </View>
        <TouchableOpacity style={styles.askBtn}>
          <Text style={styles.askBtnText}>+ Ask</Text>
        </TouchableOpacity>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabRow}>
            {tabs.map((tab) => (
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
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pinned posts */}
        {activeTab === 'all' && (
          <View style={styles.pinnedSection}>
            <Text style={styles.pinnedLabel}>📌 Pinned</Text>
            {mockCommunityPosts
              .filter((p) => p.isPinned)
              .map((post) => (
                <PostCard key={post.id} post={post} onPress={() => {}} />
              ))}
            <Text style={styles.sectionTitle}>Recent Posts</Text>
          </View>
        )}

        {/* Posts */}
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} onPress={() => {}} />
        ))}

        {/* Study Groups */}
        {activeTab === 'all' && (
          <>
            <Text style={styles.sectionTitle}>📚 Study Groups</Text>
            {mockStudyGroups.map((group) => (
              <TouchableOpacity key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.isJoined && (
                    <Badge label="Joined ✓" variant="success" size="sm" />
                  )}
                </View>
                <Text style={styles.groupDesc}>{group.description}</Text>
                <View style={styles.groupFooter}>
                  <Text style={styles.groupMembers}>👥 {group.members.toLocaleString()} members</Text>
                  <Badge label={group.category} variant="neutral" size="sm" />
                </View>
                {!group.isJoined && (
                  <TouchableOpacity style={styles.joinBtn}>
                    <Text style={styles.joinBtnText}>Join Group</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

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
  askBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  askBtnText: {
    color: '#fff',
    fontWeight: typography.semibold,
    fontSize: typography.bodySmall,
  },
  tabBar: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  tabTextActive: { color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  pinnedSection: { marginBottom: spacing.md },
  pinnedLabel: {
    fontSize: typography.caption,
    color: colors.warning,
    fontWeight: typography.semibold,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  postCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeIcon: { fontSize: 12 },
  typeLabel: {
    fontSize: typography.overline,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
  },
  postTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    lineHeight: typography.body * typography.tight,
    marginBottom: spacing.sm,
  },
  postBody: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tagChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.overline,
    color: colors.primary,
  },
  paperTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: borderRadius.sm,
  },
  paperTagText: {
    fontSize: typography.overline,
    color: colors.primary,
    fontWeight: typography.bold,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  authorName: {
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  groupCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  groupName: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  groupDesc: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.bodySmall * typography.normal,
  },
  groupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupMembers: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  joinBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  joinBtnText: {
    color: colors.primary,
    fontWeight: typography.semibold,
    fontSize: typography.bodySmall,
  },
  bottomPadding: { height: 100 },
});