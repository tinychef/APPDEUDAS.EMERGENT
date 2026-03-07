import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatShortCurrency } from '../../utils/amortizacion';

type BalanceMode = 'pendiente' | 'abonado';

interface BalanceSwitchProps {
  saldoPendiente: number;
  saldoAbonado: number;
  onToggle?: (mode: BalanceMode) => void;
}

/**
 * Switch visual entre "Saldo Pendiente" y "Saldo Abonado".
 * Estado completamente local — no afecta el store v1.
 */
export function BalanceSwitch({
  saldoPendiente,
  saldoAbonado,
  onToggle,
}: BalanceSwitchProps) {
  const colors = useThemeStore((s) => s.colors);
  const [mode, setMode] = useState<BalanceMode>('pendiente');

  const toggle = (next: BalanceMode) => {
    setMode(next);
    onToggle?.(next);
  };

  const displayValue =
    mode === 'pendiente' ? saldoPendiente : saldoAbonado;

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {/* Pill toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.pill, mode === 'pendiente' && styles.pillActive]}
          onPress={() => toggle('pendiente')}
          activeOpacity={0.8}
        >
          <Text style={[styles.pillText, mode === 'pendiente' && styles.pillTextActive]}>
            Pendiente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, mode === 'abonado' && styles.pillActive]}
          onPress={() => toggle('abonado')}
          activeOpacity={0.8}
        >
          <Text style={[styles.pillText, mode === 'abonado' && styles.pillTextActive]}>
            Abonado
          </Text>
        </TouchableOpacity>
      </View>

      {/* Value display */}
      <Text style={[
        styles.value,
        { color: mode === 'abonado' ? colors.positive : colors.textPrimary },
      ]}>
        {formatShortCurrency(displayValue)}
      </Text>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useThemeStore.getState>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: Spacing.sm,
    },
    toggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 3,
    },
    pill: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xs + 2,
      borderRadius: BorderRadius.full,
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
      color: colors.textMuted,
      letterSpacing: 0.3,
    },
    pillTextActive: {
      color: colors.textOnPrimary,
    },
    value: {
      fontSize: Typography.size['4xl'],
      fontWeight: Typography.weight.bold,
      letterSpacing: -1,
    },
  });
