'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import type { UserRole } from '@/types';

type NavItem = { href: string; label: string };

const navByRole: Record<UserRole, NavItem[]> = {
  guard: [
    { href: '/guard', label: 'Dashboard' },
    { href: '/guard/register', label: 'Register visitor' },
    { href: '/guard/visits', label: 'Visitor status' },
    { href: '/guard/entry-exit', label: 'Entry / Exit' },
    { href: '/guard/scan', label: 'Scan QR' },
  ],
  resident: [
    { href: '/resident', label: 'Approvals' },
    { href: '/resident/history', label: 'History' },
  ],
  admin: [
    { href: '/admin', label: 'Analytics' },
    { href: '/admin/visits', label: 'All visits' },
  ],
};

export default function AppShell({
  role,
  title,
  userName,
  onLogout,
  children,
}: {
  role: UserRole;
  title: string;
  userName: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = navByRole[role];

  return (
    <div className="flex min-h-full w-full min-w-0 flex-1 flex-col bg-slate-50">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Visitor Management
            </p>
            <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <NotificationBell />
            <span className="max-w-[8rem] truncate text-sm text-slate-600 sm:max-w-none">
              {userName}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="flex w-full gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
