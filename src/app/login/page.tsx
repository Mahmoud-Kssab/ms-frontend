'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';

import { usePermissionContext } from '@/features/rbac/providers/permission-provider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('from') || '/dashboard';
  const { login, register } = usePermissionContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login({
          email: form.email,
          password: form.password,
        });
      } else {
        await register(form);
      }

      router.replace(returnTo);
    } catch {
      setError(
        mode === 'login'
          ? 'Invalid email or password.'
          : 'Could not create this user.',
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <section className="w-full max-w-md rounded-md border border-border bg-white p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand text-white">
            {mode === 'login' ? (
              <LogIn aria-hidden="true" size={21} />
            ) : (
              <UserPlus aria-hidden="true" size={21} />
            )}
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              {mode === 'login' ? 'Sign in' : 'Create first user'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {mode === 'login'
                ? 'Access the messaging management workspace.'
                : 'The first registered user receives the Administrator role.'}
            </p>
          </div>
        </div>

        <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
          {mode === 'register' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.firstName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstName: event.target.value }))
                }
                placeholder="First name"
                className="h-11 rounded-md border border-border px-3 text-sm"
                required
              />
              <input
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastName: event.target.value }))
                }
                placeholder="Last name"
                className="h-11 rounded-md border border-border px-3 text-sm"
                required
              />
            </div>
          ) : null}

          <input
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            type="email"
            placeholder="Email"
            className="h-11 w-full rounded-md border border-border px-3 text-sm"
            required
          />
          <input
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            type="password"
            placeholder="Password"
            className="h-11 w-full rounded-md border border-border px-3 text-sm"
            required
            minLength={8}
          />

          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}

          <button
            type="submit"
            className="h-11 w-full rounded-md bg-ink text-sm font-medium text-white"
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError('');
            setMode((current) => (current === 'login' ? 'register' : 'login'));
          }}
          className="mt-5 w-full text-center text-sm font-medium text-brand"
        >
          {mode === 'login'
            ? 'Need the first admin account? Register'
            : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface px-6">
          <div className="text-sm font-medium text-muted">Loading...</div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
