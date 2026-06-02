'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import api from '@/lib/api';
import type { AnalyticsSummary } from '@/types';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

const RATE_COLORS = ['#16a34a', '#dc2626'];

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/summary');
      return res.data as AnalyticsSummary;
    },
    refetchInterval: 10_000,
  });

  if (isLoading || !data) {
    return <p className="text-slate-500">Loading analytics…</p>;
  }

  const rateData = [
    { name: 'Approval rate', value: data.approvalRate },
    { name: 'Rejection rate', value: data.rejectionRate },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total visitors" value={data.totalVisitors} />
        <StatCard label="Visitors today" value={data.visitorsToday} />
        <StatCard label="Approved" value={data.approvedVisitors} />
        <StatCard label="Rejected" value={data.rejectedVisitors} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={data.pending} />
        <StatCard label="On premises" value={data.onPremise} />
        <StatCard label="Approval rate" value={`${data.approvalRate}%`} />
        <StatCard label="Rejection rate" value={`${data.rejectionRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="font-semibold">Daily visitors (last 7 days)</h3>
          <div className="mt-4 h-56 w-full min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.visitsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="font-semibold">Weekly visitors (last month)</h3>
          <div className="mt-4 h-56 w-full min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.visitsByWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="font-semibold">Approval vs rejection rate</h3>
          <div className="mt-4 h-56 w-full min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rateData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {rateData.map((_, i) => (
                    <Cell key={i} fill={RATE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="font-semibold">Frequent visitors</h3>
          {data.frequentVisitors.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No data yet</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {data.frequentVisitors.map((f) => (
                <li
                  key={`${f.visitorName}-${f.visitorPhone}`}
                  className="flex flex-col gap-1 border-b border-slate-100 pb-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0">
                    {f.visitorName}
                    <span className="block text-xs text-slate-500">{f.visitorPhone}</span>
                  </span>
                  <span className="shrink-0 font-medium">{f.visitCount} visits</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
