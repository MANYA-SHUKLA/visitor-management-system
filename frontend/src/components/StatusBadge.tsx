import type { VisitStatus } from '@/types';

const styles: Record<VisitStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  entered: 'bg-blue-100 text-blue-800',
  exited: 'bg-slate-100 text-slate-700',
};

const labels: Record<VisitStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  entered: 'Entered',
  exited: 'Exited',
};

export function displayStatus(status: string): VisitStatus {
  if (status === 'checked_in') return 'entered';
  if (status === 'checked_out') return 'exited';
  return status as VisitStatus;
}

export default function StatusBadge({ status }: { status: string }) {
  const key = displayStatus(status);
  const style = styles[key] ?? 'bg-slate-100 text-slate-700';
  const label = labels[key] ?? status;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
