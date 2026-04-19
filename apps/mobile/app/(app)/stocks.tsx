import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  buildTradeRequest,
  extractErrorMessage,
  type StockTile,
} from '@stocktrace/core';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { TradeOnSheet } from '../../src/components/TradeOnSheet';
import { useAuth } from '../../src/auth/AuthProvider';
import { useStockFeed } from '../../src/hooks/useStockFeed';
import { endpoints } from '../../src/platform/api';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function StocksScreen() {
  const { user, refreshMe } = useAuth();
  const { tiles, status, lastError } = useStockFeed();
  const [tradeOnOpen, setTradeOnOpen] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null);

  async function placeOrder(tile: StockTile, side: 'BUY' | 'SELL') {
    const key = `${side}:${tile.tradingsymbol}:${tile.receivedAt}`;
    setBusyKey(key);
    setToast(null);
    const req = buildTradeRequest(tile, side);
    try {
      if (side === 'BUY') await endpoints.placeBuy(req);
      else await endpoints.placeSell(req);
      setToast({ kind: 'success', msg: `${side} placed for ${tile.tradingsymbol}` });
    } catch (err) {
      setToast({ kind: 'error', msg: extractErrorMessage(err, `${side} failed`) });
    } finally {
      setBusyKey(null);
    }
  }

  const zerodhaLive = Boolean(user?.zerodhaAccessTokenExpiresAt);
  const fivepaisaLive = Boolean(user?.fivepaisaJwtExpiresAt);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.badges}>
          <BrokerBadge label="Zerodha" active={zerodhaLive} />
          <BrokerBadge label="5paisa" active={fivepaisaLive} />
        </View>
        <Button title="TradeOn" onPress={() => setTradeOnOpen(true)} />
      </View>

      <StatusLine status={status} lastError={lastError} />

      {toast && <Banner kind={toast.kind}>{toast.msg}</Banner>}

      <FlatList
        data={tiles}
        keyExtractor={(t) =>
          `${t.tradingsymbol}:${t.exchange}:${t.transactionType}:${t.receivedAt}`
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Waiting for Chartink alerts…</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => void refreshMe()} />
        }
        renderItem={({ item: tile }) => (
          <View style={styles.tile}>
            <View style={styles.tileHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.symbol}>{tile.tradingsymbol}</Text>
                <Text style={styles.exchange}>{tile.exchange}</Text>
              </View>
              <View style={[styles.sidePill, tile.transactionType === 'BUY' ? styles.buyPill : styles.sellPill]}>
                <Text
                  style={[
                    styles.sidePillText,
                    tile.transactionType === 'BUY' ? styles.buyText : styles.sellText,
                  ]}
                >
                  {tile.transactionType}
                </Text>
              </View>
            </View>
            {tile.triggerPrice !== null && (
              <Text style={styles.trigger}>Trigger ₹{tile.triggerPrice.toFixed(2)}</Text>
            )}
            {tile.scanName && <Text style={styles.scan}>{tile.scanName}</Text>}
            <View style={styles.actions}>
              <Button
                title="BUY"
                variant="buy"
                onPress={() => placeOrder(tile, 'BUY')}
                loading={busyKey === `BUY:${tile.tradingsymbol}:${tile.receivedAt}`}
                style={styles.actionBtn}
              />
              <Button
                title="SELL"
                variant="sell"
                onPress={() => placeOrder(tile, 'SELL')}
                loading={busyKey === `SELL:${tile.tradingsymbol}:${tile.receivedAt}`}
                style={styles.actionBtn}
              />
            </View>
          </View>
        )}
      />

      <TradeOnSheet open={tradeOnOpen} onClose={() => setTradeOnOpen(false)} />
    </View>
  );
}

function BrokerBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeActiveText : styles.badgeInactiveText]}>
        {label} {active ? 'live' : 'off'}
      </Text>
    </View>
  );
}

function StatusLine({ status, lastError }: { status: string; lastError: string | null }) {
  const label =
    status === 'open'
      ? 'Live'
      : status === 'connecting'
        ? 'Connecting…'
        : status === 'error'
          ? `Error: ${lastError ?? 'unknown'}`
          : 'Disconnected';
  return <Text style={styles.status}>{label}</Text>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badges: { flexDirection: 'row', gap: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  badgeActive: { backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder },
  badgeInactive: { backgroundColor: colors.inactive },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeActiveText: { color: colors.success },
  badgeInactiveText: { color: colors.inactiveText },
  status: { fontSize: 12, color: colors.muted, marginBottom: spacing.sm },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.muted, fontSize: 14 },
  tile: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  tileHead: { flexDirection: 'row', alignItems: 'flex-start' },
  symbol: { fontSize: 16, fontWeight: '600', color: colors.text },
  exchange: { fontSize: 11, color: colors.muted, marginTop: 2 },
  sidePill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  buyPill: { backgroundColor: colors.buyBg },
  sellPill: { backgroundColor: colors.sellBg },
  sidePillText: { fontSize: 11, fontWeight: '700' },
  buyText: { color: colors.buyText },
  sellText: { color: colors.sellText },
  trigger: { fontSize: 13, color: colors.text, marginTop: spacing.sm },
  scan: { fontSize: 11, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1 },
});
