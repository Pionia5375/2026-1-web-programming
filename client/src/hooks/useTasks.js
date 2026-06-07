import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { cacheList, readCached } from '../lib/idbCache.js';

export function useTasks(params = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
      cacheList('tasks', data.tasks);
    } catch (err) {
      const cached = await readCached('tasks');
      if (cached.length > 0) setTasks(cached);
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (input) => {
      const { data } = await api.post('/tasks', input);
      setTasks((prev) => [data.task, ...prev]);
      return data.task;
    },
    []
  );

  const update = useCallback(
    async (id, input) => {
      const { data } = await api.patch(`/tasks/${id}`, input);
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      return data.task;
    },
    []
  );

  const remove = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, error, reload: load, create, update, remove };
}
