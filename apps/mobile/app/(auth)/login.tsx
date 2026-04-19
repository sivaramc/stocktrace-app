import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { extractErrorMessage } from '@stocktrace/core';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { FormField } from '../../src/components/FormField';
import { useAuth } from '../../src/auth/AuthProvider';
import { colors, spacing } from '../../src/theme/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>stocktrace</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
            />
            {error && <Banner kind="error">{error}</Banner>}
            <View style={{ marginTop: spacing.md }}>
              <Button title="Sign in" onPress={onSubmit} loading={submitting} />
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Need an account? </Text>
              <Link href="/register" style={styles.link}>
                Register
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.text, fontWeight: '600', fontSize: 14 },
});
