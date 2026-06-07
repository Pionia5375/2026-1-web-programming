import { useState } from 'react';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: '하' },
  { value: 'MEDIUM', label: '중' },
  { value: 'HIGH', label: '상' },
];

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TaskForm({ initial, onSubmit, onCancel, submitLabel = '저장' }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [dueAt, setDueAt] = useState(toLocalInputValue(initial?.dueAt));
  const [priority, setPriority] = useState(initial?.priority ?? 'MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력해 주세요');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        priority,
      });
    } catch (err) {
      setError(err?.response?.data?.error ?? '저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="input"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <textarea
        className="input"
        placeholder="설명 (선택)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="datetime-local"
          className="input"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>우선순위 {o.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>취소</button>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
