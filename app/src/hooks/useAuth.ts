import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../lib/api';
import { clearSession, getStoredUser, getToken } from '../lib/auth';
import type { RootStackParamList } from '../navigation/types';
import type { User, UserRole } from '../types';

export function useAuth(requiredRole?: UserRole) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = await getToken();
      const stored = await getStoredUser();

      if (!token || !stored) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      if (requiredRole && stored.role !== requiredRole) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const u = res.data.user as User;
        if (requiredRole && u.role !== requiredRole) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }
        if (!cancelled) setUser(u);
      } catch {
        await clearSession();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [navigation, requiredRole]);

  const logout = useCallback(async () => {
    await clearSession();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  return { user, loading, logout };
}
