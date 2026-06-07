import { useState } from 'react';

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({ initial, onSubmit, onCancel, submitLabel = '저장' }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [startAt, setStartAt] = useState(toLocalInputValue(initial?.startAt));
  const [endAt, setEndAt] = useState(toLocalInputValue(initial?.endAt));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('제목을 입력해 주세요');
    if (!startAt || !endAt) return setError('시작/종료 시각을 입력해 주세요');
    if (new Date(endAt) < new Date(startAt)) return setError('종료가 시작보다 빠를 수 없습니다');

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        location: location.trim() || null,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      });
    } catch (err) {
      setError(err?.response?.data?.error ?? '저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input className="input" placeholder="일정 제목" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <input className="input" placeholder="장소 (선택)" value={location} onChange={(e) => setLocation(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <input type="datetime-local" className="input" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        <input type="datetime-local" className="input" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>취소</button>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
