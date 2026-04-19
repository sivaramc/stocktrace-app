import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage, type AdminRow, type AppRole } from '@stocktrace/core';
import { endpoints } from '../platform/api';
import { Button } from '../components/Button';
import { useState } from 'react';

const LIST_KEY = ['admin', 'users'] as const;

export function AdminUsersPage() {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading, isError, error: qErr } = useQuery<AdminRow[]>({
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
    mutationFn: ({ id, role }: { id: number; role: AppRole }) => endpoints.changeUserRole(id, role),
    onSuccess: onMutationSuccess,
    onError: (e) => setError(extractErrorMessage(e, 'Role change failed')),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Admin-only. Activate new sign-ups so they can log in.</p>
      </div>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {isLoading && <div className="text-sm text-slate-500">Loading…</div>}
      {isError && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {extractErrorMessage(qErr, 'Failed to load users')}
        </div>
      )}
      {data && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Display name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Brokers</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => {
                const busyId = activate.isPending || deactivate.isPending || changeRole.isPending;
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-2 text-slate-900">{row.email}</td>
                    <td className="px-4 py-2 text-slate-600">{row.displayName ?? '—'}</td>
                    <td className="px-4 py-2">
                      <select
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        value={row.role}
                        onChange={(e) => changeRole.mutate({ id: row.id, role: e.target.value as AppRole })}
                        disabled={busyId}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          row.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {[row.hasZerodha && 'Zerodha', row.hasFivepaisa && '5paisa'].filter(Boolean).join(', ') ||
                        '—'}
                    </td>
                    <td className="px-4 py-2 text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      {row.active ? (
                        <Button
                          variant="secondary"
                          onClick={() => deactivate.mutate(row.id)}
                          loading={deactivate.isPending && deactivate.variables === row.id}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          onClick={() => activate.mutate(row.id)}
                          loading={activate.isPending && activate.variables === row.id}
                        >
                          Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
