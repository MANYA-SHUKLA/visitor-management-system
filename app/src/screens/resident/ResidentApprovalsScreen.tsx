import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RejectModal from '../../components/RejectModal';
import StatusBadge from '../../components/StatusBadge';
import { ErrorBanner, LoadingView, ScreenTitle } from '../../components/ui';
import api from '../../lib/api';
import type { ResidentStackParamList } from '../../navigation/types';
import type { Visit } from '../../types';
import { colors } from '../../theme/colors';

interface VisitCounts {
  pending: number;
  approved: number;
  rejected: number;
  entered: number;
  exited: number;
}

function StatCard({
  label,
  value,
  bg,
  text,
}: {
  label: string;
  value: number;
  bg: string;
  text: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: text }]}>
      <Text style={[styles.statValue, { color: text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: text }]}>{label}</Text>
    </View>
  );
}

export default function ResidentApprovalsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ResidentStackParamList>>();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Visit | null>(null);

  const { data: counts } = useQuery({
    queryKey: ['visit-counts'],
    queryFn: async () => {
      const res = await api.get('/visits/counts');
      return res.data.counts as VisitCounts;
    },
    refetchInterval: 10_000,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['visits', 'resident-pending'],
    queryFn: async () => {
      const res = await api.get('/visits', { params: { status: 'pending' } });
      return res.data.visits as Visit[];
    },
    refetchInterval: 10_000,
  });

  async function approve(id: string) {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/visits/${id}/approve`);
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['visit-counts'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
      refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    const id = rejectTarget._id;
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/visits/${id}/reject`, { reason });
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['visit-counts'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
      refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setBusyId(null);
      setRejectTarget(null);
    }
  }

  const pending = data ?? [];

  return (
    <>
      {rejectTarget ? (
        <RejectModal
          visitorName={rejectTarget.visitorName}
          busy={busyId === rejectTarget._id}
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      ) : null}

      <View>
        {counts ? (
          <View style={styles.statsRow}>
            <StatCard label="Pending" value={counts.pending} bg={colors.amber50} text={colors.amber800} />
            <StatCard label="Inside now" value={counts.entered} bg={colors.blue50} text={colors.blue800} />
            <StatCard label="Approved" value={counts.approved} bg={colors.green50} text={colors.green800} />
            <StatCard label="Rejected" value={counts.rejected} bg={colors.red50} text={colors.red800} />
          </View>
        ) : null}

        <View style={styles.headerRow}>
          <ScreenTitle title="Pending approvals" />
          {pending.length > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pending.length} waiting</Text>
            </View>
          ) : null}
        </View>

        {error ? <ErrorBanner message={error} /> : null}

        {isLoading ? (
          <LoadingView />
        ) : pending.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptySub}>No pending visitor requests</Text>
          </View>
        ) : (
          pending.map((v) => (
            <View key={v._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardBody}>
                  <Text style={styles.visitorName}>{v.visitorName}</Text>
                  <Text style={styles.phone}>{v.visitorPhone}</Text>
                  <Text style={styles.purpose}>
                    <Text style={styles.bold}>Purpose:</Text> {v.purpose}
                  </Text>
                  {v.expectedAt ? (
                    <Text style={styles.meta}>
                      <Text style={styles.bold}>Expected:</Text>{' '}
                      {new Date(v.expectedAt).toLocaleString()}
                    </Text>
                  ) : null}
                  <Text style={styles.created}>
                    Registered {new Date(v.createdAt).toLocaleString()}
                  </Text>
                </View>
                <StatusBadge status={v.status} />
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.approveBtn, busyId === v._id && styles.disabled]}
                  onPress={() => approve(v._id)}
                  disabled={busyId === v._id}
                >
                  <Text style={styles.approveText}>
                    {busyId === v._id ? 'Processing…' : 'Approve'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, busyId === v._id && styles.disabled]}
                  onPress={() => setRejectTarget(v)}
                  disabled={busyId === v._id}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ResidentVisitDetail', { id: v._id })}
                >
                  <Text style={styles.link}>View details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    backgroundColor: colors.amber100,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 14, fontWeight: '500', color: colors.amber800 },
  empty: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.slate300,
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 28 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  emptySub: { fontSize: 14, color: colors.slate500, marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardBody: { flex: 1 },
  visitorName: { fontSize: 18, fontWeight: '600' },
  phone: { fontSize: 14, color: colors.slate500, marginTop: 4 },
  purpose: { fontSize: 14, marginTop: 8 },
  meta: { fontSize: 14, color: colors.slate600, marginTop: 4 },
  created: { fontSize: 12, color: colors.slate400, marginTop: 4 },
  bold: { fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
  },
  approveBtn: {
    backgroundColor: colors.green600,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  approveText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  rejectBtn: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  rejectText: { color: colors.red700, fontWeight: '600', fontSize: 14 },
  link: { color: colors.blue600, fontSize: 14, marginLeft: 'auto' },
  disabled: { opacity: 0.6 },
});
