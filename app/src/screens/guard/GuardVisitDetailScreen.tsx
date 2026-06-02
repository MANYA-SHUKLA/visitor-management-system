import { Image, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import StatusBadge from '../../components/StatusBadge';
import { Card, DetailField, LoadingView } from '../../components/ui';
import api from '../../lib/api';
import type { GuardStackParamList } from '../../navigation/types';
import type { Visit } from '../../types';
import { colors } from '../../theme/colors';

export default function GuardVisitDetailScreen({
  route,
}: {
  route: RouteProp<GuardStackParamList, 'GuardVisitDetail'>;
}) {
  const { id } = route.params;

  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const res = await api.get(`/visits/${id}`);
      return res.data.visit as Visit;
    },
  });

  const { data: qr } = useQuery({
    queryKey: ['visit-qr', id],
    queryFn: async () => {
      const res = await api.get(`/visits/${id}/qr`);
      return res.data as { dataUrl: string; qrToken: string };
    },
    enabled:
      !!visit &&
      ['approved', 'entered', 'exited', 'checked_in', 'checked_out'].includes(
        visit.status
      ),
    retry: false,
  });

  if (isLoading || !visit) {
    return <LoadingView />;
  }

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>{visit.visitorName}</Text>
          <StatusBadge status={visit.status} />
        </View>
        <View style={styles.fields}>
          <DetailField label="Apartment" value={visit.apartment} />
          <DetailField label="Phone" value={visit.visitorPhone} />
          <DetailField label="Purpose" value={visit.purpose} />
          {visit.entryAt ? (
            <DetailField label="Entry" value={new Date(visit.entryAt).toLocaleString()} />
          ) : null}
          {visit.exitAt ? (
            <DetailField label="Exit" value={new Date(visit.exitAt).toLocaleString()} />
          ) : null}
        </View>
      </Card>

      {qr?.dataUrl ? (
        <Card style={styles.qrCard}>
          <Text style={styles.qrTitle}>Visitor QR code</Text>
          <Image source={{ uri: qr.dataUrl }} style={styles.qrImage} />
          <Text style={styles.qrToken}>{qr.qrToken}</Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '600', flex: 1 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  qrCard: { alignItems: 'center' },
  qrTitle: { fontWeight: '600', marginBottom: 16 },
  qrImage: { width: 280, height: 280, resizeMode: 'contain' },
  qrToken: { fontSize: 11, color: colors.slate500, marginTop: 16, textAlign: 'center' },
});
