import { ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import AppShellContent, { AppShellFrame } from '../components/AppShell';
import { LoadingView } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getActiveRouteName } from './getActiveRoute';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ResidentStackParamList, RootStackParamList } from './types';
import ResidentApprovalsScreen from '../screens/resident/ResidentApprovalsScreen';
import ResidentHistoryScreen from '../screens/resident/ResidentHistoryScreen';
import ResidentVisitDetailScreen from '../screens/resident/ResidentVisitDetailScreen';

const Stack = createNativeStackNavigator<ResidentStackParamList>();

const TAB_ROUTES = new Set(['ResidentApprovals', 'ResidentHistory']);

function ScreenScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <AppShellContent>{children}</AppShellContent>
    </ScrollView>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapScreen(Component: React.ComponentType<any>) {
  return function Wrapped(props: any) {
    return (
      <ScreenScroll>
        <Component {...props} />
      </ScreenScroll>
    );
  };
}

export default function ResidentNavigator() {
  const { user, loading, logout } = useAuth('resident');
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentRoute =
    useNavigationState((state) => {
      const route = state.routes.find((r) => r.name === 'Resident');
      if (route?.state) {
        return getActiveRouteName(route.state) || 'ResidentApprovals';
      }
      return 'ResidentApprovals';
    }) ?? 'ResidentApprovals';

  if (loading || !user) {
    return <LoadingView />;
  }

  const activeTab = TAB_ROUTES.has(currentRoute) ? currentRoute : 'ResidentApprovals';

  return (
    <AppShellFrame
      role="resident"
      title="Resident portal"
      userName={user.name}
      onLogout={logout}
      currentRoute={activeTab}
      onNavigate={(route) => {
        if (TAB_ROUTES.has(route)) {
          rootNavigation.navigate('Resident', { screen: route } as never);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ResidentApprovals" component={wrapScreen(ResidentApprovalsScreen)} />
        <Stack.Screen name="ResidentHistory" component={wrapScreen(ResidentHistoryScreen)} />
        <Stack.Screen name="ResidentVisitDetail" component={wrapScreen(ResidentVisitDetailScreen)} />
      </Stack.Navigator>
    </AppShellFrame>
  );
}
