import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { TradeOnSheet } from '../../src/components/TradeOnSheet';
import { useAuth } from '../../src/auth/AuthProvider';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function ProfileScreen() {
  const { user, logout, refreshMe } = useAuth();
  const [tradeOnOpen, setTradeOnOpen] = useState(false);

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user.email}</Text>
        {user.displayName && <Text style={styles.sub}>{user.displayName}</Text>}
        <Row label="Role" value={user.role} />
        <Row label="Status" value={user.active ? 'Active' : 'Inactive'} />
      </View>

      <Text style={styles.sectionTitle}>Brokers</Text>
      <View style={styles.card}>
        <BrokerLine
          label="Zerodha"
          configured={user.hasZerodha}
          expiresAt={user.zerodhaAccessTokenExpiresAt}
        />
        <View style={styles.divider} />
        <BrokerLine
          label="5paisa"
          configured={user.hasFivepaisa}
          expiresAt={user.fivepaisaJwtExpiresAt}
        />
        <View style={{ height: spacing.sm }} />
        <Button title="TradeOn" onPress={() => setTradeOnOpen(true)} />
      </View>

      {!user.active && (
        <Banner kind="error">
          Your account is currently inactive. An administrator must re-activate it before you can
          trade.
        </Banner>
      )}

      <View style={styles.actions}>
        <Button title="Refresh profile" variant="secondary" onPress={() => void refreshMe()} />
        <View style={{ height: spacing.sm }} />
        <Button title="Sign out" variant="danger" onPress={() => void logout()} />
      </View>

      <TradeOnSheet open={tradeOnOpen} onClose={() => setTradeOnOpen(false)} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function BrokerLine({
  label,
  configured,
  expiresAt,
}: {
  label: string;
  configured: boolean;
  expiresAt: string | null;
}) {
  const live = Boolean(expiresAt);
  return (
    <View style={styles.brokerLine}>
      <View style={{ flex: 1 }}>
        <Text style={styles.brokerName}>{label}</Text>
        <Text style={styles.brokerSub}>
          {!configured
            ? 'Not configured'
            : live
              ? `Session active · expires ${new Date(expiresAt!).toLocaleString()}`
              : 'No active session'}
        </Text>
      </View>
      <View
        style={[
          styles.pill,
          !configured ? styles.pillOff : live ? styles.pillOn : styles.pillIdle,
        ]}
      >
        <Text
          style={[
            styles.pillText,
            !configured ? styles.pillOffText : live ? styles.pillOnText : styles.pillIdleText,
          ]}
        >
          {!configured ? 'Off' : live ? 'Live' : 'Idle'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 11, textTransform: 'uppercase', color: colors.muted, letterSpacing: 0.5 },
  value: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  rowLabel: { color: colors.muted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 13, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  brokerLine: { flexDirection: 'row', alignItems: 'center' },
  brokerName: { fontSize: 14, fontWeight: '600', color: colors.text },
  brokerSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  pillOff: { backgroundColor: colors.inactive },
  pillOffText: { color: colors.inactiveText },
  pillOn: { backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder },
  pillOnText: { color: colors.success },
  pillIdle: { backgroundColor: colors.inactive },
  pillIdleText: { color: colors.inactiveText },
  pillText: { fontSize: 11, fontWeight: '700' },
  actions: { marginTop: spacing.md },
});
