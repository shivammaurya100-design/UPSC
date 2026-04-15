import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';
import { apiGetEvaluations } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TOPIC_LABELS: Record<string, string> = {
  'gs1-heritage': 'GS I — Heritage',
  'gs2-constitution': 'GS II — Constitution',
  'gs3-economy': 'GS III — Economy',
  'gs4-ethics-basics': 'GS IV — Ethics',
  'essay-general': 'Essay',
};

interface EvalItem {
  id: string;
  topic_id: string;
  question: string;
  score: number;
  evaluated_at: string;
}

export const EvaluationHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<EvalItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EvalItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetEvaluations(page);
      if (res.success) {
        setItems(res.data);
        setTotal(res.total);
      }
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return colors.success;
    if (score >= 55) return colors.warning;
    return colors.error;
  };

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Evaluation History</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>No evaluations yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete an answer writing exercise to see your AI evaluation history here.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('AnswerWriting', { topicId: 'gs4-ethics-basics' })}
          >
            <Text style={styles.emptyBtnText}>Practice Answer Writing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.evalCard}
              onPress={() => setSelected(item)}
              activeOpacity={0.7}
            >
              <View style={styles.evalRow}>
                <View style={[styles.evalScore, { backgroundColor: `${getScoreColor(item.score)}20` }]}>
                  <Text style={[styles.evalScoreText, { color: getScoreColor(item.score) }]}>
                    {item.score}
                  </Text>
                  <Text style={styles.evalScoreMax}>/100</Text>
                </View>
                <View style={styles.evalInfo}>
                  <View style={styles.evalMeta}>
                    <Badge
                      label={TOPIC_LABELS[item.topic_id] ?? item.topic_id}
                      variant="primary"
                      size="sm"
                    />
                    <Text style={styles.evalDate}>
                      {new Date(item.evaluated_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.evalQuestion} numberOfLines={2}>
                    {item.question}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {total > 20 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <Text style={styles.pageBtnText}>← Prev</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}
              </Text>
              <TouchableOpacity
                style={[styles.pageBtn, page * 20 >= total && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => p + 1)}
                disabled={page * 20 >= total}
              >
                <Text style={styles.pageBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Detail Modal */}
      {selected && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Evaluation</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalScore}>
              <Text style={[styles.modalScoreNum, { color: getScoreColor(selected.score) }]}>
                {selected.score}
              </Text>
              <Text style={styles.modalScoreLabel}>/100</Text>
            </View>
            <Badge
              label={TOPIC_LABELS[selected.topic_id] ?? selected.topic_id}
              variant="primary"
              size="sm"
            />
            <Text style={styles.modalQuestion}>{selected.question}</Text>
            <Text style={styles.modalDate}>
              Evaluated on {new Date(selected.evaluated_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>
        </TouchableOpacity>
      )}
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.body * typography.normal,
    marginBottom: spacing.xl,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: typography.body,
    fontWeight: typography.semibold,
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  evalCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  evalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  evalScore: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 64,
  },
  evalScoreText: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
  },
  evalScoreMax: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  evalInfo: { flex: 1, gap: spacing.xs },
  evalMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  evalDate: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  evalQuestion: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: typography.caption * typography.normal,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  pageBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.md,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  pageInfo: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: typography.body,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  modalScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  modalScoreNum: {
    fontSize: 40,
    fontWeight: typography.bold,
  },
  modalScoreLabel: {
    fontSize: typography.h3,
    color: colors.textTertiary,
  },
  modalQuestion: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: typography.body * typography.normal,
  },
  modalDate: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
});