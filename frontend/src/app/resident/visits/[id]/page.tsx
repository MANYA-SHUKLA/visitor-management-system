'use client';

import { use, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800 break-words">{value}</p>
    </div>
  );
}

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

export default function ResidentVisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const res = await api.get(`/visits/${id}`);
      return res.data.visit as Visit;
    },
  });

  async function approve() {
    setBusy(true);
    setActionError('');
    try {
      await api.patch(`/visits/${id}/approve`);
      await qc.invalidateQueries({ queryKey: ['visit', id] });
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setBusy(false);
    }
  }

  async function confirmReject(reason: string) {
    setBusy(true);
    setActionError('');
    try {
      await api.patch(`/visits/${id}/reject`, { reason });
      await qc.invalidateQueries({ queryKey: ['visit', id] });
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setBusy(false);
      setShowRejectModal(false);
    }
  }

  if (isLoading || !visit) {
    return <p className="text-slate-500">Loading…</p>;
  }

  const isPending = visit.status === 'pending';

  return (
    <>
      {showRejectModal && (
        <RejectModal
          visitorName={visit.visitorName}
          busy={busy}
          onConfirm={confirmReject}
          onCancel={() => setShowRejectModal(false)}
        />
      )}

      <div className="w-full space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold sm:text-2xl">Visit details</h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">{visit.visitorName}</h3>
              <p className="mt-1 text-sm text-slate-500">{visit.visitorPhone}</p>
            </div>
            <StatusBadge status={visit.status} />
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailField label="Purpose" value={visit.purpose} />
            <DetailField label="Apartment" value={visit.apartment} />
            {visit.expectedAt && (
              <DetailField
                label="Expected at"
                value={new Date(visit.expectedAt).toLocaleString()}
              />
            )}
            {visit.approvedAt && (
              <DetailField
                label="Approved at"
                value={new Date(visit.approvedAt).toLocaleString()}
              />
            )}
            {visit.rejectedAt && (
              <DetailField
                label="Rejected at"
                value={new Date(visit.rejectedAt).toLocaleString()}
              />
            )}
            {visit.rejectReason && (
              <DetailField label="Reject reason" value={visit.rejectReason} />
            )}
            {visit.entryAt && (
              <DetailField label="Entry" value={new Date(visit.entryAt).toLocaleString()} />
            )}
            {visit.exitAt && (
              <DetailField label="Exit" value={new Date(visit.exitAt).toLocaleString()} />
            )}
            <DetailField
              label="Registered"
              value={new Date(visit.createdAt).toLocaleString()}
            />
          </dl>

          {actionError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </p>
          )}

          {isPending && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <p className="w-full text-sm font-medium text-slate-700">
                Action required — approve or reject this visitor:
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={approve}
                className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
              >
                {busy ? 'Processing…' : 'Approve'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowRejectModal(true)}
                className="rounded-lg border border-red-300 px-6 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
