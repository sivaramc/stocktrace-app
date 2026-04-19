import { useEffect, useState } from 'react';
import { dedupeTiles, frameSseEvents, extractStockTiles, type StockTile } from '@stocktrace/core';
import { authStore, baseUrl } from '../platform/api';

type Status = 'connecting' | 'open' | 'closed' | 'error';

interface FeedState {
  tiles: StockTile[];
  status: Status;
  lastError: string | null;
}

const MAX_TILES = 200;

/**
 * Subscribes to the backend SSE feed at /api/feed/stocks using a streaming
 * fetch (so we can send Authorization headers — EventSource cannot).
 * Returns the rolling list of tiles, newest first, and the connection status.
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
    const controller = new AbortController();

    void (async () => {
      try {
        const res = await fetch(`${baseUrl}/api/feed/stocks`, {
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          setStatus('error');
          setLastError(`SSE connect failed (${res.status})`);
          return;
        }
        setStatus('open');

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const { events, rest } = frameSseEvents(buffer);
          buffer = rest;
          for (const evt of events) {
            const newTiles = extractStockTiles(evt);
            if (newTiles.length === 0) continue;
            setTiles((prev) => dedupeTiles([...newTiles, ...prev]).slice(0, MAX_TILES));
          }
        }
        setStatus('closed');
      } catch (err) {
        if (controller.signal.aborted) return;
        setStatus('error');
        setLastError(err instanceof Error ? err.message : 'SSE error');
      }
    })();

    return () => controller.abort();
  }, []);

  return { tiles, status, lastError };
}
