import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole } from '../types';

const TOKEN_KEY = 'vms_token';
const USER_KEY = 'vms_user';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function setSession(token: string, user: User): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export type RoleHomeScreen = 'Guard' | 'Resident' | 'Admin';

export function roleHome(role: UserRole): RoleHomeScreen {
  if (role === 'guard') return 'Guard';
  if (role === 'resident') return 'Resident';
  return 'Admin';
}
