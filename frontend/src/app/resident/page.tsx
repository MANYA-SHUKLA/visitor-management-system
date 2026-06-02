'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

function RejectModal({
  visitorName,
  onConfirm,
  onCancel,
  busy,
}: {
  visitorName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Reject visitor</h3>
        <p className="mt-1 text-sm text-slate-500">
          Rejecting <span className="font-medium text-slate-700">{visitorName}</span>
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">
            Reason <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Not expecting anyone today"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(reason)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResidentApprovalsPage() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Visit | null>(null);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve';
      setError(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    const id = rejectTarget._id;
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/visits/${id}/reject`, { reason });
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject';
      setError(msg);
    } finally {
      setBusyId(null);
      setRejectTarget(null);
    }
  }

  const pending = data ?? [];

  return (
    <>
      {rejectTarget && (
        <RejectModal
          visitorName={rejectTarget.visitorName}
          busy={busyId === rejectTarget._id}
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold sm:text-2xl">Pending approvals</h2>
          {pending.length > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              {pending.length} waiting
            </span>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {isLoading ? (
          <p className="text-slate-500">Loading…</p>
        ) : pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-2xl">✓</p>
            <p className="mt-2 font-medium text-slate-700">All caught up</p>
            <p className="mt-1 text-sm text-slate-500">No pending visitor requests</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {pending.map((v) => (
              <li
                key={v._id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-slate-900">{v.visitorName}</p>
                    <p className="text-sm text-slate-500">{v.visitorPhone}</p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-medium">Purpose:</span> {v.purpose}
                    </p>
                    {v.expectedAt && (
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium">Expected:</span>{' '}
                        {new Date(v.expectedAt).toLocaleString()}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      Registered {new Date(v.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={busyId === v._id}
                    onClick={() => approve(v._id)}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    {busyId === v._id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === v._id}
                    onClick={() => setRejectTarget(v)}
                    className="rounded-lg border border-red-300 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <Link
                    href={`/resident/visits/${v._id}`}
                    className="ml-auto rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    View details →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
