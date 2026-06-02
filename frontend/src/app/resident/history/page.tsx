'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import VisitTable from '@/components/VisitTable';
import type { Visit, VisitStatus, HistoryPeriod } from '@/types';

export default function ResidentHistoryPage() {
  const [status, setStatus] = useState<VisitStatus | ''>('');
  const [period, setPeriod] = useState<HistoryPeriod>('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'resident-history', status, period],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (period) params.period = period;
      const res = await api.get('/visits', { params });
      return res.data.visits as Visit[];
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">Visitor history</h2>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as HistoryPeriod)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All time</option>
            <option value="today">Today</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as VisitStatus | '')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="entered">Entered</option>
            <option value="exited">Exited</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <VisitTable visits={data ?? []} detailPrefix="/resident/visits" />
      )}
    </div>
  );
}
