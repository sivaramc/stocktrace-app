import { type FormEvent, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormField } from './FormField';
import { extractErrorMessage } from '@stocktrace/core';
import { endpoints } from '../platform/api';
import { useAuth } from '../auth/AuthProvider';

type BrokerTab = 'zerodha' | 'fivepaisa';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TradeOnModal({ open, onClose }: Props) {
  const { user, refreshMe } = useAuth();
  const defaultTab: BrokerTab = user?.hasZerodha ? 'zerodha' : 'fivepaisa';
  const [tab, setTab] = useState<BrokerTab>(defaultTab);

  return (
    <Modal open={open} title="TradeOn — exchange broker session" onClose={onClose}>
      <div className="mb-4 flex gap-2 border-b">
        <TabButton active={tab === 'zerodha'} disabled={!user?.hasZerodha} onClick={() => setTab('zerodha')}>
          Zerodha
        </TabButton>
        <TabButton
          active={tab === 'fivepaisa'}
          disabled={!user?.hasFivepaisa}
          onClick={() => setTab('fivepaisa')}
        >
          5paisa
        </TabButton>
      </div>
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
    </Modal>
  );
}

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        disabled
          ? 'border-transparent text-slate-300 cursor-not-allowed'
          : active
            ? 'border-slate-900 text-slate-900'
            : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function ZerodhaForm({ enabled, onDone }: { enabled: boolean; onDone: () => void }) {
  const [requestToken, setRequestToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  async function openLogin() {
    setError(null);
    setLoadingUrl(true);
    // Open the tab synchronously from the click handler so the browser treats it as
    // a user gesture, then navigate it once the fetch resolves. We cannot pass
    // 'noopener' here because it forces window.open to return null, which would
    // leave us without a handle to navigate; instead we null out `opener` on the
    // new window manually.
    const win = window.open('about:blank', '_blank');
    if (win) win.opener = null;
    try {
      const url = await endpoints.zerodhaLoginUrl();
      setLoginUrl(url);
      if (win) win.location.href = url;
    } catch (err) {
      if (win) win.close();
      setError(extractErrorMessage(err, 'Failed to fetch login URL'));
    } finally {
      setLoadingUrl(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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

  if (!enabled) {
    return <EmptyState broker="Zerodha" />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Open the Zerodha login page in a new tab, complete 2FA, then paste the
        <code className="mx-1 rounded bg-slate-100 px-1 text-xs">request_token</code>
        from the redirect URL.
      </p>
      <Button variant="secondary" onClick={openLogin} loading={loadingUrl}>
        {loginUrl ? 'Reopen Zerodha login' : 'Open Zerodha login'}
      </Button>
      <FormField
        label="request_token"
        placeholder="paste from redirect URL"
        value={requestToken}
        onChange={(e) => setRequestToken(e.target.value)}
        required
      />
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={!requestToken.trim()}>
          Exchange session
        </Button>
      </div>
    </form>
  );
}

function FivepaisaForm({ enabled, onDone }: { enabled: boolean; onDone: () => void }) {
  const [totp, setTotp] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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

  if (!enabled) {
    return <EmptyState broker="5paisa" />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Enter your 6-digit TOTP and PIN. Stocktrace exchanges them with 5paisa and stores the returned JWT for
        today's trading session.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="TOTP"
          inputMode="numeric"
          maxLength={6}
          pattern="\d{6}"
          required
          value={totp}
          onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
        />
        <FormField
          label="PIN"
          type="password"
          required
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </div>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={totp.length !== 6 || !pin}>
          Exchange session
        </Button>
      </div>
    </form>
  );
}

function EmptyState({ broker }: { broker: string }) {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
      No {broker} account linked to this user. Add broker credentials under your profile first.
    </div>
  );
}
