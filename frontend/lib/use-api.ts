"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseApiResult<T> {
  data: T | null;
  error: unknown;
  isLoading: boolean;
  reload: () => Promise<void>;
}

/**
 * Minimal fetch-on-mount hook for the client API. `enabled` defers the call
 * until prerequisites (e.g. the authenticated user) are ready. The fetcher is
 * kept in a ref so callers can pass inline arrows without re-fetch loops —
 * only `deps`/`enabled` retrigger.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  enabled = true,
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // All state updates happen after the fetch promise settles (async), so this
  // is safe to kick off from an effect without cascading renders.
  const runFetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    await runFetch();
  }, [runFetch]);

  useEffect(() => {
    if (!enabled) return;
    void runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, runFetch, ...deps]);

  return { data, error, isLoading, reload };
}
