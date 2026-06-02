import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import StatusBadge from '../../components/StatusBadge';
import { Card, DetailField, LoadingView } from '../../components/ui';
import api from '../../lib/api';
import type { AdminStackParamList } from '../../navigation/types';
import type { Visit } from '../../types';

export default function AdminVisitDetailScreen({
  route,
}: {
  route: RouteProp<AdminStackParamList, 'AdminVisitDetail'>;
}) {
  const { id } = route.params;

  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const res = await api.get(`/visits/${id}`);
      return res.data.visit as Visit;
    },
  });

  if (isLoading || !visit) {
    return <LoadingView />;
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>{visit.visitorName}</Text>
        <StatusBadge status={visit.status} />
      </View>
      <View style={styles.fields}>
        <DetailField label="Apartment" value={visit.apartment} />
        <DetailField label="Phone" value={visit.visitorPhone} />
        <DetailField label="Purpose" value={visit.purpose} />
        <DetailField label="Resident" value={visit.residentId?.name ?? '—'} />
        <DetailField label="Guard" value={visit.registeredByGuardId?.name ?? '—'} />
        {visit.entryAt ? (
          <DetailField label="Entry" value={new Date(visit.entryAt).toLocaleString()} />
        ) : null}
        {visit.exitAt ? (
          <DetailField label="Exit" value={new Date(visit.exitAt).toLocaleString()} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '600', flex: 1 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
