import { useState } from 'react';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { TOPIC_OPTIONS } from '../../types/admin';
import type { Flashcard } from '../../types/admin';

interface FlashcardFormData {
  topicId: string;
  front: string;
  back: string;
}

interface Props {
  initial?: Flashcard;
  onSubmit: (data: { topicId: string; front: string; back: string }) => Promise<void>;
  onCancel: () => void;
}

export default function FlashcardForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FlashcardFormData>({
    topicId: initial?.topic_id ?? '',
    front: initial?.front ?? '',
    back: initial?.back ?? '',
  });
  const [errors, setErrors] = useState<Partial<FlashcardFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FlashcardFormData>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FlashcardFormData> = {};
    if (!form.topicId) e.topicId = 'Required';
    if (!form.front.trim() || form.front.length < 5) e.front = 'Front must be at least 5 characters';
    if (!form.back.trim() || form.back.length < 5) e.back = 'Back must be at least 5 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ topicId: form.topicId, front: form.front.trim(), back: form.back.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Select
        id="topicId"
        label="Topic"
        value={form.topicId}
        onChange={(e) => set('topicId', e.target.value)}
        options={TOPIC_OPTIONS}
        placeholder="Select topic..."
        error={errors.topicId}
      />
      <Textarea
        id="front"
        label="Front (Question)"
        value={form.front}
        onChange={(e) => set('front', e.target.value)}
        placeholder="What is the minimum age to become President of India?"
        rows={3}
        error={errors.front}
      />
      <Textarea
        id="back"
        label="Back (Answer)"
        value={form.back}
        onChange={(e) => set('back', e.target.value)}
        placeholder="35 years (Article 58)"
        rows={3}
        error={errors.back}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Update Flashcard' : 'Create Flashcard'}
        </button>
      </div>
    </>
  );
}
