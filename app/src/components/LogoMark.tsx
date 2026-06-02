import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export default function LogoMark({
  size = 56,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
  const fontSize = Math.round(size * 0.38);
  const radius = Math.round(size * 0.1875);

  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize, letterSpacing: size * -0.01 }]}>MS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.slate900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.slate50,
    fontWeight: '700',
  },
});
