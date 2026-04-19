import { useState } from 'react';
import { Button } from '../components/Button';
import { TradeOnModal } from '../components/TradeOnModal';
import { useStockFeed } from '../hooks/useStockFeed';
import { buildTradeRequest, extractErrorMessage, type StockTile } from '@stocktrace/core';
import { endpoints } from '../platform/api';
import { useAuth } from '../auth/AuthProvider';

export function StocksPage() {
  const { user } = useAuth();
  const { tiles, status, lastError } = useStockFeed();
  const [tradeOnOpen, setTradeOnOpen] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  async function placeOrder(tile: StockTile, side: 'BUY' | 'SELL') {
    const key = `${side}:${tile.tradingsymbol}:${tile.receivedAt}`;
    setBusyKey(key);
    setToast(null);
    const req = buildTradeRequest(tile, side);
    try {
      if (side === 'BUY') await endpoints.placeBuy(req);
      else await endpoints.placeSell(req);
      setToast({ kind: 'ok', msg: `${side} placed for ${tile.tradingsymbol}` });
    } catch (err) {
      setToast({ kind: 'err', msg: extractErrorMessage(err, `${side} failed`) });
    } finally {
      setBusyKey(null);
    }
  }

  const zerodhaLive = Boolean(user?.zerodhaAccessTokenExpiresAt);
  const fivepaisaLive = Boolean(user?.fivepaisaJwtExpiresAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Stocks feed</h1>
          <p className="text-sm text-slate-500">Live alerts from Chartink. Click BUY / SELL to trade on your own broker accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <BrokerBadge label="Zerodha" active={zerodhaLive} expiresAt={user?.zerodhaAccessTokenExpiresAt ?? null} />
          <BrokerBadge label="5paisa" active={fivepaisaLive} expiresAt={user?.fivepaisaJwtExpiresAt ?? null} />
          <Button onClick={() => setTradeOnOpen(true)}>TradeOn</Button>
        </div>
      </div>

      <FeedStatus status={status} lastError={lastError} />

      {toast && (
        <div
          className={`rounded border px-3 py-2 text-sm ${
            toast.kind === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {tiles.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Waiting for Chartink alerts…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tiles.map((tile) => {
            const key = `${tile.tradingsymbol}:${tile.exchange}:${tile.transactionType}:${tile.receivedAt}`;
            return (
              <div key={key} className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{tile.tradingsymbol}</div>
                    <div className="text-xs text-slate-500">{tile.exchange}</div>
                  </div>
                  <span
                    className={`text-xs rounded px-2 py-0.5 font-medium ${
                      tile.transactionType === 'BUY'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tile.transactionType}
                  </span>
                </div>
                {tile.triggerPrice !== null && (
                  <div className="mt-2 text-sm text-slate-700">Trigger ₹{tile.triggerPrice.toFixed(2)}</div>
                )}
                {tile.scanName && <div className="mt-1 text-xs text-slate-500">{tile.scanName}</div>}
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="buy"
                    loading={busyKey === `BUY:${tile.tradingsymbol}:${tile.receivedAt}`}
                    onClick={() => placeOrder(tile, 'BUY')}
                    className="flex-1"
                  >
                    BUY
                  </Button>
                  <Button
                    variant="sell"
                    loading={busyKey === `SELL:${tile.tradingsymbol}:${tile.receivedAt}`}
                    onClick={() => placeOrder(tile, 'SELL')}
                    className="flex-1"
                  >
                    SELL
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TradeOnModal open={tradeOnOpen} onClose={() => setTradeOnOpen(false)} />
    </div>
  );
}

function BrokerBadge({ label, active, expiresAt }: { label: string; active: boolean; expiresAt: string | null }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
        active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
      title={expiresAt ? `Expires ${new Date(expiresAt).toLocaleString()}` : 'No active session'}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {label}
    </span>
  );
}

function FeedStatus({ status, lastError }: { status: string; lastError: string | null }) {
  if (status === 'open') return null;
  const map: Record<string, { text: string; cls: string }> = {
    connecting: { text: 'Connecting to feed…', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
    closed: { text: 'Feed closed', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
    error: { text: `Feed error: ${lastError ?? 'unknown'}`, cls: 'bg-red-50 text-red-700 border-red-200' },
  };
  const entry = map[status] ?? map.closed;
  return <div className={`rounded border px-3 py-2 text-sm ${entry.cls}`}>{entry.text}</div>;
}
