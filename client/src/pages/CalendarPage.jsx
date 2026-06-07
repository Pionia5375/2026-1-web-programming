import { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTasks } from '../hooks/useTasks.js';
import { useEvents } from '../hooks/useEvents.js';

const locales = { 'ko-KR': ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const MONTH_KEY = 'planit.calendar.month';

const messages = {
  today: '오늘',
  previous: '이전',
  next: '다음',
  month: '월',
  week: '주',
  day: '일',
  agenda: '아젠다',
  date: '날짜',
  time: '시간',
  event: '일정',
  noEventsInRange: '이 기간에 일정이 없습니다.',
  showMore: (n) => `+${n} 더보기`,
};

export default function CalendarPage() {
  const [date, setDate] = useState(() => {
    const cached = sessionStorage.getItem(MONTH_KEY);
    return cached ? new Date(cached) : new Date();
  });

  useEffect(() => {
    sessionStorage.setItem(MONTH_KEY, date.toISOString());
  }, [date]);

  const range = useMemo(() => ({
    from: startOfMonth(date).toISOString(),
    to: endOfMonth(date).toISOString(),
  }), [date]);

  const { events } = useEvents(range);
  const { tasks } = useTasks(range);

  const calendarItems = useMemo(() => {
    const fromEvents = events.map((e) => ({
      id: `event-${e.id}`,
      title: `📅 ${e.title}`,
      start: new Date(e.startAt),
      end: new Date(e.endAt),
      resource: { type: 'event' },
    }));
    const fromTasks = tasks
      .filter((t) => t.dueAt)
      .map((t) => ({
        id: `task-${t.id}`,
        title: `${t.completed ? '✅' : '☐'} ${t.title}`,
        start: new Date(t.dueAt),
        end: new Date(t.dueAt),
        allDay: false,
        resource: { type: 'task', completed: t.completed },
      }));
    return [...fromEvents, ...fromTasks];
  }, [events, tasks]);

  function eventStyle(item) {
    if (item.resource.type === 'task') {
      return {
        style: {
          backgroundColor: item.resource.completed ? '#94a3b8' : '#f59e0b',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
        },
      };
    }
    return {
      style: {
        backgroundColor: '#2563eb',
        color: '#fff',
        borderRadius: '6px',
        border: 'none',
      },
    };
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">통합 캘린더</h1>
      <div className="card" style={{ height: 'calc(100vh - 220px)', minHeight: 520 }}>
        <Calendar
          localizer={localizer}
          culture="ko-KR"
          messages={messages}
          events={calendarItems}
          date={date}
          onNavigate={setDate}
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={eventStyle}
          style={{ height: '100%' }}
        />
      </div>
      <div className="flex gap-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-brand-600" /> 일정</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-amber-500" /> 할 일 (미완료)</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-slate-400" /> 할 일 (완료)</span>
      </div>
    </div>
  );
}
