import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';

export function LoadingView({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.slate900} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function InfoBanner({ message }: { message: string }) {
  return (
    <View style={styles.infoBanner}>
      <Text style={styles.infoText}>{message}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.screenTitle}>
      <Text style={styles.h2}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Input(props: TextInputProps) {
  return <TextInput {...props} style={[styles.input, props.style]} placeholderTextColor={colors.slate400} />;
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.primaryBtnText}>{loading ? 'Please wait…' : title}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.secondaryBtn} onPress={onPress}>
      <Text style={styles.secondaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: colors.slate500 },
  errorBanner: {
    backgroundColor: colors.red50,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { fontSize: 14, color: colors.red700 },
  infoBanner: {
    backgroundColor: colors.blue50,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 14, color: colors.blue800 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
  },
  screenTitle: { marginBottom: 16 },
  h2: { fontSize: 22, fontWeight: '600', color: colors.slate900 },
  subtitle: { fontSize: 14, color: colors.slate600, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '500', color: colors.slate700, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.slate900,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: colors.slate900,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 14, color: colors.slate900 },
  disabled: { opacity: 0.6 },
  detailField: {
    borderWidth: 1,
    borderColor: colors.slate100,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.slate400,
  },
  detailValue: { fontSize: 14, fontWeight: '500', color: colors.slate800, marginTop: 4 },
});
