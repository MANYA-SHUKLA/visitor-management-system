'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import type { Visit } from '@/types';

export default function VisitTable({
  visits,
  detailPrefix,
}: {
  visits: Visit[];
  detailPrefix: string;
}) {
  if (visits.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-slate-500 sm:px-6">
        No visits found
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {visits.map((v) => (
          <li
            key={v._id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{v.visitorName}</p>
                <p className="mt-1 text-sm text-slate-600">{v.apartment}</p>
                <p className="mt-1 text-sm text-slate-500">{v.purpose}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(v.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={v.status} />
            </div>
            <Link
              href={`${detailPrefix}/${v._id}`}
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              View details →
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Visitor</th>
              <th className="px-4 py-3 font-medium">Apartment</th>
              <th className="px-4 py-3 font-medium">Purpose</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{v.visitorName}</td>
                <td className="px-4 py-3">{v.apartment}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-600">{v.purpose}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(v.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`${detailPrefix}/${v._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
