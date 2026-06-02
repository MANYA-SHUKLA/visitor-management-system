import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import RejectModal from '../../components/RejectModal';
import StatusBadge from '../../components/StatusBadge';
import { Card, DetailField, ErrorBanner, LoadingView } from '../../components/ui';
import api from '../../lib/api';
import type { ResidentStackParamList } from '../../navigation/types';
import type { Visit } from '../../types';
import { colors } from '../../theme/colors';

export default function ResidentVisitDetailScreen({
  route,
}: {
  route: RouteProp<ResidentStackParamList, 'ResidentVisitDetail'>;
}) {
  const { id } = route.params;
  const navigation = useNavigation();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const res = await api.get(`/visits/${id}`);
      return res.data.visit as Visit;
    },
  });

  async function approve() {
    setBusy(true);
    setActionError('');
    try {
      await api.patch(`/visits/${id}/approve`);
      await qc.invalidateQueries({ queryKey: ['visit', id] });
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setBusy(false);
    }
  }

  async function confirmReject(reason: string) {
    setBusy(true);
    setActionError('');
    try {
      await api.patch(`/visits/${id}/reject`, { reason });
      await qc.invalidateQueries({ queryKey: ['visit', id] });
      await qc.invalidateQueries({ queryKey: ['visits'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setBusy(false);
      setShowRejectModal(false);
    }
  }

  if (isLoading || !visit) {
    return <LoadingView />;
  }

  const isPending = visit.status === 'pending';

  return (
    <>
      {showRejectModal ? (
        <RejectModal
          visitorName={visit.visitorName}
          busy={busy}
          onConfirm={confirmReject}
          onCancel={() => setShowRejectModal(false)}
        />
      ) : null}

      <View>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Visit details</Text>
        </View>

        <Card>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{visit.visitorName}</Text>
              <Text style={styles.phone}>{visit.visitorPhone}</Text>
            </View>
            <StatusBadge status={visit.status} />
          </View>

          <View style={styles.fields}>
            <DetailField label="Purpose" value={visit.purpose} />
            <DetailField label="Apartment" value={visit.apartment} />
            {visit.expectedAt ? (
              <DetailField label="Expected at" value={new Date(visit.expectedAt).toLocaleString()} />
            ) : null}
            {visit.approvedAt ? (
              <DetailField label="Approved at" value={new Date(visit.approvedAt).toLocaleString()} />
            ) : null}
            {visit.rejectedAt ? (
              <DetailField label="Rejected at" value={new Date(visit.rejectedAt).toLocaleString()} />
            ) : null}
            {visit.rejectReason ? (
              <DetailField label="Reject reason" value={visit.rejectReason} />
            ) : null}
            {visit.entryAt ? (
              <DetailField label="Entry" value={new Date(visit.entryAt).toLocaleString()} />
            ) : null}
            {visit.exitAt ? (
              <DetailField label="Exit" value={new Date(visit.exitAt).toLocaleString()} />
            ) : null}
            <DetailField label="Registered" value={new Date(visit.createdAt).toLocaleString()} />
          </View>

          {actionError ? <ErrorBanner message={actionError} /> : null}

          {isPending ? (
            <View style={styles.actions}>
              <Text style={styles.actionHint}>
                Action required — approve or reject this visitor:
              </Text>
              <TouchableOpacity
                style={[styles.approveBtn, busy && styles.disabled]}
                onPress={approve}
                disabled={busy}
              >
                <Text style={styles.btnWhite}>{busy ? 'Processing…' : 'Approve'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectBtn, busy && styles.disabled]}
                onPress={() => setShowRejectModal(true)}
                disabled={busy}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: { fontSize: 14, color: colors.slate600 },
  pageTitle: { fontSize: 20, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: '600' },
  phone: { fontSize: 14, color: colors.slate500, marginTop: 4 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actions: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    gap: 12,
  },
  actionHint: { fontSize: 14, fontWeight: '500', color: colors.slate700 },
  approveBtn: {
    backgroundColor: colors.green600,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btnWhite: { color: colors.white, fontWeight: '600' },
  rejectText: { color: colors.red700, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
