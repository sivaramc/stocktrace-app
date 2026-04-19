import type { StockTile } from './types';

export interface SseEvent {
  event: string;
  data: string;
}

/** Normalise CR / CRLF / LF line terminators to LF per the SSE spec. */
export function normaliseLineEndings(chunk: string): string {
  return chunk.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Incremental SSE framer. Feed arbitrary chunks of text (already decoded);
 * returns any complete events plus the leftover partial buffer.
 */
export function frameSseEvents(buffer: string): { events: SseEvent[]; rest: string } {
  const normalised = normaliseLineEndings(buffer);
  const events: SseEvent[] = [];
  let rest = normalised;

  while (true) {
    const sep = rest.indexOf('\n\n');
    if (sep === -1) break;
    const raw = rest.slice(0, sep);
    rest = rest.slice(sep + 2);
    const parsed = parseRawEvent(raw);
    if (parsed) events.push(parsed);
  }
  return { events, rest };
}

function parseRawEvent(raw: string): SseEvent | null {
  let eventName = 'message';
  let data = '';
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) eventName = line.slice(6).trim();
    else if (line.startsWith('data:')) data += (data ? '\n' : '') + line.slice(5).trim();
  }
  if (!data) return null;
  return { event: eventName, data };
}

/**
 * Decodes an SSE event payload into zero-or-more StockTile records. Tolerates
 * both single-tile and `{ stocks: [...] }` batch payloads; silently skips
 * malformed JSON. The backend `ready` event is ignored.
 */
export function extractStockTiles(event: SseEvent): StockTile[] {
  if (event.event === 'ready') return [];
  try {
    const payload = JSON.parse(event.data) as StockTile | { stocks?: StockTile[] };
    if (Array.isArray((payload as { stocks?: StockTile[] }).stocks)) {
      return (payload as { stocks: StockTile[] }).stocks;
    }
    const tile = payload as StockTile;
    if (tile?.tradingsymbol) return [tile];
    return [];
  } catch {
    return [];
  }
}

/** Stable dedupe key: a single tile is fully characterised by these four fields. */
export function tileKey(t: StockTile): string {
  return `${t.tradingsymbol}|${t.exchange}|${t.transactionType}|${t.receivedAt}`;
}

export function dedupeTiles(tiles: StockTile[]): StockTile[] {
  const seen = new Set<string>();
  const out: StockTile[] = [];
  for (const t of tiles) {
    const key = tileKey(t);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}
