import { useEffect, useMemo, useState } from 'react';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';
import { useTasks } from '../hooks/useTasks.js';

const SEARCH_KEY = 'planit.tasks.q';
const PRIORITY_KEY = 'planit.tasks.priority';

export default function Tasks() {
  const [q, setQ] = useState(() => sessionStorage.getItem(SEARCH_KEY) ?? '');
  const [priority, setPriority] = useState(() => sessionStorage.getItem(PRIORITY_KEY) ?? '');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    sessionStorage.setItem(SEARCH_KEY, q);
  }, [q]);
  useEffect(() => {
    sessionStorage.setItem(PRIORITY_KEY, priority);
  }, [priority]);

  const params = useMemo(() => {
    const p = {};
    if (q) p.q = q;
    if (priority) p.priority = priority;
    return p;
  }, [q, priority]);

  const { tasks, loading, create, update, remove } = useTasks(params);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">할 일</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>+ 새 할 일</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="input max-w-xs"
          placeholder="제목 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input max-w-[10rem]" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">전체 우선순위</option>
          <option value="HIGH">상</option>
          <option value="MEDIUM">중</option>
          <option value="LOW">하</option>
        </select>
        {(q || priority) && (
          <button
            className="btn-ghost"
            onClick={() => {
              setQ('');
              setPriority('');
            }}
          >
            필터 초기화
          </button>
        )}
      </div>

      {creating && (
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">새 할 일</h2>
          <TaskForm
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
          <h2 className="mb-3 text-lg font-semibold">할 일 수정</h2>
          <TaskForm
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
      ) : tasks.length === 0 ? (
        <p className="text-sm text-slate-500">표시할 할 일이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggle={(task) => update(task.id, { completed: !task.completed })}
              onEdit={setEditing}
              onDelete={(task) => {
                if (confirm(`"${task.title}" 을(를) 삭제할까요?`)) remove(task.id);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
