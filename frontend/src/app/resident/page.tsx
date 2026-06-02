'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

export default function ResidentApprovalsPage() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['visits', 'resident-pending'],
    queryFn: async () => {
      const res = await api.get('/visits', { params: { status: 'pending' } });
      return res.data.visits as Visit[];
    },
    refetchInterval: 10_000,
  });

  async function approve(id: string) {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/visits/${id}/approve`);
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const reason = window.prompt('Reason for rejection (optional)') || '';
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/visits/${id}/reject`, { reason });
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  const pending = data ?? [];

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold sm:text-2xl">Pending approvals</h2>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : pending.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
          No pending visitors
        </p>
      ) : (
        <ul className="space-y-4">
          {pending.map((v) => (
            <li
              key={v._id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{v.visitorName}</p>
                  <p className="text-sm text-slate-600">{v.visitorPhone}</p>
                  <p className="mt-2 text-sm">{v.purpose}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Registered {new Date(v.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={v.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === v._id}
                  onClick={() => approve(v._id)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === v._id}
                  onClick={() => reject(v._id)}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  Reject
                </button>
                <Link
                  href={`/resident/visits/${v._id}`}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
