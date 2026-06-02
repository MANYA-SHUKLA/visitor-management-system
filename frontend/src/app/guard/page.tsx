'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

export default function GuardDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'guard-recent'],
    queryFn: async () => {
      const res = await api.get('/visits');
      return (res.data.visits as Visit[]).slice(0, 5);
    },
    refetchInterval: 10_000,
  });

  const visits = data ?? [];

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/guard/register"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300"
        >
          <p className="font-semibold">Register visitor</p>
          <p className="mt-1 text-sm text-slate-600">New entry for resident approval</p>
        </Link>
        <Link
          href="/guard/scan"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300"
        >
          <p className="font-semibold">Scan QR</p>
          <p className="mt-1 text-sm text-slate-600">Check in or check out visitors</p>
        </Link>
        <Link
          href="/guard/visits"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300"
        >
          <p className="font-semibold">All visits</p>
          <p className="mt-1 text-sm text-slate-600">View full history</p>
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent registrations</h2>
        {isLoading ? (
          <p className="text-slate-500">Loading…</p>
        ) : visits.length === 0 ? (
          <p className="text-slate-500">No visits yet</p>
        ) : (
          <ul className="space-y-2">
            {visits.map((v) => (
              <li
                key={v._id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{v.visitorName}</p>
                  <p className="text-sm text-slate-600">
                    {v.apartment} · {v.purpose}
                  </p>
                </div>
                <StatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
