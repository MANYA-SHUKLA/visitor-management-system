'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, getToken, roleHome } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      router.replace(roleHome(user.role));
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-slate-500">Loading…</p>
    </div>
  );
}
