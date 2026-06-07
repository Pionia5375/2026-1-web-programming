import { useState } from 'react';
import { format } from 'date-fns';
import EventForm from '../components/EventForm.jsx';
import { useEvents } from '../hooks/useEvents.js';

export default function Events() {
  const { events, loading, create, update, remove } = useEvents();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">일정</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>+ 새 일정</button>
      </div>

      {creating && (
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">새 일정</h2>
          <EventForm
            onSubmit={async (data) => {
              await create(data);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
            submitLabel="추가"
          />
        </div>
      )}

      {editing && (
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">일정 수정</h2>
          <EventForm
            initial={editing}
            onSubmit={async (data) => {
              await update(editing.id, data);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">불러오는 중...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-slate-500">등록된 일정이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="card flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-medium">{e.title}</div>
                <div className="text-sm text-slate-500">
                  {format(new Date(e.startAt), 'yyyy-MM-dd HH:mm')} → {format(new Date(e.endAt), 'HH:mm')}
                  {e.location && <span className="ml-2 text-slate-400">@ {e.location}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button className="btn-ghost text-xs" onClick={() => setEditing(e)}>수정</button>
                <button
                  className="btn-ghost text-xs text-rose-600"
                  onClick={() => {
                    if (confirm(`"${e.title}" 일정을 삭제할까요?`)) remove(e.id);
                  }}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
