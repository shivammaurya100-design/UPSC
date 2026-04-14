import { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import type { NewsArticle } from '../../types/admin';

interface ArticleFormData {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  linkedTopics: string;
  tags: string;
  importance: string;
  url: string;
}

const IMPORTANCE_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

interface Props {
  initial?: NewsArticle;
  onSubmit: (data: {
    title: string; summary: string; source?: string;
    publishedAt?: string; linkedTopics?: string[]; tags?: string[];
    importance?: string; url?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function ArticleForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ArticleFormData>({
    title: initial?.title ?? '',
    summary: initial?.summary ?? '',
    source: initial?.source ?? '',
    publishedAt: initial?.published_at ? initial.published_at.slice(0, 16) : '',
    linkedTopics: initial?.linked_topics?.join(', ') ?? '',
    tags: initial?.tags?.join(', ') ?? '',
    importance: initial?.importance ?? 'medium',
    url: initial?.url ?? '',
  });
  const [errors, setErrors] = useState<Partial<ArticleFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof ArticleFormData>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const parseList = (s: string) =>
    s.split(',').map((t) => t.trim()).filter(Boolean);

  const validate = (): boolean => {
    const e: Partial<ArticleFormData> = {};
    if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.summary.trim() || form.summary.length < 10) e.summary = 'Summary must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        summary: form.summary.trim(),
        source: form.source.trim() || undefined,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
        linkedTopics: parseList(form.linkedTopics),
        tags: parseList(form.tags),
        importance: form.importance || 'medium',
        url: form.url.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Input
        id="title"
        label="Title"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="India-EU Free Trade Agreement: Key Barriers Removed..."
        error={errors.title}
      />
      <Textarea
        id="summary"
        label="Summary"
        value={form.summary}
        onChange={(e) => set('summary', e.target.value)}
        placeholder="Brief summary of the article..."
        rows={3}
        error={errors.summary}
      />
      <div className="form-row form-row-2">
        <Input
          id="source"
          label="Source"
          value={form.source}
          onChange={(e) => set('source', e.target.value)}
          placeholder="The Hindu, PIB, Indian Express..."
        />
        <Input
          id="publishedAt"
          label="Published At"
          type="datetime-local"
          value={form.publishedAt}
          onChange={(e) => set('publishedAt', e.target.value)}
        />
      </div>
      <div className="form-row form-row-2">
        <Select
          id="importance"
          label="Importance"
          value={form.importance}
          onChange={(e) => set('importance', e.target.value)}
          options={IMPORTANCE_OPTIONS}
        />
        <Input
          id="url"
          label="URL (optional)"
          type="url"
          value={form.url}
          onChange={(e) => set('url', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <Input
        id="linkedTopics"
        label="Linked Topics (comma-separated)"
        value={form.linkedTopics}
        onChange={(e) => set('linkedTopics', e.target.value)}
        placeholder="gs3-economy, gs2-governance"
      />
      <Input
        id="tags"
        label="Tags (comma-separated)"
        value={form.tags}
        onChange={(e) => set('tags', e.target.value)}
        placeholder="Economy, Trade, International Relations"
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </>
  );
}
