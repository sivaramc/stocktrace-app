import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

type Variant = 'primary' | 'secondary' | 'buy' | 'sell' | 'danger';

interface Props extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, variant = 'primary', loading, disabled, style, ...rest }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantTextColor(variant)} />
      ) : (
        <Text style={[styles.text, { color: variantTextColor(variant) }]}>{title}</Text>
      )}
    </Pressable>
  );
}

function variantTextColor(v: Variant): string {
  switch (v) {
    case 'secondary':
      return colors.text;
    case 'buy':
      return colors.buyText;
    case 'sell':
      return colors.sellText;
    default:
      return colors.primaryText;
  }
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  buy: { backgroundColor: colors.buyBg },
  sell: { backgroundColor: colors.sellBg },
  danger: { backgroundColor: colors.danger },
};
