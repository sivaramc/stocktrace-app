import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { extractErrorMessage } from '@stocktrace/core';
import { useAuth } from '../auth/AuthProvider';
import { endpoints } from '../platform/api';
import { colors, radius, spacing } from '../theme/colors';
import { Banner } from './Banner';
import { Button } from './Button';
import { FormField } from './FormField';

type BrokerTab = 'zerodha' | 'fivepaisa';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TradeOnSheet({ open, onClose }: Props) {
  const { user, refreshMe } = useAuth();
  const [tab, setTab] = useState<BrokerTab>(user?.hasZerodha ? 'zerodha' : 'fivepaisa');

  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>TradeOn</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={styles.close}>Close</Text>
              </Pressable>
            </View>
            <Text style={styles.subtitle}>Exchange broker session for today&apos;s trading.</Text>
            <View style={styles.tabs}>
              <TabButton
                label="Zerodha"
                active={tab === 'zerodha'}
                disabled={!user?.hasZerodha}
                onPress={() => setTab('zerodha')}
              />
              <TabButton
                label="5paisa"
                active={tab === 'fivepaisa'}
                disabled={!user?.hasFivepaisa}
                onPress={() => setTab('fivepaisa')}
              />
            </View>
            <ScrollView
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
            >
              {tab === 'zerodha' ? (
                <ZerodhaForm
                  enabled={Boolean(user?.hasZerodha)}
                  onDone={() => {
                    void refreshMe();
                    onClose();
                  }}
                />
              ) : (
                <FivepaisaForm
                  enabled={Boolean(user?.hasFivepaisa)}
                  onDone={() => {
                    void refreshMe();
                    onClose();
                  }}
                />
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function TabButton({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.tab, active && styles.tabActive, disabled && styles.tabDisabled]}
    >
      <Text
        style={[
          styles.tabText,
          active && styles.tabTextActive,
          disabled && styles.tabTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ZerodhaForm({ enabled, onDone }: { enabled: boolean; onDone: () => void }) {
  const [requestToken, setRequestToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);

  async function openLogin() {
    setError(null);
    setLoadingUrl(true);
    try {
      const url = await endpoints.zerodhaLoginUrl();
      await Linking.openURL(url);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to open Zerodha login'));
    } finally {
      setLoadingUrl(false);
    }
  }

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await endpoints.exchangeZerodha(requestToken.trim());
      onDone();
    } catch (err) {
      setError(extractErrorMessage(err, 'Session exchange failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!enabled) return <EmptyState broker="Zerodha" />;

  return (
    <View>
      <Text style={styles.help}>
        Open the Zerodha login in your browser, complete 2FA, then paste the `request_token` from
        the redirect URL here.
      </Text>
      <Button title="Open Zerodha login" variant="secondary" onPress={openLogin} loading={loadingUrl} />
      <View style={{ height: spacing.md }} />
      <FormField
        label="request_token"
        value={requestToken}
        onChangeText={setRequestToken}
        placeholder="paste from redirect URL"
      />
      {error && <Banner kind="error">{error}</Banner>}
      <View style={{ marginTop: spacing.md }}>
        <Button
          title="Exchange session"
          onPress={onSubmit}
          loading={submitting}
          disabled={!requestToken.trim()}
        />
      </View>
    </View>
  );
}

function FivepaisaForm({ enabled, onDone }: { enabled: boolean; onDone: () => void }) {
  const [totp, setTotp] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await endpoints.exchangeFivepaisa(totp.trim(), pin.trim());
      onDone();
    } catch (err) {
      setError(extractErrorMessage(err, 'TOTP exchange failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!enabled) return <EmptyState broker="5paisa" />;

  return (
    <View>
      <Text style={styles.help}>
        Enter the current 6-digit TOTP from your authenticator and your 4-digit trading PIN.
      </Text>
      <FormField
        label="TOTP"
        value={totp}
        onChangeText={setTotp}
        keyboardType="number-pad"
        maxLength={6}
      />
      <FormField
        label="PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
      />
      {error && <Banner kind="error">{error}</Banner>}
      <View style={{ marginTop: spacing.md }}>
        <Button
          title="Exchange session"
          onPress={onSubmit}
          loading={submitting}
          disabled={!totp.trim() || !pin.trim()}
        />
      </View>
    </View>
  );
}

function EmptyState({ broker }: { broker: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{broker} not configured</Text>
      <Text style={styles.emptyBody}>
        Add your {broker} credentials in the profile section before you can start a session.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetWrap: { maxHeight: '90%' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  close: { fontSize: 14, color: colors.muted },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.md },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: { borderBottomColor: colors.primary },
  tabDisabled: {},
  tabText: { fontSize: 14, color: colors.muted, fontWeight: '500' },
  tabTextActive: { color: colors.text },
  tabTextDisabled: { color: colors.mutedLight },
  body: { paddingBottom: spacing.xl },
  help: { fontSize: 13, color: colors.muted, marginBottom: spacing.md, lineHeight: 18 },
  empty: { paddingVertical: spacing.lg },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  emptyBody: { fontSize: 13, color: colors.muted, lineHeight: 18 },
});
