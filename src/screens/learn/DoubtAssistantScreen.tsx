import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';
import { apiChat } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'DoubtAssistant'>;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const TOPIC_LABELS: Record<string, string> = {
  'gs1-heritage': 'GS I — Heritage & Culture',
  'gs2-constitution': 'GS II — Indian Constitution',
  'gs3-economy': 'GS III — Economy',
  'gs3-environment': 'GS III — Environment',
  'gs4-ethics-basics': 'GS IV — Ethics',
  'csat-logic': 'CSAT — Logical Reasoning',
};

const STARTER_QUESTIONS: Record<string, string[]> = {
  default: [
    'What are the key features of federalism in India?',
    'Explain the difference between directive principles and fundamental rights.',
    'How does the UPSC evaluate answer writing?',
  ],
  'gs2-constitution': [
    'What is the basic structure doctrine?',
    'Explain the differences between original jurisdiction and advisory jurisdiction of SC.',
    'How does Article 32 differ from Article 226?',
  ],
  'gs3-economy': [
    'What is the difference between fiscal deficit and revenue deficit?',
    'Explain the impact of GST on Indian economy.',
    'What are the key provisions of the FRBM Act?',
  ],
  'gs3-environment': [
    'What are the pillars of sustainable development?',
    'Explain the significance of the Paris Agreement for India.',
    'What is the difference between mitigation and adaptation in climate change?',
  ],
};

export const DoubtAssistantScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const topicId = route.params?.topicId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const topicLabel = topicId ? TOPIC_LABELS[topicId] : null;
  const starters = topicId ? (STARTER_QUESTIONS[topicId] ?? STARTER_QUESTIONS.default) : STARTER_QUESTIONS.default;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await apiChat(text.trim(), topicId, history) as { success: boolean; reply?: string; error?: string };
      if (res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: res.reply! },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ Could not get a response. Please try again.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ Connection error. Please check your network and try again.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const clearChat = () => setMessages([]);

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
            <Text style={styles.headerTitle}>🤖 AI Doubt Assistant</Text>
            {topicLabel && (
              <Badge label={topicLabel} variant="primary" size="sm" />
            )}
          </View>
          {messages.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearChat}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeEmoji}>🎓</Text>
              <Text style={styles.welcomeTitle}>Ask me anything about UPSC!</Text>
              <Text style={styles.welcomeSubtitle}>
                I can help with GS papers, current affairs, answer writing tips, and more.
              </Text>
              <View style={styles.starters}>
                <Text style={styles.startersLabel}>Try these questions:</Text>
                {starters.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.starterBtn}
                    onPress={() => sendMessage(q)}
                  >
                    <Text style={styles.starterBtnText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.msgBubble,
                msg.role === 'user' ? styles.msgUser : styles.msgAssistant,
              ]}
            >
              {msg.role === 'assistant' && (
                <Text style={styles.msgAvatar}>🤖</Text>
              )}
              <View style={[
                styles.msgContent,
                msg.role === 'user' ? styles.msgContentUser : styles.msgContentAssistant,
              ]}>
                <Text style={[
                  styles.msgText,
                  msg.role === 'user' ? styles.msgTextUser : styles.msgTextAssistant,
                ]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.msgBubble, styles.msgAssistant]}>
              <Text style={styles.msgAvatar}>🤖</Text>
              <View style={[styles.msgContent, styles.msgContentAssistant]}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={[styles.msgText, styles.msgTextAssistant, { marginLeft: spacing.sm }]}>
                  Thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask a doubt..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
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
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  clearBtn: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  clearBtnText: {
    fontSize: typography.caption,
    color: colors.error,
    fontWeight: typography.medium,
  },
  messages: { flex: 1 },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    flexGrow: 1,
  },
  welcomeCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  welcomeEmoji: { fontSize: 40, marginBottom: spacing.xs },
  welcomeTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.body * typography.normal,
  },
  starters: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  startersLabel: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
  },
  starterBtn: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  starterBtnText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.medium,
    textAlign: 'center',
  },
  msgBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  msgUser: { justifyContent: 'flex-end' },
  msgAssistant: { justifyContent: 'flex-start' },
  msgAvatar: { fontSize: 18, marginBottom: spacing.xs },
  msgContent: {
    maxWidth: '80%',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  msgContentUser: {
    backgroundColor: colors.primary,
  },
  msgContentAssistant: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  msgText: {
    fontSize: typography.body,
    lineHeight: typography.body * typography.normal,
  },
  msgTextUser: { color: '#fff' },
  msgTextAssistant: { color: colors.textPrimary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { fontSize: 18, color: '#fff' },
});