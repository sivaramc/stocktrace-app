import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { extractErrorMessage, type AdminRow, type AppRole } from '@stocktrace/core';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/auth/AuthProvider';
import { endpoints } from '../../src/platform/api';
import { colors, radius, spacing } from '../../src/theme/colors';

const LIST_KEY = ['admin', 'users'] as const;

export default function UsersScreen() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError, error: qErr, isRefetching, refetch } = useQuery<AdminRow[]>({
    queryKey: LIST_KEY,
    queryFn: () => endpoints.listUsers(),
  });

  function onMutationSuccess() {
    setError(null);
    void qc.invalidateQueries({ queryKey: LIST_KEY });
  }

  const activate = useMutation({
    mutationFn: (id: number) => endpoints.activateUser(id),
    onSuccess: onMutationSuccess,
    onError: (e) => setError(extractErrorMessage(e, 'Activate failed')),
  });
  const deactivate = useMutation({
    mutationFn: (id: number) => endpoints.deactivateUser(id),
    onSuccess: onMutationSuccess,
    onError: (e) => setError(extractErrorMessage(e, 'Deactivate failed')),
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: AppRole }) =>
      endpoints.changeUserRole(id, role),
    onSuccess: onMutationSuccess,
    onError: (e) => setError(extractErrorMessage(e, 'Role change failed')),
  });

  if (!isAdmin) {
    return <Redirect href="/stocks" />;
  }

  const busy = activate.isPending || deactivate.isPending || changeRole.isPending;

  return (
    <View style={styles.wrap}>
      {error && <Banner kind="error">{error}</Banner>}
      {isError && (
        <Banner kind="error">{extractErrorMessage(qErr, 'Failed to load users')}</Banner>
      )}
      {isLoading && <Text style={styles.loading}>Loading…</Text>}
      <FlatList
        data={data ?? []}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            <View style={styles.rowHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.email}>{row.email}</Text>
                {row.displayName && <Text style={styles.muted}>{row.displayName}</Text>}
                <Text style={styles.meta}>
                  {[row.hasZerodha && 'Zerodha', row.hasFivepaisa && '5paisa']
                    .filter(Boolean)
                    .join(' · ') || 'No brokers'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  row.active ? styles.statusOn : styles.statusOff,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    row.active ? styles.statusOnText : styles.statusOffText,
                  ]}
                >
                  {row.active ? 'active' : 'inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.controls}>
              <Text style={styles.controlLabel}>Role</Text>
              <View style={styles.rolePills}>
                <RolePill
                  label="USER"
                  selected={row.role === 'USER'}
                  disabled={busy}
                  onPress={() => changeRole.mutate({ id: row.id, role: 'USER' })}
                />
                <RolePill
                  label="ADMIN"
                  selected={row.role === 'ADMIN'}
                  disabled={busy}
                  onPress={() => changeRole.mutate({ id: row.id, role: 'ADMIN' })}
                />
              </View>
              {row.active ? (
                <Button
                  title="Deactivate"
                  variant="secondary"
                  onPress={() => deactivate.mutate(row.id)}
                  loading={deactivate.isPending && deactivate.variables === row.id}
                  style={styles.actionBtn}
                />
              ) : (
                <Button
                  title="Activate"
                  onPress={() => activate.mutate(row.id)}
                  loading={activate.isPending && activate.variables === row.id}
                  style={styles.actionBtn}
                />
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

function RolePill({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.rolePill, selected && styles.rolePillSelected, disabled && { opacity: 0.6 }]}
    >
      <Text style={[styles.rolePillText, selected && styles.rolePillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.md, backgroundColor: colors.bg, gap: spacing.sm },
  loading: { color: colors.muted, textAlign: 'center', paddingVertical: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowHead: { flexDirection: 'row' },
  email: { fontSize: 15, fontWeight: '600', color: colors.text },
  muted: { fontSize: 12, color: colors.muted, marginTop: 2 },
  meta: { fontSize: 11, color: colors.mutedLight, marginTop: 4 },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  statusOn: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  statusOff: { backgroundColor: colors.inactive },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusOnText: { color: colors.success },
  statusOffText: { color: colors.inactiveText },
  controls: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  controlLabel: { fontSize: 11, textTransform: 'uppercase', color: colors.muted, letterSpacing: 0.5 },
  rolePills: { flexDirection: 'row', gap: spacing.xs },
  rolePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rolePillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  rolePillText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  rolePillTextSelected: { color: colors.primaryText },
  actionBtn: {},
});
