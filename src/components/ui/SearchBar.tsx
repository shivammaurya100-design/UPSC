// SearchBar component — unified search across MCQs, articles, and syllabus

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { unifiedSearch, UnifiedSearchResult } from '../../services/searchService';

interface SearchBarProps {
  placeholder?: string;
  onResultPress?: (result: UnifiedSearchResult) => void;
  autoFocus?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  mcq: '📝',
  article: '📰',
  syllabus: '📋',
};

const TYPE_COLORS: Record<string, string> = {
  mcq: colors.primary,
  article: colors.success,
  syllabus: colors.warning,
};

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search MCQs, articles, syllabus...',
  onResultPress,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const results = query.trim().length >= 2 ? unifiedSearch(query) : [];

  const handleClear = useCallback(() => {
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  const handleResultPress = useCallback(
    (result: UnifiedSearchResult) => {
      onResultPress?.(result);
      handleClear();
    },
    [onResultPress, handleClear],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {isFocused && results.length > 0 && (
        <View style={styles.dropdown}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownCount}>{results.length} results</Text>
          </View>
          <FlatList
            data={results.slice(0, 8)}
            keyExtractor={(item, i) => `${item.type}-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleResultPress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.resultTypeBadge, { backgroundColor: `${TYPE_COLORS[item.type]}20` }]}>
                  <Text style={styles.resultTypeIcon}>{TYPE_ICONS[item.type]}</Text>
                </View>
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  <View style={styles.resultMeta}>
                    <View style={[styles.resultTypePill, { backgroundColor: `${TYPE_COLORS[item.type]}20` }]}>
                      <Text style={[styles.resultTypePillText, { color: TYPE_COLORS[item.type] }]}>
                        {item.type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.resultMetaText}>{item.meta}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {isFocused && query.trim().length >= 2 && results.length === 0 && (
        <View style={styles.dropdown}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptyHint}>Try different keywords</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputRowFocused: {
    borderColor: colors.primary,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  input: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  clearBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  clearBtnText: { fontSize: 14, color: colors.textTertiary },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 360,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownCount: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.medium,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  resultTypeIcon: { fontSize: 18 },
  resultContent: { flex: 1 },
  resultTitle: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultTypePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  resultTypePillText: {
    fontSize: 9,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  resultMetaText: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyHint: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
});