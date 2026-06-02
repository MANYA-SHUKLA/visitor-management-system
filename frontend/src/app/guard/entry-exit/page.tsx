'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

export default function GuardEntryExitPage() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'guard-entry-exit'],
    queryFn: async () => {
      const res = await api.get('/visits');
      return (res.data.visits as Visit[]).filter((v) =>
        ['approved', 'entered', 'checked_in'].includes(v.status)
      );
    },
    refetchInterval: 10_000,
  });

  async function markEntry(id: string) {
    setBusyId(id);
    setMessage('');
    try {
      await api.patch(`/visits/${id}/entry`);
      setMessage('Entry marked successfully');
      qc.invalidateQueries({ queryKey: ['visits'] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  async function markExit(id: string) {
    setBusyId(id);
    setMessage('');
    try {
      await api.patch(`/visits/${id}/exit`);
      setMessage('Exit marked successfully');
      qc.invalidateQueries({ queryKey: ['visits'] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  const visits = data ?? [];

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold sm:text-2xl">Mark entry / exit</h2>
      <p className="text-sm text-slate-600">
        Manually mark entry when an approved visitor arrives, or exit when they leave.
        You can also use QR scan on the Scan QR page.
      </p>

      {message && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>
      )}

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : visits.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
          No approved or active visitors right now
        </p>
      ) : (
        <ul className="space-y-3">
          {visits.map((v) => {
            const canEntry = v.status === 'approved';
            const canExit =
              v.status === 'entered' || v.status === ('checked_in' as string);
            return (
              <li
                key={v._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium">{v.visitorName}</p>
                  <p className="text-sm text-slate-600">
                    {v.apartment} · {v.purpose}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={v.status} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {canEntry && (
                    <button
                      type="button"
                      disabled={busyId === v._id}
                      onClick={() => markEntry(v._id)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      Mark entry
                    </button>
                  )}
                  {canExit && (
                    <button
                      type="button"
                      disabled={busyId === v._id}
                      onClick={() => markExit(v._id)}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      Mark exit
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
