import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import {
  extractErrorMessage,
  type BrokerProfiles,
  type FivePaisaProfile,
  type RegisterRequest,
  type ZerodhaProfile,
} from '@stocktrace/core';
import { endpoints } from '../platform/api';

type Broker = 'none' | 'zerodha' | 'fivepaisa';

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [broker, setBroker] = useState<Broker>('none');
  const [zerodha, setZerodha] = useState<ZerodhaProfile>({
    brokerUserId: '',
    apiKey: '',
    apiSecret: '',
  });
  const [fivepaisa, setFivepaisa] = useState<FivePaisaProfile>({
    brokerUserId: '',
    appName: '',
    encryptKey: '',
    userKey: '',
    fivepaisaUserId: '',
    password: '',
    loginId: '',
    clientCode: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
      <div className="min-h-full flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Registered</h1>
          <p className="text-sm text-slate-600">
            Your account has been created but is awaiting admin activation. You'll be able to sign in once an
            administrator approves it.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate('/login')}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">
          Register with stocktrace. Accounts require admin activation before first login.
        </p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label="Display name"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              hint="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <fieldset className="border border-slate-200 rounded p-4">
            <legend className="text-sm font-medium text-slate-700 px-2">Broker (optional)</legend>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="broker"
                  value="none"
                  checked={broker === 'none'}
                  onChange={() => setBroker('none')}
                />
                None yet
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="broker"
                  value="zerodha"
                  checked={broker === 'zerodha'}
                  onChange={() => setBroker('zerodha')}
                />
                Zerodha
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="broker"
                  value="fivepaisa"
                  checked={broker === 'fivepaisa'}
                  onChange={() => setBroker('fivepaisa')}
                />
                5paisa
              </label>
            </div>

            {broker === 'zerodha' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Zerodha user id"
                  required
                  value={zerodha.brokerUserId}
                  onChange={(e) => setZerodha({ ...zerodha, brokerUserId: e.target.value })}
                />
                <FormField
                  label="API key"
                  required
                  value={zerodha.apiKey}
                  onChange={(e) => setZerodha({ ...zerodha, apiKey: e.target.value })}
                />
                <FormField
                  label="API secret"
                  type="password"
                  required
                  value={zerodha.apiSecret}
                  onChange={(e) => setZerodha({ ...zerodha, apiSecret: e.target.value })}
                />
              </div>
            )}

            {broker === 'fivepaisa' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Broker user id"
                  required
                  value={fivepaisa.brokerUserId}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, brokerUserId: e.target.value })}
                />
                <FormField
                  label="Client code"
                  required
                  value={fivepaisa.clientCode}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, clientCode: e.target.value })}
                />
                <FormField
                  label="Login id"
                  required
                  value={fivepaisa.loginId}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, loginId: e.target.value })}
                />
                <FormField
                  label="5paisa user id"
                  required
                  value={fivepaisa.fivepaisaUserId}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, fivepaisaUserId: e.target.value })}
                />
                <FormField
                  label="App name"
                  required
                  value={fivepaisa.appName}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, appName: e.target.value })}
                />
                <FormField
                  label="User key"
                  required
                  value={fivepaisa.userKey}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, userKey: e.target.value })}
                />
                <FormField
                  label="Encrypt key"
                  type="password"
                  required
                  value={fivepaisa.encryptKey}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, encryptKey: e.target.value })}
                />
                <FormField
                  label="Password"
                  type="password"
                  required
                  value={fivepaisa.password}
                  onChange={(e) => setFivepaisa({ ...fivepaisa, password: e.target.value })}
                />
              </div>
            )}
          </fieldset>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm text-slate-600 hover:underline">
              Already have an account? Sign in
            </Link>
            <Button type="submit" loading={submitting}>
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
