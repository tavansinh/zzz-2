import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toError } from '@/lib/errors';

interface UseAsyncResourceReturn<T> {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const useAsyncResource = <T>(
  fetchData: () => Promise<T>,
  initialData: T,
): UseAsyncResourceReturn<T> => {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchData()
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch((err) => {
        if (!cancelled) setError(toError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextData = await fetchData();
      if (aliveRef.current) setData(nextData);
    } catch (err) {
      if (aliveRef.current) setError(toError(err));
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [fetchData]);

  return { data, setData, loading, error, refresh };
};

export default useAsyncResource;
