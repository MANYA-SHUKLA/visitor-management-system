'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import VisitTable from '@/components/VisitTable';
import type { Visit, VisitStatus } from '@/types';

export default function GuardVisitsPage() {
  const [status, setStatus] = useState<VisitStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'guard', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const res = await api.get('/visits', { params });
      return res.data.visits as Visit[];
    },
    refetchInterval: 10_000,
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">Visitor status</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as VisitStatus | '')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="entered">Entered</option>
          <option value="exited">Exited</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <VisitTable visits={data ?? []} detailPrefix="/guard/visits" />
      )}
    </div>
  );
}
