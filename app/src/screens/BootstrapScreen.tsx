import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoadingView } from '../components/ui';
import { getStoredUser, getToken, roleHome } from '../lib/auth';
import type { RootStackParamList } from '../navigation/types';

export default function BootstrapScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    async function boot() {
      const token = await getToken();
      const user = await getStoredUser();
      if (token && user) {
        navigation.reset({
          index: 0,
          routes: [{ name: roleHome(user.role) }],
        });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    }
    boot();
  }, [navigation]);

  return <LoadingView />;
}
