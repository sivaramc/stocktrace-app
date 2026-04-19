import { type FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { extractErrorMessage } from '@stocktrace/core';

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/stocks';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use <Navigate> during render rather than calling navigate() imperatively,
  // which would be a side effect during render.
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">stocktrace</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to your account</p>
        <form onSubmit={onSubmit} className="space-y-4">
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
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <Button type="submit" loading={submitting} className="w-full">
            Sign in
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="text-slate-900 font-medium hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
