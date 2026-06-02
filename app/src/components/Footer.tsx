import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>
        Made with love by <Text style={styles.name}>Manya Shukla</Text> · 2026
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.slate500,
  },
  name: {
    fontWeight: '600',
    color: colors.slate700,
  },
});
