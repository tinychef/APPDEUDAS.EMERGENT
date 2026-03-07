import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Debt } from '../../data/local/repositories/debtsRepository';
import { LinearGradient } from 'expo-linear-gradient';
import { formatShortCurrency } from '../../utils/amortizacion';

interface DebtHeroProps {
  debts: Debt[];
}

export function DebtHero({ debts }: DebtHeroProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const totalOriginalDebt = debts.reduce((acc, obj) => acc + obj.monto, 0);
  const totalCurrentDebt = debts.reduce((acc, obj) => acc + (obj.snapshot?.saldoActual || obj.monto), 0);
  const amountPaid = Math.max(0, totalOriginalDebt - totalCurrentDebt);
  const totalSaved = debts.reduce((acc, obj) => acc + (obj.snapshot?.ahorroIntereses || 0), 0);
  const originalTime = debts.reduce((acc, obj) => acc + obj.plazoMeses, 0);
  const newTime = debts.reduce((acc, obj) => acc + (obj.snapshot?.plazoReal || obj.plazoMeses), 0);
  const timeSaved = Math.max(0, originalTime - newTime);
  const progress = totalOriginalDebt > 0 ? (amountPaid / totalOriginalDebt) * 100 : 0;
  const remaining = totalOriginalDebt - amountPaid;

  useEffect(() => {
    // Card entrance with scale
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
      ]),
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Subtle glow pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.6, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [progress]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${Math.min(progress, 100)}%`],
  });

  // Percentage change indicator (simulated - shows monthly reduction %)
  const monthlyReduction = totalOriginalDebt > 0 ? ((amountPaid / totalOriginalDebt) * 100 / Math.max(1, originalTime - newTime + 1)).toFixed(1) : '0';

  return (
    <Animated.View style={[styles.container, { opacity: cardAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['#1A0B2E', '#130820', '#0D0618']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        {/* Decorative glow orbs */}
        <Animated.View style={[styles.glowCircle, { opacity: glowPulse }]} />
        <Animated.View style={[styles.glowCircleSecondary, { opacity: glowPulse }]} />

        {/* Header with badge */}
        <View style={styles.heroHeader}>
          <View style={styles.balanceSection}>
            <View style={styles.labelRow}>
              <Text style={styles.heroLabel}>Saldo Pendiente</Text>
              {amountPaid > 0 && (
                <View style={styles.changeBadge}>
                  <Ionicons name="trending-down" size={10} color={Colors.positive} />
                  <Text style={styles.changeText}>{monthlyReduction}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroBalance}>
              {formatShortCurrency(totalCurrentDebt)}
            </Text>
            <Text style={styles.heroSubtext}>
              de {formatShortCurrency(totalOriginalDebt)} original
            </Text>
          </View>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.walletBadge}>
            <Ionicons name="flash" size={24} color={Colors.textOnPrimary} />
          </LinearGradient>
        </View>

        {/* Progress section */}
        <View style={styles.progressSection}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Progreso de pago</Text>
            <Text style={styles.progressValue}>{progress.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight, '#B06AFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Shine effect */}
              <View style={styles.progressShine} />
            </Animated.View>
          </View>
          <Text style={styles.freedomText}>
            {formatShortCurrency(remaining)} restantes para tu libertad
          </Text>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(130, 10, 209, 0.20)' }]}>
              <Ionicons name="trending-down" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Ahorro generado</Text>
            <Text style={[styles.metricValue, { color: Colors.primary }]}>
              {formatShortCurrency(totalSaved)}
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(0, 200, 81, 0.15)' }]}>
              <Ionicons name="time" size={16} color={Colors.positive} />
            </View>
            <Text style={styles.metricLabel}>Tiempo ahorrado</Text>
            <Text style={[styles.metricValue, { color: Colors.positive }]}>
              {timeSaved} meses
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  heroCard: {
    borderRadius: BorderRadius['3xl'],
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(130, 10, 209, 0.25)',
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.purple,
  },
  glowCircle: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#820AD1',
  },
  glowCircleSecondary: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6B08AA',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing['2xl'],
  },
  balanceSection: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  heroLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    letterSpacing: 0.3,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 200, 81, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  changeText: {
    fontSize: Typography.size.xs,
    color: Colors.positive,
    fontWeight: Typography.weight.bold,
  },
  heroBalance: {
    color: Colors.textPrimary,
    fontSize: Typography.size['5xl'],
    fontWeight: Typography.weight.bold,
    letterSpacing: -1.5,
    lineHeight: Typography.size['5xl'] * 1.1,
  },
  heroSubtext: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
  },
  walletBadge: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.purple,
  },
  progressSection: {
    marginBottom: Spacing.xl,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  progressValue: {
    color: Colors.primaryLight,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  freedomText: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    marginTop: Spacing.sm,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  metricItem: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
});
