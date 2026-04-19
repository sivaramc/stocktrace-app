import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  extractErrorMessage,
  type BrokerProfiles,
  type FivePaisaProfile,
  type RegisterRequest,
  type ZerodhaProfile,
} from '@stocktrace/core';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { FormField } from '../../src/components/FormField';
import { endpoints } from '../../src/platform/api';
import { colors, radius, spacing } from '../../src/theme/colors';

type Broker = 'none' | 'zerodha' | 'fivepaisa';

const EMPTY_ZERODHA: ZerodhaProfile = {
  brokerUserId: '',
  apiKey: '',
  apiSecret: '',
};

const EMPTY_FIVEPAISA: FivePaisaProfile = {
  brokerUserId: '',
  appName: '',
  encryptKey: '',
  userKey: '',
  fivepaisaUserId: '',
  password: '',
  loginId: '',
  clientCode: '',
};

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [broker, setBroker] = useState<Broker>('none');
  const [zerodha, setZerodha] = useState<ZerodhaProfile>(EMPTY_ZERODHA);
  const [fivepaisa, setFivepaisa] = useState<FivePaisaProfile>(EMPTY_FIVEPAISA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const brokers: BrokerProfiles = {};
      if (broker === 'zerodha') brokers.zerodha = zerodha;
      if (broker === 'fivepaisa') brokers.fivepaisa = fivepaisa;

      const body: RegisterRequest = {
        email,
        password,
        displayName: displayName || null,
        brokers: broker === 'none' ? null : brokers,
      };
      await endpoints.register(body);
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerPad}>
          <View style={styles.card}>
            <Text style={styles.title}>Registered</Text>
            <Text style={styles.subtitle}>
              Your account has been created but is awaiting admin activation. You&apos;ll be able to
              sign in once an administrator approves it.
            </Text>
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Back to sign in" onPress={() => router.replace('/login')} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Register with stocktrace. Accounts require admin activation before first login.
            </Text>
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
            />
            <FormField
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              hint="Minimum 8 characters"
            />

            <Text style={styles.legend}>Broker (optional)</Text>
            <View style={styles.radioRow}>
              <RadioPill label="None" selected={broker === 'none'} onPress={() => setBroker('none')} />
              <RadioPill
                label="Zerodha"
                selected={broker === 'zerodha'}
                onPress={() => setBroker('zerodha')}
              />
              <RadioPill
                label="5paisa"
                selected={broker === 'fivepaisa'}
                onPress={() => setBroker('fivepaisa')}
              />
            </View>

            {broker === 'zerodha' && (
              <View style={styles.section}>
                <FormField
                  label="Kite user ID"
                  value={zerodha.brokerUserId}
                  onChangeText={(t) => setZerodha((z) => ({ ...z, brokerUserId: t }))}
                />
                <FormField
                  label="API key"
                  value={zerodha.apiKey}
                  onChangeText={(t) => setZerodha((z) => ({ ...z, apiKey: t }))}
                />
                <FormField
                  label="API secret"
                  value={zerodha.apiSecret}
                  onChangeText={(t) => setZerodha((z) => ({ ...z, apiSecret: t }))}
                  secureTextEntry
                />
              </View>
            )}

            {broker === 'fivepaisa' && (
              <View style={styles.section}>
                <FormField
                  label="Broker user ID"
                  value={fivepaisa.brokerUserId}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, brokerUserId: t }))}
                />
                <FormField
                  label="App name"
                  value={fivepaisa.appName}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, appName: t }))}
                />
                <FormField
                  label="Encrypt key"
                  value={fivepaisa.encryptKey}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, encryptKey: t }))}
                  secureTextEntry
                />
                <FormField
                  label="User key"
                  value={fivepaisa.userKey}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, userKey: t }))}
                  secureTextEntry
                />
                <FormField
                  label="5paisa user ID"
                  value={fivepaisa.fivepaisaUserId}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, fivepaisaUserId: t }))}
                />
                <FormField
                  label="Password"
                  value={fivepaisa.password}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, password: t }))}
                  secureTextEntry
                />
                <FormField
                  label="Login ID"
                  value={fivepaisa.loginId}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, loginId: t }))}
                />
                <FormField
                  label="Client code"
                  value={fivepaisa.clientCode}
                  onChangeText={(t) => setFivepaisa((f) => ({ ...f, clientCode: t }))}
                />
              </View>
            )}

            {error && <Banner kind="error">{error}</Banner>}
            <View style={{ marginTop: spacing.md }}>
              <Button title="Create account" onPress={onSubmit} loading={submitting} />
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already registered? </Text>
              <Link href="/login" style={styles.link}>
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RadioPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected ? styles.pillSelected : undefined]}
    >
      <Text style={[styles.pillText, selected ? styles.pillTextSelected : undefined]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centerPad: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: spacing.lg },
  legend: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  radioRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  pillTextSelected: { color: colors.primaryText },
  section: { marginTop: spacing.md, gap: 0 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.text, fontWeight: '600', fontSize: 14 },
});
