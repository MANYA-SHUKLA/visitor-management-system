import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '../../components/StatusBadge';
import { InfoBanner, LoadingView, ScreenTitle } from '../../components/ui';
import api from '../../lib/api';
import type { Visit } from '../../types';
import { colors } from '../../theme/colors';

export default function GuardEntryExitScreen() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'guard-entry-exit'],
    queryFn: async () => {
      const res = await api.get('/visits');
      return (res.data.visits as Visit[]).filter((v) =>
        ['approved', 'entered', 'checked_in'].includes(v.status)
      );
    },
    refetchInterval: 10_000,
  });

  async function markEntry(id: string) {
    setBusyId(id);
    setMessage('');
    try {
      await api.patch(`/visits/${id}/entry`);
      setMessage('Entry marked successfully');
      qc.invalidateQueries({ queryKey: ['visits'] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  async function markExit(id: string) {
    setBusyId(id);
    setMessage('');
    try {
      await api.patch(`/visits/${id}/exit`);
      setMessage('Exit marked successfully');
      qc.invalidateQueries({ queryKey: ['visits'] });
    } finally {
      setBusyId(null);
    }
  }

  const visits = data ?? [];

  return (
    <View>
      <ScreenTitle
        title="Mark entry / exit"
        subtitle="Manually mark entry when an approved visitor arrives, or exit when they leave. You can also use QR scan."
      />
      {message ? <InfoBanner message={message} /> : null}
      {isLoading ? (
        <LoadingView />
      ) : visits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No approved or active visitors right now</Text>
        </View>
      ) : (
        visits.map((v) => {
          const canEntry = v.status === 'approved';
          const canExit = v.status === 'entered' || v.status === ('checked_in' as string);
          return (
            <View key={v._id} style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.name}>{v.visitorName}</Text>
                <Text style={styles.meta}>
                  {v.apartment} · {v.purpose}
                </Text>
                <View style={styles.badgeWrap}>
                  <StatusBadge status={v.status} />
                </View>
              </View>
              <View style={styles.actions}>
                {canEntry ? (
                  <TouchableOpacity
                    style={[styles.entryBtn, busyId === v._id && styles.disabled]}
                    onPress={() => markEntry(v._id)}
                    disabled={busyId === v._id}
                  >
                    <Text style={styles.btnText}>Mark entry</Text>
                  </TouchableOpacity>
                ) : null}
                {canExit ? (
                  <TouchableOpacity
                    style={[styles.exitBtn, busyId === v._id && styles.disabled]}
                    onPress={() => markExit(v._id)}
                    disabled={busyId === v._id}
                  >
                    <Text style={styles.btnText}>Mark exit</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.slate300,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
  },
  emptyText: { color: colors.slate500, textAlign: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
    marginBottom: 12,
  },
  cardBody: { marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 14, color: colors.slate600, marginTop: 4 },
  badgeWrap: { marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  entryBtn: {
    backgroundColor: colors.blue600,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exitBtn: {
    backgroundColor: colors.slate800,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
