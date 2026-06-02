import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { colors } from '../theme/colors';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={() => markAllRead()}>
                  <Text style={styles.markAll}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.list}>
              {notifications.length === 0 ? (
                <Text style={styles.empty}>No notifications</Text>
              ) : (
                notifications.map((n) => (
                  <TouchableOpacity
                    key={n._id}
                    style={[styles.item, !n.read && styles.itemUnread]}
                    onPress={() => {
                      if (!n.read) markRead(n._id);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.itemTitle}>{n.title}</Text>
                    <Text style={styles.itemBody}>{n.body}</Text>
                    <Text style={styles.itemTime}>
                      {new Date(n.createdAt).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  buttonText: { fontSize: 14, color: colors.slate900 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 16,
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  panelTitle: { fontWeight: '600', fontSize: 14 },
  markAll: { fontSize: 12, color: colors.blue600 },
  list: { maxHeight: 320 },
  empty: { padding: 24, textAlign: 'center', color: colors.slate500, fontSize: 14 },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  itemUnread: { backgroundColor: colors.blue50 },
  itemTitle: { fontWeight: '600', fontSize: 14 },
  itemBody: { fontSize: 14, color: colors.slate600, marginTop: 4 },
  itemTime: { fontSize: 11, color: colors.slate400, marginTop: 4 },
  closeBtn: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
  },
  closeBtnText: { fontSize: 14, color: colors.slate600 },
});
