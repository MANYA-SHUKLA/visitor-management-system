import { ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppShellContent, { AppShellFrame } from '../components/AppShell';
import { LoadingView } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getActiveRouteName } from './getActiveRoute';
import type { AdminStackParamList, RootStackParamList } from './types';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminVisitsScreen from '../screens/admin/AdminVisitsScreen';
import AdminVisitDetailScreen from '../screens/admin/AdminVisitDetailScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

const TAB_ROUTES = new Set(['AdminAnalytics', 'AdminVisits']);

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

function wrapScreen(Component: React.ComponentType<any>, scroll = true) {
  return function Wrapped(props: any) {
    if (!scroll) {
      return (
        <AppShellContent style={{ flex: 1 }}>
          <Component {...props} />
        </AppShellContent>
      );
    }
    return (
      <ScreenScroll>
        <Component {...props} />
      </ScreenScroll>
    );
  };
}

export default function AdminNavigator() {
  const { user, loading, logout } = useAuth('admin');
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentRoute =
    useNavigationState((state) => {
      const route = state.routes.find((r) => r.name === 'Admin');
      if (route?.state) {
        return getActiveRouteName(route.state) || 'AdminAnalytics';
      }
      return 'AdminAnalytics';
    }) ?? 'AdminAnalytics';

  if (loading || !user) {
    return <LoadingView />;
  }

  const activeTab = TAB_ROUTES.has(currentRoute) ? currentRoute : 'AdminAnalytics';

  return (
    <AppShellFrame
      role="admin"
      title="Admin dashboard"
      userName={user.name}
      onLogout={logout}
      currentRoute={activeTab}
      onNavigate={(route) => {
        if (TAB_ROUTES.has(route)) {
          rootNavigation.navigate('Admin', { screen: route } as never);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="AdminAnalytics"
          component={wrapScreen(AdminAnalyticsScreen, false)}
        />
        <Stack.Screen name="AdminVisits" component={wrapScreen(AdminVisitsScreen)} />
        <Stack.Screen name="AdminVisitDetail" component={wrapScreen(AdminVisitDetailScreen)} />
      </Stack.Navigator>
    </AppShellFrame>
  );
}
