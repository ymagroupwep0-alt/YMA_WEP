'use client';

import { useCallback, useEffect, useState } from 'react';

export function usePersistentList<T>(resource: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data/${resource}`, { cache: 'no-store', signal });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? 'تعذر تحميل البيانات');
      setData(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (cause) {
      if (signal?.aborted) return;
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل البيانات');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [resource]);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);

    return () => {
      controller.abort();
    };
  }, [refresh]);

  return { data, setData, loading, error, refresh };
}
