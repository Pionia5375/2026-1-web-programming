import { useEffect, useRef } from 'react';
import { api } from '../api/client.js';

const NOTIFIED_KEY = 'planit.notified';
const CHECK_INTERVAL_MS = 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;

function loadNotified() {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function persistNotified(set) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
}

async function checkDueSoon() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const { data } = await api.get('/tasks', { params: { completed: 'false' } });
    const notified = loadNotified();
    const now = Date.now();
    let changed = false;
    for (const t of data.tasks) {
      if (!t.dueAt) continue;
      const due = new Date(t.dueAt).getTime();
      const delta = due - now;
      if (delta > 0 && delta <= WINDOW_MS && !notified.has(t.id)) {
        const when = new Date(t.dueAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        new Notification('곧 마감!', {
          body: `${t.title} — ${when} 마감`,
          tag: t.id,
        });
        notified.add(t.id);
        changed = true;
      }
    }
    if (changed) persistNotified(notified);
  } catch {
    /* 네트워크 실패 시 다음 주기에 재시도 */
  }
}

export function useDueNotifier(enabled) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof Notification === 'undefined') return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    checkDueSoon();
    timerRef.current = setInterval(checkDueSoon, CHECK_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled]);
}
