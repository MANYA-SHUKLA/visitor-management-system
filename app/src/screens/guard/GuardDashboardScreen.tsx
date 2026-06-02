import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import StatusBadge from '../../components/StatusBadge';
import api from '../../lib/api';
import type { GuardStackParamList } from '../../navigation/types';
import type { Visit } from '../../types';
import { colors } from '../../theme/colors';

export default function GuardDashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardStackParamList>>();

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'guard-recent'],
    queryFn: async () => {
      const res = await api.get('/visits');
      return (res.data.visits as Visit[]).slice(0, 5);
    },
    refetchInterval: 10_000,
  });

  const visits = data ?? [];

  const quickLinks = [
    { route: 'GuardRegister' as const, title: 'Register visitor', desc: 'New entry for resident approval' },
    { route: 'GuardScan' as const, title: 'Scan QR', desc: 'Check in or check out visitors' },
    { route: 'GuardVisits' as const, title: 'All visits', desc: 'View full history' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {quickLinks.map((link) => (
          <TouchableOpacity
            key={link.route}
            style={styles.quickCard}
            onPress={() => navigation.navigate(link.route)}
          >
            <Text style={styles.quickTitle}>{link.title}</Text>
            <Text style={styles.quickDesc}>{link.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent registrations</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : visits.length === 0 ? (
        <Text style={styles.muted}>No visits yet</Text>
      ) : (
        visits.map((v) => (
          <View key={v._id} style={styles.visitRow}>
            <View style={styles.visitInfo}>
              <Text style={styles.visitorName}>{v.visitorName}</Text>
              <Text style={styles.visitMeta}>
                {v.apartment} · {v.purpose}
              </Text>
            </View>
            <StatusBadge status={v.status} />
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  grid: { gap: 12 },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 20,
  },
  quickTitle: { fontSize: 16, fontWeight: '600' },
  quickDesc: { fontSize: 14, color: colors.slate600, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  muted: { color: colors.slate500 },
  visitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
    marginBottom: 8,
  },
  visitInfo: { flex: 1 },
  visitorName: { fontWeight: '600' },
  visitMeta: { fontSize: 14, color: colors.slate600, marginTop: 4 },
});
