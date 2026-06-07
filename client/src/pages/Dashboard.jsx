import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useTasks } from '../hooks/useTasks.js';
import { useEvents } from '../hooks/useEvents.js';

export default function Dashboard() {
  const today = useMemo(() => new Date(), []);
  const from = startOfDay(today).toISOString();
  const to = endOfDay(today).toISOString();

  const { tasks, loading: tl } = useTasks({ from, to });
  const { events, loading: el } = useEvents({ from, to });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">오늘의 일정</h1>
        <p className="text-sm text-slate-500">{format(today, 'yyyy년 M월 d일 (EEE)')}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">오늘 마감 할 일</h2>
            <Link to="/tasks" className="text-sm text-brand-600 hover:underline">전체 보기</Link>
          </div>
          {tl ? (
            <p className="text-sm text-slate-500">불러오는 중...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-slate-500">오늘 마감인 할 일이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className={t.completed ? 'line-through text-slate-400' : ''}>
                    {t.title}
                  </span>
                  {t.dueAt && (
                    <span className="text-xs text-slate-500">
                      {format(new Date(t.dueAt), 'HH:mm')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">오늘 일정</h2>
            <Link to="/events" className="text-sm text-brand-600 hover:underline">전체 보기</Link>
          </div>
          {el ? (
            <p className="text-sm text-slate-500">불러오는 중...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-slate-500">오늘 등록된 일정이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm">
                  <span>{e.title}</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(e.startAt), 'HH:mm')} - {format(new Date(e.endAt), 'HH:mm')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
