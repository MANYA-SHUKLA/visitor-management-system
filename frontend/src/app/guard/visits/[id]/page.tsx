'use client';

import { use } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

export default function GuardVisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const res = await api.get(`/visits/${id}`);
      return res.data.visit as Visit;
    },
  });

  const { data: qr } = useQuery({
    queryKey: ['visit-qr', id],
    queryFn: async () => {
      const res = await api.get(`/visits/${id}/qr`);
      return res.data as { dataUrl: string; qrToken: string };
    },
    enabled:
      !!visit &&
      ['approved', 'entered', 'exited', 'checked_in', 'checked_out'].includes(
        visit.status
      ),
    retry: false,
  });

  if (isLoading || !visit) {
    return <p className="text-slate-500">Loading…</p>;
  }

  return (
    <div className="grid w-full gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-xl font-semibold sm:text-2xl">{visit.visitorName}</h2>
          <StatusBadge status={visit.status} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 p-3">
            <dt className="text-slate-500">Apartment</dt>
            <dd className="mt-0.5 font-medium">{visit.apartment}</dd>
          </div>
          <div className="rounded-lg border border-slate-100 p-3">
            <dt className="text-slate-500">Phone</dt>
            <dd className="mt-0.5 font-medium break-all">{visit.visitorPhone}</dd>
          </div>
          <div className="rounded-lg border border-slate-100 p-3 sm:col-span-2">
            <dt className="text-slate-500">Purpose</dt>
            <dd className="mt-0.5 font-medium">{visit.purpose}</dd>
          </div>
          {visit.entryAt && (
            <div className="rounded-lg border border-slate-100 p-3">
              <dt className="text-slate-500">Entry</dt>
              <dd className="mt-0.5 font-medium">{new Date(visit.entryAt).toLocaleString()}</dd>
            </div>
          )}
          {visit.exitAt && (
            <div className="rounded-lg border border-slate-100 p-3">
              <dt className="text-slate-500">Exit</dt>
              <dd className="mt-0.5 font-medium">{new Date(visit.exitAt).toLocaleString()}</dd>
            </div>
          )}
        </dl>
      </div>

      {qr?.dataUrl && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center sm:p-6">
          <p className="mb-4 font-medium">Visitor QR code</p>
          <Image
            src={qr.dataUrl}
            alt="Visitor QR"
            width={280}
            height={280}
            unoptimized
            className="mx-auto"
          />
          <p className="mt-4 text-xs text-slate-500 break-all">{qr.qrToken}</p>
        </div>
      )}
    </div>
  );
}
