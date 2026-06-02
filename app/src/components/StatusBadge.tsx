import { StyleSheet, Text, View } from 'react-native';
import type { VisitStatus } from '../types';
import { colors } from '../theme/colors';

const badgeStyles: Record<VisitStatus, { bg: string; text: string }> = {
  pending: { bg: colors.amber100, text: colors.amber800 },
  approved: { bg: colors.green100, text: colors.green800 },
  rejected: { bg: colors.red100, text: colors.red800 },
  entered: { bg: colors.blue100, text: colors.blue800 },
  exited: { bg: colors.slate100, text: colors.slate700 },
};

const labels: Record<VisitStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  entered: 'Entered',
  exited: 'Exited',
};

export function displayStatus(status: string): VisitStatus {
  if (status === 'checked_in') return 'entered';
  if (status === 'checked_out') return 'exited';
  return status as VisitStatus;
}

export default function StatusBadge({ status }: { status: string }) {
  const key = displayStatus(status);
  const style = badgeStyles[key] ?? { bg: colors.slate100, text: colors.slate700 };
  const label = labels[key] ?? status;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
