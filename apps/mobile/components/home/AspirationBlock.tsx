import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatShortCurrency } from '../../utils/amortizacion';
import {
  getCurrentAspiration,
  getNextAspiration,
  getProgressToNext,
} from '../../utils/aspirationalLevels';

interface AspirationBlockProps {
  ahorroTotal: number;
}

export function AspirationBlock({ ahorroTotal }: AspirationBlockProps) {
  const colors = useThemeStore((s) => s.colors);

  const current = getCurrentAspiration(ahorroTotal);
  const next = getNextAspiration(ahorroTotal);
  const progress = getProgressToNext(ahorroTotal);

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.sectionLabel}>CON TU AHORRO PODRÍAS...</Text>

      <LinearGradient
        colors={['rgba(130,10,209,0.12)', 'rgba(130,10,209,0.04)']}
        style={styles.card}
      >
        {/* Icon + Title */}
        <View style={styles.row}>
          <View style={styles.iconBg}>
            <Ionicons name={current.icon as any} size={24} color={colors.primary} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.levelTitle}>{current.title}</Text>
            <Text style={styles.levelDesc}>{current.description}</Text>
          </View>
        </View>

        {/* Progress toward next */}
        {next && (
          <View style={styles.nextBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Hacia: <Text style={{ color: colors.primary }}>{next.title}</Text>
              </Text>
              <Text style={styles.progressLabel}>
                {formatShortCurrency(ahorroTotal)} / {formatShortCurrency(next.minAhorro)}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.faltaText}>
              Faltan {formatShortCurrency(next.minAhorro - ahorroTotal)}
            </Text>
          </View>
        )}

        {!next && (
          <View style={styles.maxRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.maxText}>¡Nivel máximo alcanzado!</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useThemeStore.getState>['colors']) =>
  StyleSheet.create({
    container: { marginBottom: Spacing.lg },
    sectionLabel: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      letterSpacing: 1.2,
      fontWeight: Typography.weight.semibold,
      marginBottom: Spacing.sm,
    },
    card: {
      borderRadius: BorderRadius['2xl'],
      borderWidth: 1,
      borderColor: 'rgba(130,10,209,0.25)',
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    iconBg: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.primaryGlow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: { flex: 1, gap: 3 },
    levelTitle: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.textPrimary,
    },
    levelDesc: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      lineHeight: Typography.size.sm * 1.4,
    },
    nextBlock: { gap: Spacing.xs },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
    },
    track: {
      height: 4,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
    },
    faltaText: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
    },
    maxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    maxText: {
      fontSize: Typography.size.sm,
      color: colors.warning,
      fontWeight: Typography.weight.medium,
    },
  });
