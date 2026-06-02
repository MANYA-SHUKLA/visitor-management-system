import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationBell from './NotificationBell';
import Footer from './Footer';
import LogoMark from './LogoMark';
import type { UserRole } from '../types';
import { colors } from '../theme/colors';

type NavItem = { route: string; label: string };

const navByRole: Record<UserRole, NavItem[]> = {
  guard: [
    { route: 'GuardDashboard', label: 'Dashboard' },
    { route: 'GuardRegister', label: 'Register visitor' },
    { route: 'GuardVisits', label: 'Visitor status' },
    { route: 'GuardEntryExit', label: 'Entry / Exit' },
    { route: 'GuardScan', label: 'Scan QR' },
  ],
  resident: [
    { route: 'ResidentApprovals', label: 'Approvals' },
    { route: 'ResidentHistory', label: 'History' },
  ],
  admin: [
    { route: 'AdminAnalytics', label: 'Analytics' },
    { route: 'AdminVisits', label: 'All visits' },
  ],
};

export function AppShellFrame({
  role,
  title,
  userName,
  onLogout,
  currentRoute,
  onNavigate,
  children,
}: {
  role: UserRole;
  title: string;
  userName: string;
  onLogout: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const nav = navByRole[role];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleBlock}>
            <View style={styles.brandRow}>
              <LogoMark size={28} />
              <Text style={styles.subtitle}>Visitor Management</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <NotificationBell />
            <Text style={styles.userName} numberOfLines={1}>
              {userName}
            </Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nav}
        >
          {nav.map((item) => {
            const active = currentRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => onNavigate(item.route)}
              >
                <Text style={[styles.navText, active && styles.navTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.content}>{children}</View>
      <Footer />
    </View>
  );
}

/** Wrap screen content with padding (screens manage their own ScrollView). */
export default function AppShellContent({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.screenPadding, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  headerTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleBlock: { flex: 1, minWidth: 120 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.slate500,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.slate900, marginTop: 2 },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    maxWidth: '100%',
  },
  userName: { fontSize: 14, color: colors.slate600, maxWidth: 100 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: { fontSize: 14, color: colors.slate900 },
  nav: { paddingHorizontal: 12, paddingBottom: 12, gap: 4 },
  navItem: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
  },
  navItemActive: { backgroundColor: colors.slate900 },
  navText: { fontSize: 14, fontWeight: '500', color: colors.slate600 },
  navTextActive: { color: colors.white },
  content: { flex: 1 },
  screenPadding: { flex: 1, padding: 16 },
});
