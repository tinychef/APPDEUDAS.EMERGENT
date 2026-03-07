import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { KPICard } from '../../components/KPICard';
import { ProgressRing } from '../../components/ProgressRing';
import { AspirationBlock } from '../../components/home/AspirationBlock';
import { DebtChart } from '../../components/DebtChart';
import { SkeletonCard, SkeletonKPI, Skeleton } from '../../components/ui/SkeletonLoader';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import {
  formatCurrency,
  formatShortCurrency,
  formatMonthYear,
  monthsDiff,
} from '../../utils/amortizacion';
import { Ionicons } from '@expo/vector-icons';

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header skeleton */}
        <View style={styles.skeletonHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <Skeleton width={40} height={40} borderRadius={BorderRadius.lg} />
            <View style={{ gap: 6 }}>
              <Skeleton width={100} height={16} borderRadius={6} />
              <Skeleton width={70} height={11} borderRadius={4} />
            </View>
          </View>
          <Skeleton width={88} height={28} borderRadius={BorderRadius.full} />
        </View>
        {/* Hero skeleton */}
        <SkeletonCard style={styles.skeletonHero} />
        {/* Next payment skeleton */}
        <SkeletonCard style={{ marginBottom: Spacing.lg }} />
        {/* KPI row skeleton */}
        <View style={styles.kpiRow}>
          <SkeletonKPI />
          <SkeletonKPI />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { resultado, isLoading, recalculate, prestamo } = useDebtStore();

  // ── Section entrance animations ────────────────────────────────────────────
  // Each section gets its own opacity + transform value for staggered entrance
  const hdrO  = useRef(new Animated.Value(0)).current;
  const hdrY  = useRef(new Animated.Value(-18)).current;
  const heroO = useRef(new Animated.Value(0)).current;
  const heroS = useRef(new Animated.Value(0.93)).current;
  const nextO = useRef(new Animated.Value(0)).current;
  const nextY = useRef(new Animated.Value(24)).current;
  const winO  = useRef(new Animated.Value(0)).current;
  const winY  = useRef(new Animated.Value(20)).current;
  const kpiO  = useRef(new Animated.Value(0)).current;
  const kpiY  = useRef(new Animated.Value(20)).current;
  const aspO  = useRef(new Animated.Value(0)).current;
  const aspY  = useRef(new Animated.Value(20)).current;
  const chtO  = useRef(new Animated.Value(0)).current;
  const chtY  = useRef(new Animated.Value(20)).current;

  // ── Continuous animations ──────────────────────────────────────────────────
  // Win banner heartbeat (native driver — opacity only)
  const winPulse = useRef(new Animated.Value(0.78)).current;
  // Composition bar fade-in (non-native — delayed reveal)
  const barProg  = useRef(new Animated.Value(0)).current;

  // ── Run entrance sequence once on mount ────────────────────────────────────
  useEffect(() => {
    recalculate();

    // Reusable helpers
    const slide = (o: Animated.Value, y: Animated.Value) =>
      Animated.parallel([
        Animated.timing(o, {
          toValue: 1, duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(y, {
          toValue: 0, damping: 18, stiffness: 200,
          useNativeDriver: true,
        }),
      ]);

    const scaleUp = (o: Animated.Value, s: Animated.Value) =>
      Animated.parallel([
        Animated.timing(o, {
          toValue: 1, duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(s, {
          toValue: 1, damping: 15, stiffness: 180,
          useNativeDriver: true,
        }),
      ]);

    Animated.stagger(75, [
      slide(hdrO, hdrY),
      scaleUp(heroO, heroS),
      slide(nextO, nextY),
      slide(winO, winY),
      slide(kpiO, kpiY),
      slide(aspO, aspY),
      slide(chtO, chtY),
    ]).start();

    // Win banner slow heartbeat
    Animated.loop(
      Animated.sequence([
        Animated.timing(winPulse, {
          toValue: 1, duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(winPulse, {
          toValue: 0.78, duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ── Composition bar reveal (triggered when data lands) ────────────────────
  useEffect(() => {
    if (resultado) {
      barProg.setValue(0);
      Animated.timing(barProg, {
        toValue: 1, duration: 900, delay: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width/flex can't use native driver
      }).start();
    }
  }, [resultado]);

  if (isLoading || !resultado) {
    return <DashboardSkeleton />;
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const { resumen, cronograma, cronogramaSinAbonos } = resultado;

  const paidMonths    = cronograma.filter(c => c.estado === 'PAGADA').length;
  const currentPayment = cronograma.find(c => c.estado === 'PROXIMA') ?? cronograma[0];

  // Current balance = saldo after last paid installment (or original amount if none paid yet)
  const lastPaid    = paidMonths > 0 ? cronograma[paidMonths - 1] : null;
  const saldoActual = lastPaid ? lastPaid.saldoFinal : prestamo.monto;
  const progressPct = prestamo.monto > 0
    ? Math.max(0, Math.min(100, ((prestamo.monto - saldoActual) / prestamo.monto) * 100))
    : 0;

  // Days until next payment (negative = overdue)
  const today        = new Date();
  const msUntil      = currentPayment.fecha.getTime() - today.getTime();
  const daysUntil    = Math.ceil(msUntil / (1000 * 60 * 60 * 24));
  const daysLabel    = daysUntil <= 0  ? 'HOY'
    : daysUntil === 1 ? 'Mañana'
    : `en ${daysUntil} días`;
  const isUrgent     = daysUntil <= 7;

  // Composition bar proportions (use 1 as min to avoid 0-flex layout glitches)
  const interesFlex  = Math.max(currentPayment.interes, 1);
  const capitalFlex  = Math.max(currentPayment.abonoCapital - currentPayment.abonoExtra, 1);
  const extraFlex    = Math.max(currentPayment.abonoExtra, 0);
  const hasExtra     = currentPayment.abonoExtra > 0;

  // Win banner: only show when there are real savings
  const hasWin = resumen.mesesAhorrados > 0 && resumen.ahorroIntereses > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={recalculate}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. HEADER ─────────────────────────────────────────────────── */}
        <Animated.View
          style={[styles.header, { opacity: hdrO, transform: [{ translateY: hdrY }] }]}
        >
          <View style={styles.brandRow}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.headerLogo}>
              <Text style={styles.logoGlyph}>₣</Text>
            </LinearGradient>
            <View>
              <Text style={styles.brandName}>FreeDueda</Text>
              <Text style={styles.brandTagline}>Tu mapa financiero</Text>
            </View>
          </View>

          <View style={styles.paidBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.positive} />
            <Text style={styles.paidBadgeText}>{paidMonths} pagadas</Text>
          </View>
        </Animated.View>

        {/* ── 2. HERO — Progress ring + balance + freedom dates ───────── */}
        <Animated.View
          style={[
            styles.heroWrap,
            { opacity: heroO, transform: [{ scale: heroS }] },
          ]}
        >
          <LinearGradient
            colors={['#1A0B2E', '#130820', '#0D0618']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Decorative glow orbs — purely visual depth */}
            <View style={styles.glowOrb1} />
            <View style={styles.glowOrb2} />

            {/* Label */}
            <Text style={styles.heroSectionLabel}>SALDO ACTUAL</Text>

            {/* Centered progress ring */}
            <View style={styles.ringContainer}>
              <ProgressRing
                progress={progressPct}
                size={160}
                strokeWidth={14}
                label="pagado"
              />
            </View>

            {/* Primary balance number */}
            <View style={styles.balanceBlock}>
              <Text style={styles.balanceAmount}>
                {formatShortCurrency(saldoActual)}
              </Text>
              <Text style={styles.balanceSub}>
                de {formatShortCurrency(prestamo.monto)} original
              </Text>
            </View>

            {/* Freedom date comparison */}
            <View style={styles.heroDivider} />
            <View style={styles.freedomRow}>
              <View style={styles.freedomItem}>
                <Text style={styles.freedomLabel}>PLAZO ORIGINAL</Text>
                <Text style={[styles.freedomDate, styles.freedomDateOld]}>
                  {formatMonthYear(resumen.fechaFinOriginal)}
                </Text>
              </View>

              <View style={styles.freedomArrow}>
                <Ionicons name="arrow-forward" size={16} color={Colors.primaryLight} />
              </View>

              <View style={[styles.freedomItem, styles.freedomItemRight]}>
                <Text style={styles.freedomLabel}>TU NUEVA META</Text>
                <Text style={[styles.freedomDate, styles.freedomDateNew]}>
                  {formatMonthYear(resumen.fechaFinReal)}
                </Text>
              </View>
            </View>

            {resumen.mesesAhorrados > 0 && (
              <Text style={styles.freedomSavingText}>
                {monthsDiff(resumen.fechaFinReal, resumen.fechaFinOriginal)} antes de lo planeado
              </Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ── 3. PRÓXIMA CUOTA — Amount + countdown + composition bar ─── */}
        <Animated.View
          style={[
            styles.sectionWrap,
            { opacity: nextO, transform: [{ translateY: nextY }] },
          ]}
        >
          <GlassCard variant="highlight">
            {/* Top row: icon + date + countdown */}
            <View style={styles.nextHeader}>
              <View style={styles.nextLeft}>
                <LinearGradient colors={Colors.gradientPrimary} style={styles.nextIcon}>
                  <Ionicons name="calendar" size={18} color={Colors.textOnPrimary} />
                </LinearGradient>
                <View>
                  <Text style={styles.nextLabel}>PRÓXIMA CUOTA</Text>
                  <Text style={styles.nextDate}>
                    {formatMonthYear(currentPayment.fecha)}
                  </Text>
                </View>
              </View>

              {/* Countdown pill */}
              <View style={[styles.countdownPill, isUrgent && styles.countdownPillUrgent]}>
                <Text style={[styles.countdownText, isUrgent && styles.countdownTextUrgent]}>
                  {daysLabel}
                </Text>
              </View>
            </View>

            {/* Amount — primary metric of this card */}
            <Text style={styles.nextAmount}>
              {formatCurrency(currentPayment.cuotaMensual)}
            </Text>

            {hasExtra && (
              <View style={styles.extraRow}>
                <Ionicons name="add-circle" size={13} color={Colors.positive} />
                <Text style={styles.extraText}>
                  +{formatShortCurrency(currentPayment.abonoExtra)} abono extra
                </Text>
              </View>
            )}

            {/* Animated composition bar — fades in after data loads */}
            <Animated.View style={[styles.barSection, { opacity: barProg }]}>
              <View style={styles.compositionBar}>
                <View
                  style={[styles.barSegment, {
                    flex: interesFlex,
                    backgroundColor: Colors.alert,
                  }]}
                />
                <View
                  style={[styles.barSegment, {
                    flex: capitalFlex,
                    backgroundColor: Colors.primary,
                  }]}
                />
                {hasExtra && (
                  <View
                    style={[styles.barSegment, {
                      flex: extraFlex,
                      backgroundColor: Colors.positive,
                    }]}
                  />
                )}
              </View>

              <View style={styles.compositionLabels}>
                <Text style={styles.compositionLabel}>
                  <Text style={{ color: Colors.alert }}>● </Text>
                  Interés {formatShortCurrency(currentPayment.interes)}
                </Text>
                <Text style={styles.compositionLabel}>
                  <Text style={{ color: Colors.primary }}>● </Text>
                  Capital {formatShortCurrency(currentPayment.abonoCapital - currentPayment.abonoExtra)}
                </Text>
                {hasExtra && (
                  <Text style={styles.compositionLabel}>
                    <Text style={{ color: Colors.positive }}>● </Text>
                    Extra {formatShortCurrency(currentPayment.abonoExtra)}
                  </Text>
                )}
              </View>
            </Animated.View>
          </GlassCard>
        </Animated.View>

        {/* ── 4. WIN BANNER — Conditional, only when savings exist ─────── */}
        {hasWin && (
          <Animated.View
            style={[
              styles.sectionWrap,
              { opacity: winO, transform: [{ translateY: winY }] },
            ]}
          >
            {/* Heartbeat wraps only the card so content is always readable */}
            <Animated.View style={{ opacity: winPulse }}>
              <LinearGradient
                colors={['rgba(0,200,81,0.12)', 'rgba(130,10,209,0.09)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.winCard}
              >
                <View style={styles.winTopRow}>
                  <View style={styles.winIconWrap}>
                    <Ionicons name="trending-up" size={18} color={Colors.positive} />
                  </View>
                  <Text style={styles.winTitle}>¡Vas ganando!</Text>
                  <View style={styles.winBadge}>
                    <Text style={styles.winBadgeText}>
                      {resumen.mesesAhorrados} meses antes
                    </Text>
                  </View>
                </View>

                <Text style={styles.winAmount}>
                  {formatCurrency(resumen.ahorroIntereses)}
                </Text>
                <Text style={styles.winSub}>
                  ahorrados en intereses con tus abonos extra
                </Text>
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        )}

        {/* ── 5. KPIs — 2 cards, most impactful metrics only ───────────── */}
        <Animated.View
          style={[
            styles.sectionWrap,
            { opacity: kpiO, transform: [{ translateY: kpiY }] },
          ]}
        >
          <View style={styles.kpiRow}>
            <KPICard
              icon="time-outline"
              title="Meses ahorrados"
              value={resumen.mesesAhorrados}
              subtitle="vs plazo original"
              variant="success"
              trend="up"
            />
            <KPICard
              icon="shield-checkmark-outline"
              title="Intereses ahorrados"
              value={resumen.ahorroIntereses}
              prefix="$"
              subtitle={`${resumen.porcentajeAhorro.toFixed(1)}% del total`}
              variant="success"
              trend="up"
            />
          </View>
        </Animated.View>

        {/* ── 6. ASPIRATION BLOCK — Gamified savings milestone ─────────── */}
        <Animated.View
          style={[
            styles.sectionWrap,
            { opacity: aspO, transform: [{ translateY: aspY }] },
          ]}
        >
          <AspirationBlock ahorroTotal={resumen.ahorroIntereses} />
        </Animated.View>

        {/* ── 7. CHART PREVIEW — Debt trajectory teaser ────────────────── */}
        <Animated.View
          style={{ opacity: chtO, transform: [{ translateY: chtY }] }}
        >
          <Text style={styles.chartSectionLabel}>EVOLUCIÓN DE TU DEUDA</Text>
          <DebtChart
            dataWithPayments={cronograma}
            dataWithoutPayments={cronogramaSinAbonos}
            montoInicial={prestamo.monto}
          />
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  scrollView:    { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing['4xl'] },

  // ── Skeleton ──────────────────────────────────────────────────────────────
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  skeletonHero: {
    marginBottom: Spacing.lg,
    height: 340,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.purple,
  },
  logoGlyph: {
    fontSize: 20,
    fontWeight: Typography.weight.bold,
    color: Colors.textOnPrimary,
  },
  brandName: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,200,81,0.10)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,200,81,0.22)',
  },
  paidBadgeText: {
    fontSize: Typography.size.xs,
    color: Colors.positive,
    fontWeight: Typography.weight.semibold,
  },

  // ── Hero card ─────────────────────────────────────────────────────────────
  heroWrap: {
    marginBottom: Spacing.lg,
  },
  heroCard: {
    borderRadius: BorderRadius['3xl'],
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(130,10,209,0.28)',
    overflow: 'hidden',
    ...Shadows.purple,
  },
  // Decorative ambient glow blobs — no interactivity, just visual depth
  glowOrb1: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(130,10,209,0.22)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(107,8,170,0.14)',
  },
  heroSectionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.8,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  balanceBlock: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  balanceAmount: {
    fontSize: Typography.size['5xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -2,
    lineHeight: Typography.size['5xl'] * 1.05,
  },
  balanceSub: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },

  // Freedom date row
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(130,10,209,0.18)',
    marginBottom: Spacing.lg,
  },
  freedomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  freedomItem: {
    flex: 1,
  },
  freedomItemRight: {
    alignItems: 'flex-end',
  },
  freedomArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(130,10,209,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  freedomLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    fontWeight: Typography.weight.semibold,
    marginBottom: 4,
  },
  freedomDate: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  freedomDateOld: {
    color: Colors.alert,
    textDecorationLine: 'line-through',
  },
  freedomDateNew: {
    color: Colors.primary,
  },
  freedomSavingText: {
    fontSize: Typography.size.xs,
    color: Colors.primaryLight,
    textAlign: 'center',
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.2,
    marginTop: Spacing.xs,
  },

  // ── Section spacing wrapper ────────────────────────────────────────────────
  sectionWrap: {
    marginBottom: Spacing.lg,
  },

  // ── Next payment card ─────────────────────────────────────────────────────
  nextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  nextIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.1,
    fontWeight: Typography.weight.semibold,
  },
  nextDate: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  countdownPill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countdownPillUrgent: {
    backgroundColor: 'rgba(255,184,0,0.10)',
    borderColor: 'rgba(255,184,0,0.35)',
  },
  countdownText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.semibold,
  },
  countdownTextUrgent: {
    color: Colors.warning,
  },
  nextAmount: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    lineHeight: Typography.size['4xl'] * 1.08,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 5,
  },
  extraText: {
    fontSize: Typography.size.sm,
    color: Colors.positive,
    fontWeight: Typography.weight.medium,
  },

  // Composition bar
  barSection: {
    marginTop: Spacing.xl,
  },
  compositionBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    gap: 2,
    marginBottom: Spacing.sm,
  },
  barSegment: {
    borderRadius: BorderRadius.full,
  },
  compositionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  compositionLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },

  // ── Win banner ────────────────────────────────────────────────────────────
  winCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,200,81,0.22)',
    gap: Spacing.xs,
  },
  winTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  winIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0,200,81,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.positive,
    flex: 1,
  },
  winBadge: {
    backgroundColor: 'rgba(0,200,81,0.14)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  winBadgeText: {
    fontSize: 10,
    color: Colors.positive,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.3,
  },
  winAmount: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.positive,
    letterSpacing: -0.8,
  },
  winSub: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },

  // ── KPI row ───────────────────────────────────────────────────────────────
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  // ── Chart section ─────────────────────────────────────────────────────────
  chartSectionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
});
