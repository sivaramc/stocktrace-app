import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

export function ProfilePage() {
  const { user, refreshMe } = useAuth();

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Account details and broker session state.</p>
      </div>

      <section className="rounded-lg bg-white border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-3">Account</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Display name" value={user.displayName ?? '—'} />
          <Row label="Role" value={user.role} />
          <Row label="Active" value={user.active ? 'yes' : 'no'} />
          <Row label="Created" value={new Date(user.createdAt).toLocaleString()} />
        </dl>
      </section>

      <section className="rounded-lg bg-white border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-3">Brokers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <BrokerCard
            title="Zerodha"
            linked={user.hasZerodha}
            expiresAt={user.zerodhaAccessTokenExpiresAt}
          />
          <BrokerCard
            title="5paisa"
            linked={user.hasFivepaisa}
            expiresAt={user.fivepaisaJwtExpiresAt}
          />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}

function BrokerCard({
  title,
  linked,
  expiresAt,
}: {
  title: string;
  linked: boolean;
  expiresAt: string | null;
}) {
  if (!linked) {
    return (
      <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">
        No {title} account linked.
      </div>
    );
  }
  // The backend only fills expiresAt when a session was exchanged this session; treat presence as "live".
  const live = Boolean(expiresAt);
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-slate-900">{title}</div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            live ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {live ? 'session live' : 'needs TradeOn'}
        </span>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {expiresAt ? `Expires ${new Date(expiresAt).toLocaleString()}` : 'No active session'}
      </div>
    </div>
  );
}
