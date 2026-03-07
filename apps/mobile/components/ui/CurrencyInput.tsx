import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency } from '../../utils/amortizacion';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  label?: string;
  autoFocus?: boolean;
}

/**
 * Input monetario sin flicker:
 * - Muestra `formatCurrency(value)` cuando no está enfocado
 * - Muestra dígitos crudos mientras el usuario escribe
 * - Solo permite dígitos (no decimales, no negativo)
 * - Llama onChange con el número parseado al confirmar cada cambio
 */
export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  style,
  label,
  autoFocus = false,
}: CurrencyInputProps) {
  const colors = useThemeStore((s) => s.colors);
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState('');

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Inicializar raw con el valor actual (sin formato)
    setRawText(value > 0 ? String(value) : '');
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseInt(rawText.replace(/[^0-9]/g, ''), 10) || 0;
    onChange(parsed);
    setRawText('');
  }, [rawText, onChange]);

  const handleChange = useCallback(
    (text: string) => {
      // Solo dígitos
      const digits = text.replace(/[^0-9]/g, '');
      setRawText(digits);
      const parsed = parseInt(digits, 10) || 0;
      onChange(parsed);
    },
    [onChange]
  );

  const displayValue = isFocused
    ? rawText
    : value > 0
    ? formatCurrency(value)
    : '';

  const styles = makeStyles(colors);

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="number-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoFocus={autoFocus}
          selectTextOnFocus
        />
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useThemeStore.getState>['colors']) =>
  StyleSheet.create({
    label: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      letterSpacing: 1.2,
      fontWeight: Typography.weight.semibold,
      marginBottom: Spacing.sm,
      textTransform: 'uppercase',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.lg,
    },
    inputRowFocused: {
      borderColor: colors.borderFocus,
    },
    prefix: {
      fontSize: Typography.size.xl,
      color: colors.textMuted,
      marginRight: Spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: Typography.size.xl,
      color: colors.textPrimary,
      paddingVertical: Spacing.lg,
    },
  });
