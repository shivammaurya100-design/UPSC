import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { AIAnswerEvaluation } from '../../types/practice';
import { apiEvaluateAnswer } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'AnswerWriting'>;

const TOPICS = [
  { id: 'gs1-heritage', title: 'Indian Heritage & Culture', paper: 'GS I' },
  { id: 'gs2-constitution', title: 'Indian Constitution', paper: 'GS II' },
  { id: 'gs3-economy', title: 'Indian Economy', paper: 'GS III' },
  { id: 'gs4-ethics-basics', title: 'Ethics & Integrity', paper: 'GS IV' },
  { id: 'essay-general', title: 'General Essay', paper: 'Essay' },
];

const QUESTIONS: Record<string, { question: string; wordLimit: number; hint: string }> = {
  'gs1-heritage': {
    question: 'Trace the evolution of Indian nationalism from the late 19th century to independence, highlighting the role of different social reform movements.',
    wordLimit: 250,
    hint: 'Cover: Raja Ram Mohan Roy, Swami Vivekananda, Annie Besant, Moderates vs Extremists, Lucknow Pact, Non-Cooperation, Quit India',
  },
  'gs2-constitution': {
    question: 'Critically examine the impact of the 73rd and 74th Constitutional Amendment Acts on democratic decentralization in India. What challenges remain?',
    wordLimit: 250,
    hint: 'Cover: PRIs, ULBs, reservation, state finance commission, challenges of capacity, corruption, political capture',
  },
  'gs3-economy': {
    question: 'Analyze the impact of GST on the Indian economy. How has it addressed the challenges of the previous indirect tax regime?',
    wordLimit: 250,
    hint: 'Cover: One nation one tax, cascading effect, ease of business, compliance, state revenues, challenges of slab rationalization',
  },
  'gs4-ethics-basics': {
    question: '"Integrity is doing the right thing, even when no one is watching." Critically analyze this statement in the context of public service.',
    wordLimit: 250,
    hint: 'Cover: Ethical absolute vs situational ethics, whistle-blowing, conflict of interest, accountability vs autonomy',
  },
  'essay-general': {
    question: 'Technology cannot replace human connection in an increasingly digital world. Discuss.',
    wordLimit: 300,
    hint: 'Cover: Social media vs real relationships, AI companionship, digital divide, role of technology in enabling rather than replacing human connection',
  },
};

export const AnswerWritingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { topicId } = route.params;

  const [selectedTopic, setSelectedTopic] = useState(topicId);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIAnswerEvaluation | null>(null);
  const [showHint, setShowHint] = useState(false);

  const topicData = QUESTIONS[selectedTopic] ?? QUESTIONS['gs4-ethics-basics'];
  const topicMeta = TOPICS.find((t) => t.id === selectedTopic);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const wordCountColor =
    wordCount === 0
      ? colors.textTertiary
      : wordCount < topicData.wordLimit * 0.8
      ? colors.warning
      : wordCount <= topicData.wordLimit
      ? colors.success
      : colors.error;

  const handleEvaluate = async () => {
    if (wordCount < 50) {
      Alert.alert('Answer too short', 'Please write at least 50 words before evaluation.');
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await apiEvaluateAnswer({
        topicId: selectedTopic,
        question: topicData.question,
        answer,
      }) as { success: boolean; data?: AIAnswerEvaluation; error?: string };
      if (res.success && res.data) {
        setEvaluation(res.data);
      } else {
        Alert.alert('Evaluation failed', res.error || 'Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleClear = () => {
    setAnswer('');
    setEvaluation(null);
  };

  const handleViewHistory = () => {
    navigation.navigate('EvaluationHistory');
  };

  return (
    <ScreenWrapper edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>✍️ Answer Writing</Text>
            {topicMeta && (
              <Text style={styles.headerSubtitle}>
                {topicMeta.title} · {topicMeta.paper}
              </Text>
            )}
          </View>
        </View>

        {/* Topic selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
          <View style={styles.topicRow}>
            {TOPICS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.topicChip, selectedTopic === t.id && styles.topicChipActive]}
                onPress={() => { setSelectedTopic(t.id); setAnswer(''); setEvaluation(null); }}
              >
                <Text
                  style={[styles.topicChipText, selectedTopic === t.id && styles.topicChipTextActive]}
                >
                  {t.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Question */}
        <View style={styles.questionCard}>
          <Badge label={topicMeta?.paper ?? 'GS IV'} variant="primary" size="sm" />
          <Text style={styles.questionText}>{topicData.question}</Text>
          <View style={styles.hintRow}>
            <TouchableOpacity onPress={() => setShowHint(!showHint)}>
              <Text style={styles.hintToggle}>💡 {showHint ? 'Hide' : 'Show'} Hint</Text>
            </TouchableOpacity>
            <Text style={[styles.wordLimit, { color: wordCountColor }]}>
              {wordCount}/{topicData.wordLimit} words
            </Text>
          </View>
          {showHint && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{topicData.hint}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.answerScroll} contentContainerStyle={styles.answerContent}>
          {/* Answer input */}
          <View style={styles.answerWrapper}>
            <TextInput
              style={styles.answerInput}
              placeholder="Start writing your answer here..."
              placeholderTextColor={colors.textTertiary}
              multiline
              value={answer}
              onChangeText={setAnswer}
              textAlignVertical="top"
              autoCorrect
            />
            <View style={styles.answerMeta}>
              <Text style={[styles.wordCount, { color: wordCountColor }]}>
                {wordCount} words
              </Text>
            </View>
          </View>

          {/* AI Evaluation Result */}
          {evaluation && (
            <View style={styles.evaluationCard}>
              <View style={styles.evalHeader}>
                <Text style={styles.evalTitle}>🤖 AI Evaluation</Text>
                <View style={styles.evalScore}>
                  <Text style={styles.evalScoreNum}>{evaluation.score}</Text>
                  <Text style={styles.evalScoreLabel}>/100</Text>
                </View>
              </View>

              <View style={styles.dimRow}>
                {[
                  { label: 'Relevance', val: evaluation.relevance },
                  { label: 'Structure', val: evaluation.structure },
                  { label: 'Depth', val: evaluation.depth },
                  { label: 'Examples', val: evaluation.currentExamples },
                ].map((d) => (
                  <View key={d.label} style={styles.dimItem}>
                    <Text style={styles.dimLabel}>{d.label}</Text>
                    <View style={styles.dimBar}>
                      <View style={[styles.dimFill, { width: `${d.val * 10}%` }]} />
                    </View>
                    <Text style={styles.dimVal}>{d.val}/10</Text>
                  </View>
                ))}
              </View>

              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackLabel}>📝 Feedback</Text>
                <Text style={styles.feedbackText}>{evaluation.overallFeedback}</Text>
              </View>

              <View style={styles.improvementBox}>
                <Text style={styles.improvementLabel}>📌 Improve in:</Text>
                {evaluation.improvementPoints.map((point, i) => (
                  <View key={i} style={styles.improvementItem}>
                    <Text style={styles.improvementBullet}>•</Text>
                    <Text style={styles.improvementText}>{point}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.keywordsRow}>
                <Text style={styles.keywordsLabel}>Suggested keywords: </Text>
                {evaluation.suggestedKeywords.map((kw) => (
                  <Badge key={kw} label={kw} variant="primary" size="sm" />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Clear"
            onPress={handleClear}
            variant="ghost"
            size="sm"
            style={{ marginRight: spacing.sm }}
          />
          <Button
            title="📜 History"
            onPress={handleViewHistory}
            variant="ghost"
            size="sm"
            style={{ marginRight: spacing.md }}
          />
          <Button
            title={isEvaluating ? 'Evaluating...' : '🤖 Evaluate with AI'}
            onPress={handleEvaluate}
            variant="primary"
            loading={isEvaluating}
            disabled={wordCount < 50}
            style={{ flex: 1 }}
          />
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
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  topicScroll: { maxHeight: 50, paddingVertical: spacing.sm },
  topicRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  topicChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topicChipText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  topicChipTextActive: { color: '#fff' },
  questionCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  questionText: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    lineHeight: typography.body * typography.normal,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintToggle: {
    fontSize: typography.caption,
    color: colors.primary,
  },
  wordLimit: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
  },
  hintBox: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hintText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: typography.caption * typography.normal,
  },
  answerScroll: { flex: 1 },
  answerContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  answerWrapper: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  answerInput: {
    fontSize: typography.body,
    color: colors.textPrimary,
    padding: spacing.lg,
    minHeight: 250,
    lineHeight: typography.body * typography.relaxed,
  },
  answerMeta: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  wordCount: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
  },
  evaluationCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  evalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evalTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  evalScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  evalScoreNum: {
    fontSize: 32,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  evalScoreLabel: {
    fontSize: typography.body,
    color: colors.textTertiary,
  },
  dimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dimItem: { flex: 1, gap: spacing.xs },
  dimLabel: {
    fontSize: typography.overline,
    color: colors.textTertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  dimBar: {
    height: 4,
    backgroundColor: colors.progressTrack,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  dimFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  dimVal: {
    fontSize: typography.overline,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  feedbackBox: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  feedbackLabel: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.bodySmall * typography.normal,
  },
  improvementBox: {},
  improvementLabel: {
    fontSize: typography.caption,
    color: colors.warning,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  improvementItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  improvementBullet: {
    fontSize: typography.bodySmall,
    color: colors.warning,
  },
  improvementText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  keywordsLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
});