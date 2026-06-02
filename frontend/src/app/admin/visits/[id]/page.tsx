'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import type { Visit } from '@/types';

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium break-words">{value}</p>
    </div>
  );
}

export default function AdminVisitDetailPage({
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

  if (isLoading || !visit) {
    return <p className="text-slate-500">Loading…</p>;
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="text-xl font-semibold sm:text-2xl">{visit.visitorName}</h2>
        <StatusBadge status={visit.status} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Apartment" value={visit.apartment} />
        <DetailField label="Phone" value={visit.visitorPhone} />
        <DetailField label="Purpose" value={visit.purpose} />
        <DetailField label="Resident" value={visit.residentId?.name ?? '—'} />
        <DetailField label="Guard" value={visit.registeredByGuardId?.name ?? '—'} />
        {visit.entryAt && (
          <DetailField label="Entry" value={new Date(visit.entryAt).toLocaleString()} />
        )}
        {visit.exitAt && (
          <DetailField label="Exit" value={new Date(visit.exitAt).toLocaleString()} />
        )}
      </dl>
    </div>
  );
}
