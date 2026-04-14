import { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { TOPIC_OPTIONS } from '../../types/admin';
import type { MCQ } from '../../types/admin';

interface MCQFormData {
  topicId: string;
  question: string;
  options: [string, string, string, string];
  correctOption: number;
  explanation: string;
  source: string;
  year: string;
}

const empty: MCQFormData = {
  topicId: '', question: '',
  options: ['', '', '', ''],
  correctOption: 0,
  explanation: '', source: 'Practice', year: '',
};

interface Props {
  initial?: MCQ;
  onSubmit: (data: {
    topicId: string; question: string; options: string[];
    correctOption: number; explanation: string; source?: string; year?: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function MCQForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<MCQFormData>(() => {
    if (!initial) return empty;
    return {
      topicId: initial.topic_id,
      question: initial.question,
      options: [...initial.options] as [string, string, string, string],
      correctOption: initial.correct_option,
      explanation: initial.explanation,
      source: initial.source,
      year: initial.year?.toString() ?? '',
    };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MCQFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof MCQFormData>(k: K, v: MCQFormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const setOption = (i: number, v: string) => {
    const opts = [...form.options] as [string, string, string, string];
    opts[i] = v;
    set('options', opts);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof MCQFormData, string>> = {};
    if (!form.topicId) e.topicId = 'Required';
    if (!form.question.trim() || form.question.length < 10) e.question = 'Question must be at least 10 characters';
    for (let i = 0; i < 4; i++) {
      if (!form.options[i].trim()) e.options = `Option ${i + 1} is required`;
    }
    if (!form.explanation.trim() || form.explanation.length < 5) e.explanation = 'Explanation must be at least 5 characters';
    if (e.options) {
      setErrors(e);
      return false;
    }
    setErrors(e);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        topicId: form.topicId,
        question: form.question.trim(),
        options: form.options.map((o) => o.trim()),
        correctOption: form.correctOption,
        explanation: form.explanation.trim(),
        source: form.source || 'Practice',
        year: form.year ? parseInt(form.year) : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="form-row form-row-2">
        <Select
          id="topicId"
          label="Topic"
          value={form.topicId}
          onChange={(e) => set('topicId', e.target.value)}
          options={TOPIC_OPTIONS}
          placeholder="Select topic..."
          error={errors.topicId}
        />
        <Input
          id="source"
          label="Source"
          value={form.source}
          onChange={(e) => set('source', e.target.value)}
          placeholder="Practice, PYQ 2020, PIB 2024..."
          error={errors.source}
        />
      </div>

      <Input
        id="question"
        label="Question"
        value={form.question}
        onChange={(e) => set('question', e.target.value)}
        placeholder="Enter the question text..."
        error={errors.question}
      />

      <div>
        <label className="form-label">Options</label>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input
              type="radio"
              name="correctOption"
              checked={form.correctOption === i}
              onChange={() => set('correctOption', i)}
              style={{ accentColor: 'var(--accent)' }}
              title="Mark as correct"
            />
            <input
              className="form-input"
              value={form.options[i]}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              style={{ flex: 1 }}
            />
          </div>
        ))}
        {errors.options && <span className="form-error">{errors.options}</span>}
      </div>

      <Textarea
        id="explanation"
        label="Explanation"
        value={form.explanation}
        onChange={(e) => set('explanation', e.target.value)}
        placeholder="Explain the correct answer..."
        rows={3}
        error={errors.explanation}
      />

      <div className="form-row form-row-2">
        <Input
          id="year"
          label="Year (optional)"
          type="number"
          value={form.year}
          onChange={(e) => set('year', e.target.value)}
          placeholder="2020"
          min="2000"
          max="2030"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Update MCQ' : 'Create MCQ'}
        </button>
      </div>
    </>
  );
}
