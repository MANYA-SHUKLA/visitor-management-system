'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import VisitTable from '@/components/VisitTable';
import type { Visit, VisitStatus } from '@/types';

export default function AdminVisitsPage() {
  const [status, setStatus] = useState<VisitStatus | ''>('');
  const [apartment, setApartment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'admin', status, apartment],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (apartment) params.apartment = apartment;
      const res = await api.get('/visits', { params });
      return res.data.visits as Visit[];
    },
  });

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold sm:text-2xl">All visits</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as VisitStatus | '')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="entered">Entered</option>
          <option value="exited">Exited</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Filter by apartment"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <VisitTable visits={data ?? []} detailPrefix="/admin/visits" />
      )}
    </div>
  );
}
