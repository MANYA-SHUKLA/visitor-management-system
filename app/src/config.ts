import Constants from 'expo-constants';

/** Set EXPO_PUBLIC_API_URL in .env (include /api suffix, e.g. https://host/api) */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  'http://localhost:5000/api';
