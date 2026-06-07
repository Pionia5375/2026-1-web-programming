import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { cacheList, readCached } from '../lib/idbCache.js';

export function useEvents(params = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/events', { params });
      setEvents(data.events);
      cacheList('events', data.events);
    } catch (err) {
      const cached = await readCached('events');
      if (cached.length > 0) setEvents(cached);
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (input) => {
    const { data } = await api.post('/events', input);
    setEvents((prev) => [...prev, data.event].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)));
    return data.event;
  }, []);

  const update = useCallback(async (id, input) => {
    const { data } = await api.patch(`/events/${id}`, input);
    setEvents((prev) => prev.map((e) => (e.id === id ? data.event : e)));
    return data.event;
  }, []);

  const remove = useCallback(async (id) => {
    await api.delete(`/events/${id}`);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { events, loading, error, reload: load, create, update, remove };
}
