import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StatusBadge from './StatusBadge';
import type { Visit } from '../types';
import { colors } from '../theme/colors';

export default function VisitTable({
  visits,
  onPressVisit,
}: {
  visits: Visit[];
  onPressVisit: (id: string) => void;
}) {
  if (visits.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No visits found</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {visits.map((v) => (
        <View key={v._id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardBody}>
              <Text style={styles.visitorName}>{v.visitorName}</Text>
              <Text style={styles.meta}>{v.apartment}</Text>
              <Text style={styles.purpose}>{v.purpose}</Text>
              <Text style={styles.date}>
                {new Date(v.createdAt).toLocaleString()}
              </Text>
            </View>
            <StatusBadge status={v.status} />
          </View>
          <TouchableOpacity onPress={() => onPressVisit(v._id)}>
            <Text style={styles.link}>View details →</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.slate300,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 48,
    alignItems: 'center',
  },
  emptyText: { color: colors.slate500, fontSize: 14 },
  list: { gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardBody: { flex: 1, minWidth: 0 },
  visitorName: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 14, color: colors.slate600, marginTop: 4 },
  purpose: { fontSize: 14, color: colors.slate500, marginTop: 4 },
  date: { fontSize: 12, color: colors.slate400, marginTop: 8 },
  link: { marginTop: 12, fontSize: 14, fontWeight: '500', color: colors.blue600 },
});
