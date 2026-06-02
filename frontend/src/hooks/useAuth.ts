'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { clearSession, getStoredUser, getToken } from '@/lib/auth';
import type { User, UserRole } from '@/types';

export function useAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();

    if (!token || !stored) {
      router.replace('/login');
      return;
    }

    if (requiredRole && stored.role !== requiredRole) {
      router.replace('/login');
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        const u = res.data.user as User;
        if (requiredRole && u.role !== requiredRole) {
          router.replace('/login');
          return;
        }
        setUser(u);
      })
      .catch(() => {
        clearSession();
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router, requiredRole]);

  function logout() {
    clearSession();
    router.replace('/login');
  }

  return { user, loading, logout };
}
