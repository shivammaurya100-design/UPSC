import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, id, ...props }: TextareaProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <textarea id={id} className="form-textarea" {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
