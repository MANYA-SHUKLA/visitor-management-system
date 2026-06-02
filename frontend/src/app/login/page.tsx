'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { roleHome, setSession } from '@/lib/auth';
import type { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data as { token: string; user: User };
      setSession(token, user);
      router.replace(roleHome(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Visitor Management System
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="guard@shuklamanya99.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-medium text-slate-800">Demo accounts</p>
          <ul className="mt-2 space-y-1">
            <li>guard@shuklamanya99.com / guard123</li>
            <li>resident1@shuklamanya99.com / resident123</li>
            <li>resident2@shuklamanya99.com / resident123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
