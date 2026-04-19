import { useEffect, useState } from 'react';
import EventSource from 'react-native-sse';
import { dedupeTiles, extractStockTiles, type StockTile } from '@stocktrace/core';
import { authStore, baseUrl } from '../platform/api';

type Status = 'connecting' | 'open' | 'closed' | 'error';

interface FeedState {
  tiles: StockTile[];
  status: Status;
  lastError: string | null;
}

const MAX_TILES = 200;

/**
 * Subscribes to the backend SSE feed via `react-native-sse`, which supports
 * custom Authorization headers (unlike the native EventSource implementations
 * we'd get from the web polyfill path).
 */
export function useStockFeed(): FeedState {
  const [tiles, setTiles] = useState<StockTile[]>([]);
  const [status, setStatus] = useState<Status>(() =>
    authStore.getToken() ? 'connecting' : 'closed',
  );
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const token = authStore.getToken();
    if (!token) return;

    const es = new EventSource(`${baseUrl}/api/feed/stocks`, {
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`,
      },
      pollingInterval: 0,
    });

    es.addEventListener('open', () => {
      setStatus('open');
      setLastError(null);
    });

    const onTiles = (event: { data?: string | null }) => {
      if (!event.data) return;
      const newTiles = extractStockTiles({ event: 'chartink', data: event.data });
      if (newTiles.length === 0) return;
      setTiles((prev) => dedupeTiles([...newTiles, ...prev]).slice(0, MAX_TILES));
    };
    es.addEventListener('chartink' as 'message', onTiles);
    es.addEventListener('message', onTiles);

    es.addEventListener('error', (event) => {
      const e = event as { message?: string };
      setStatus('error');
      setLastError(e?.message ?? 'SSE error');
    });

    es.addEventListener('close' as 'error', () => setStatus('closed'));

    return () => {
      es.removeAllEventListeners();
      es.close();
    };
  }, []);

  return { tiles, status, lastError };
}
