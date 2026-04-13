import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList, SyllabusNode } from '../../types';
import { getSyllabusTree, toggleSyllabusNode } from '../../services/contentService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PAPER_COLORS: Record<string, string> = {
  'GS I': colors.primary,
  'GS II': colors.info,
  'GS III': colors.success,
  'GS IV': colors.warning,
  CSAT: colors.error,
};

const PAPER_ICONS: Record<string, string> = {
  'GS I': '🏛️',
  'GS II': '⚖️',
  'GS III': '📊',
  'GS IV': '🧠',
  CSAT: '📐',
};

interface TreeNodeProps {
  node: SyllabusNode;
  onToggle: (id: string) => void;
  onExpand: (id: string) => void;
  expandedIds: Set<string>;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onToggle,
  onExpand,
  expandedIds,
  depth,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const paperColor = PAPER_COLORS[node.paper] ?? colors.primary;

  return (
    <View>
      <TouchableOpacity
        style={[styles.treeNode, { marginLeft: depth * 16 }]}
        onPress={() => hasChildren && onExpand(node.id)}
        activeOpacity={hasChildren ? 0.7 : 1}
      >
        {/* Expand/collapse arrow */}
        <View style={styles.expandArrow}>
          {hasChildren ? (
            <Text style={styles.expandArrowText}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          ) : (
            <View style={styles.expandPlaceholder} />
          )}
        </View>

        {/* Completion checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, node.isCompleted && styles.checkboxDone]}
          onPress={() => onToggle(node.id)}
        >
          {node.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Node content */}
        <View style={styles.nodeContent}>
          <Text
            style={[styles.nodeTitle, node.isCompleted && styles.nodeTitleDone]}
            numberOfLines={2}
          >
            {node.title}
          </Text>
          <View style={[styles.paperTag, { backgroundColor: `${paperColor}20` }]}>
            <Text style={[styles.paperTagText, { color: paperColor }]}>
              {node.paper}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Children */}
      {hasChildren &&
        isExpanded &&
        node.children!.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            onToggle={onToggle}
            onExpand={onExpand}
            expandedIds={expandedIds}
            depth={depth + 1}
          />
        ))}
    </View>
  );
};

export const SyllabusBrowserScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [syllabusNodes, setSyllabusNodes] = useState<SyllabusNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const nodes = await getSyllabusTree();
    setSyllabusNodes(nodes);
    // Expand all top-level nodes by default
    const topLevelIds = new Set(nodes.map((n) => n.id));
    setExpandedIds(topLevelIds);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleSyllabusNode(id);
      // Update local state
      const updated = await getSyllabusTree();
      setSyllabusNodes(updated);
    } catch (e) {
      // Silently fail on toggle
    }
  };

  // Stats
  const allNodes = syllabusNodes.flatMap((n) => [n, ...(n.children ?? [])]);
  const completedCount = allNodes.filter((n) => n.isCompleted).length;
  const totalCount = allNodes.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
        <View>
          <Text style={styles.headerTitle}>📋 NPS Syllabus</Text>
          <Text style={styles.headerSubtitle}>Full coverage tracker</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedCount}/{totalCount}</Text>
          <Text style={styles.statLabel}>Nodes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {completionPct}%
          </Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {PAPER_ICONS['GS I']} {PAPER_ICONS['GS II']} {PAPER_ICONS['GS III']} {PAPER_ICONS['GS IV']}
          </Text>
          <Text style={styles.statLabel}>Papers</Text>
        </View>
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
        {syllabusNodes.map((node) => (
          <View key={node.id} style={styles.rootNode}>
            <TreeNode
              node={node}
              onToggle={handleToggle}
              onExpand={handleExpand}
              expandedIds={expandedIds}
              depth={0}
            />
          </View>
        ))}
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
  headerTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.card,
  },
  stat: { alignItems: 'center' },
  statValue: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  rootNode: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  treeNode: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  expandArrow: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  expandArrowText: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  expandPlaceholder: {
    width: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: typography.bold,
  },
  nodeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nodeTitle: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  nodeTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  paperTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  paperTagText: {
    fontSize: typography.overline,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
  },
  bottomPadding: { height: 120 },
});
