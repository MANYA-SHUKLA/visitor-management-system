import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

export default function RejectModal({
  visitorName,
  onConfirm,
  onCancel,
  busy,
}: {
  visitorName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Reject visitor</Text>
          <Text style={styles.subtitle}>
            Rejecting <Text style={styles.name}>{visitorName}</Text>
          </Text>
          <Text style={styles.label}>
            Reason <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            multiline
            numberOfLines={3}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. Not expecting anyone today"
            style={styles.input}
            placeholderTextColor={colors.slate400}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={busy}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectBtn, busy && styles.disabled]}
              onPress={() => onConfirm(reason)}
              disabled={busy}
            >
              <Text style={styles.rejectText}>{busy ? 'Rejecting…' : 'Reject'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.slate900 },
  subtitle: { fontSize: 14, color: colors.slate500, marginTop: 4 },
  name: { fontWeight: '500', color: colors.slate700 },
  label: { fontSize: 14, fontWeight: '500', color: colors.slate700, marginTop: 16 },
  optional: { fontWeight: '400', color: colors.slate400 },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 20,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: { fontSize: 14, color: colors.slate900 },
  rejectBtn: {
    backgroundColor: colors.red600,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rejectText: { fontSize: 14, fontWeight: '600', color: colors.white },
  disabled: { opacity: 0.6 },
});
