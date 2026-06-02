import { ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppShellContent, { AppShellFrame } from '../components/AppShell';
import { LoadingView } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getActiveRouteName } from './getActiveRoute';
import type { GuardStackParamList, RootStackParamList } from './types';
import GuardDashboardScreen from '../screens/guard/GuardDashboardScreen';
import GuardRegisterScreen from '../screens/guard/GuardRegisterScreen';
import GuardVisitsScreen from '../screens/guard/GuardVisitsScreen';
import GuardVisitDetailScreen from '../screens/guard/GuardVisitDetailScreen';
import GuardEntryExitScreen from '../screens/guard/GuardEntryExitScreen';
import GuardScanScreen from '../screens/guard/GuardScanScreen';

const Stack = createNativeStackNavigator<GuardStackParamList>();

const TAB_ROUTES = new Set([
  'GuardDashboard',
  'GuardRegister',
  'GuardVisits',
  'GuardEntryExit',
  'GuardScan',
]);

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

function wrapScreen(Component: React.ComponentType<any>) {
  return function Wrapped(props: any) {
    return (
      <ScreenScroll>
        <Component {...props} />
      </ScreenScroll>
    );
  };
}

export default function GuardNavigator() {
  const { user, loading, logout } = useAuth('guard');
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentRoute =
    useNavigationState((state) => {
      const guardRoute = state.routes.find((r) => r.name === 'Guard');
      if (guardRoute?.state) {
        return getActiveRouteName(guardRoute.state) || 'GuardDashboard';
      }
      return 'GuardDashboard';
    }) ?? 'GuardDashboard';

  if (loading || !user) {
    return <LoadingView />;
  }

  const activeTab = TAB_ROUTES.has(currentRoute) ? currentRoute : 'GuardDashboard';

  return (
    <AppShellFrame
      role="guard"
      title="Guard portal"
      userName={user.name}
      onLogout={logout}
      currentRoute={activeTab}
      onNavigate={(route) => {
        if (TAB_ROUTES.has(route)) {
          rootNavigation.navigate('Guard', {
            screen: route,
          } as never);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GuardDashboard" component={wrapScreen(GuardDashboardScreen)} />
        <Stack.Screen name="GuardRegister" component={wrapScreen(GuardRegisterScreen)} />
        <Stack.Screen name="GuardVisits" component={wrapScreen(GuardVisitsScreen)} />
        <Stack.Screen name="GuardVisitDetail" component={wrapScreen(GuardVisitDetailScreen)} />
        <Stack.Screen name="GuardEntryExit" component={wrapScreen(GuardEntryExitScreen)} />
        <Stack.Screen name="GuardScan" component={wrapScreen(GuardScanScreen)} />
      </Stack.Navigator>
    </AppShellFrame>
  );
}
