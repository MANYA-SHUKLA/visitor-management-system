'use client';

import AppShell from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth('resident');

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <AppShell role="resident" title="Resident portal" userName={user.name} onLogout={logout}>
      {children}
    </AppShell>
  );
}
