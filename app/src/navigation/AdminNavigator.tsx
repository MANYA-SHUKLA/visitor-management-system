import { ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppShellContent, { AppShellFrame } from '../components/AppShell';
import { LoadingView } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getActiveRouteName } from './getActiveRoute';
import type { AdminStackParamList } from './types';
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

function wrapScreen(Component: React.ComponentType<object>, scroll = true) {
  return function Wrapped(props: object) {
    if (!scroll) {
      return (
        <AppShellContent>
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
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const navState = useNavigationState((state) => state);
  const currentRoute = getActiveRouteName(navState) || 'AdminAnalytics';

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
          navigation.navigate(route as keyof AdminStackParamList);
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
