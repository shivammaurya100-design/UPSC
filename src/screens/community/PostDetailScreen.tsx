// Community post detail screen — full post with comments and actions

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { mockCommunityPosts } from '../../data/practiceData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PostDetail'>;

const MOCK_COMMENTS = [
  {
    id: 'c-001',
    author: 'Priya S.',
    avatar: 'PS',
    body: 'This is exactly what I needed. The insight about linking static topics with current affairs from day 1 changed my entire preparation strategy.',
    upvotes: 24,
    createdAt: '2 hours ago',
    isTop: false,
  },
  {
    id: 'c-002',
    author: 'Rahul V.',
    avatar: 'RV',
    body: 'Great breakdown. Would love a follow-up on how to manage time between static and current affairs during the last 3 months before prelims.',
    upvotes: 18,
    createdAt: '4 hours ago',
    isTop: false,
  },
  {
    id: 'c-003',
    author: 'AIR 201 — Gautam K.',
    avatar: 'GK',
    body: 'From my experience: focus on Previous Year Questions as your primary revision tool. They\'re your best indicator of what UPSC actually tests vs. what you think is important.',
    upvotes: 67,
    createdAt: 'Yesterday',
    isTop: true,
  },
  {
    id: 'c-004',
    author: 'Ananya R.',
    avatar: 'AR',
    body: 'Could you share your answer writing framework? Specifically how you structure GS II answers for governance-related questions.',
    upvotes: 12,
    createdAt: 'Yesterday',
    isTop: false,
  },
];

const POST = mockCommunityPosts[0];

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [comment, setComment] = useState('');
  const [upvotedComments, setUpvotedComments] = useState<Set<string>>(new Set());

  const toggleUpvote = (commentId: string) => {
    setUpvotedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>↗️</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Post card */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.authorRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{POST.authorName.charAt(0)}</Text>
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{POST.authorName}</Text>
                  <Text style={styles.postTime}>{POST.createdAt}</Text>
                </View>
              </View>
              <View style={styles.postMeta}>
                <Badge
                  label={POST.type}
                  variant={POST.type === 'strategy' ? 'primary' : 'info'}
                  size="sm"
                />
                {POST.isPinned && <Badge label="📌 Pinned" variant="warning" size="sm" />}
              </View>
            </View>

            <Text style={styles.postTitle}>{POST.title}</Text>

            <Text style={styles.postBody}>{POST.body}</Text>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {POST.tags.map((tag) => (
                <Badge key={tag} label={`#${tag}`} variant="neutral" size="sm" />
              ))}
            </View>

            {/* Engagement stats */}
            <View style={styles.engagementRow}>
              <TouchableOpacity style={styles.engageItem}>
                <Text style={styles.engageIcon}>⬆️</Text>
                <Text style={styles.engageValue}>{POST.upvotes}</Text>
              </TouchableOpacity>
              <View style={styles.engageItem}>
                <Text style={styles.engageIcon}>💬</Text>
                <Text style={styles.engageValue}>{POST.comments}</Text>
              </View>
              <View style={styles.engageItem}>
                <Text style={styles.engageIcon}>👁️</Text>
                <Text style={styles.engageValue}>{POST.views.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Comments section */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>💬 {MOCK_COMMENTS.length} Comments</Text>
            <TouchableOpacity>
              <Text style={styles.sortBtn}>Sort: Top ↑</Text>
            </TouchableOpacity>
          </View>

          {MOCK_COMMENTS.map((c) => (
            <View key={c.id} style={[styles.commentCard, c.isTop && styles.commentCardTop]}>
              {c.isTop && (
                <View style={styles.topBadge}>
                  <Text style={styles.topBadgeText}>🏆 Top Comment</Text>
                </View>
              )}
              <View style={styles.commentHeader}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>{c.avatar}</Text>
                </View>
                <View style={styles.commentInfo}>
                  <Text style={styles.commentAuthor}>{c.author}</Text>
                  <Text style={styles.commentTime}>{c.createdAt}</Text>
                </View>
              </View>
              <Text style={styles.commentBody}>{c.body}</Text>
              <View style={styles.commentActions}>
                <TouchableOpacity
                  style={styles.upvoteBtn}
                  onPress={() => toggleUpvote(c.id)}
                >
                  <Text style={[styles.upvoteIcon, upvotedComments.has(c.id) && styles.upvoteIconActive]}>
                    ⬆️
                  </Text>
                  <Text style={[styles.upvoteCount, upvotedComments.has(c.id) && styles.upvoteCountActive]}>
                    {c.upvotes + (upvotedComments.has(c.id) ? 1 : 0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.replyBtn}>
                  <Text style={styles.replyBtnText}>💬 Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Comment input */}
        <View style={styles.commentInputBar}>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your thoughts..."
            placeholderTextColor={colors.textTertiary}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, comment.length === 0 && styles.sendBtnDisabled]}
            disabled={comment.length === 0}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: { fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  postCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: '#fff',
  },
  authorInfo: {},
  authorName: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  postTime: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  postMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  postTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: typography.h3 * typography.normal,
  },
  postBody: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: typography.body * typography.normal,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  engageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  engageIcon: { fontSize: 14 },
  engageValue: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  commentsTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  sortBtn: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  commentCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  commentCardTop: {
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  topBadge: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  topBadgeText: {
    fontSize: typography.overline,
    color: colors.primary,
    fontWeight: typography.bold,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  commentInfo: {},
  commentAuthor: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  commentTime: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  commentBody: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
    marginBottom: spacing.sm,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
  },
  upvoteIcon: { fontSize: 14 },
  upvoteIconActive: { opacity: 1 },
  upvoteCount: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  upvoteCountActive: {
    color: colors.primary,
  },
  replyBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  replyBtnText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  bottomPadding: { height: 80 },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  sendBtnText: { fontSize: 16, color: '#fff' },
});
