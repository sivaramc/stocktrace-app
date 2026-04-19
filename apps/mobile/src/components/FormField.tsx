import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

interface Props extends TextInputProps {
  label: string;
  hint?: string;
  error?: string | null;
}

export function FormField({ label, hint, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        style={[styles.input, !!error && styles.inputError, style]}
        placeholderTextColor={colors.mutedLight}
        autoCapitalize={rest.autoCapitalize ?? 'none'}
        autoCorrect={rest.autoCorrect ?? false}
      />
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
