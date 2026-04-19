import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

type Kind = 'error' | 'success' | 'info';

interface Props {
  kind: Kind;
  children: string;
}

export function Banner({ kind, children }: Props) {
  const bg = kind === 'error' ? colors.dangerBg : kind === 'success' ? colors.successBg : colors.inactive;
  const border =
    kind === 'error' ? colors.dangerBorder : kind === 'success' ? colors.successBorder : colors.border;
  const fg = kind === 'error' ? colors.danger : kind === 'success' ? colors.success : colors.text;
  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  text: {
    fontSize: 13,
  },
});
