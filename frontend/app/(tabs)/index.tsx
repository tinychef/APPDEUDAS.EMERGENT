import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/GlassCard';
import { KPICard } from '../../components/KPICard';
import { ProgressRing } from '../../components/ProgressRing';
import { DebtChart } from '../../components/DebtChart';
import { DonutComposition } from '../../components/DonutComposition';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { formatCurrency, formatMonthYear, monthsDiff } from '../../utils/amortizacion';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { resultado, isLoading, recalculate, prestamo } = useDebtStore();

  useEffect(() => {
    recalculate();
  }, []);

  if (!resultado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { resumen, cronograma, cronogramaSinAbonos } = resultado;
  
  // Calculate progress (paid months / total months with payments)
  const paidMonths = cronograma.filter(c => c.estado === 'PAGADA').length;
  const progressPercent = (paidMonths / resumen.plazoReal) * 100;
  
  // Current month data
  const currentPayment = cronograma.find(c => c.estado === 'PROXIMA') || cronograma[0];
  
  // Calculate capital paid so far
  const capitalPagado = prestamo.monto - (currentPayment?.saldoFinal || 0);
  const capitalPercent = (capitalPagado / prestamo.monto) * 100;

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
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>DebtMap</Text>
            <Text style={styles.subtitle}>Tu mapa hacia la libertad financiera</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="flag" size={16} color={Colors.positive} />
            <Text style={styles.headerBadgeText}>Mes {resumen.plazoReal}</Text>
          </View>
        </View>

        {/* Progress Ring */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressRow}>
            <ProgressRing
              progress={capitalPercent}
              size={140}
              label="Capital pagado"
              sublabel={`${paidMonths} de ${resumen.plazoReal} cuotas`}
            />
            <View style={styles.progressInfo}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Saldo actual</Text>
                <Text style={styles.progressValue}>
                  {formatCurrency(currentPayment?.saldoFinal || 0)}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Terminas en</Text>
                <Text style={[styles.progressValue, { color: Colors.primary }]}>
                  {formatMonthYear(resumen.fechaFinReal)}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Fecha original</Text>
                <Text style={[styles.progressValue, { color: Colors.textMuted, textDecorationLine: 'line-through' }]}>
                  {formatMonthYear(resumen.fechaFinOriginal)}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* KPI Cards - Row 1 */}
        <View style={styles.kpiRow}>
          <KPICard
            icon="wallet-outline"
            title="Ahorro Total"
            value={resumen.ahorroIntereses}
            prefix="$"
            subtitle={`${resumen.porcentajeAhorro.toFixed(1)}% intereses ahorrados`}
            variant="success"
          />
          <KPICard
            icon="time-outline"
            title="Tiempo Liberado"
            value={`${resumen.mesesAhorrados}`}
            subtitle={monthsDiff(resumen.fechaFinReal, resumen.fechaFinOriginal)}
            variant="info"
          />
        </View>

        {/* KPI Cards - Row 2 */}
        <View style={styles.kpiRow}>
          <KPICard
            icon="calendar-outline"
            title="Cuota Mensual"
            value={resumen.cuotaMensual}
            prefix="$"
            subtitle="Fija todos los meses"
          />
          <KPICard
            icon="flag-outline"
            title="Plazo Real"
            value={`${resumen.plazoReal}`}
            subtitle={`vs ${resumen.plazoOriginal} original`}
            variant="info"
          />
        </View>

        {/* Debt Evolution Chart */}
        <DebtChart
          dataWithPayments={cronograma}
          dataWithoutPayments={cronogramaSinAbonos}
        />

        {/* Payment Composition */}
        {currentPayment && (
          <DonutComposition
            interes={currentPayment.interes}
            capital={currentPayment.abonoCapital - currentPayment.abonoExtra}
            cuota={currentPayment.cuotaMensual}
          />
        )}

        {/* Summary Card */}
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de Ahorros</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total abonos extra</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                {formatCurrency(resumen.totalAbonos)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Intereses ahorrados</Text>
              <Text style={[styles.summaryValue, { color: Colors.positive }]}>
                {formatCurrency(resumen.ahorroIntereses)}
              </Text>
            </View>
          </View>
          <View style={styles.savingsRatio}>
            <Text style={styles.savingsRatioText}>
              Por cada $1 abonado, ahorras{' '}
              <Text style={{ color: Colors.positive, fontWeight: '700' }}>
                ${(resumen.ahorroIntereses / resumen.totalAbonos).toFixed(2)}
              </Text>
              {' '}en intereses
            </Text>
          </View>
        </GlassCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  headerBadgeText: {
    color: Colors.positive,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: {
    flex: 1,
    marginLeft: Spacing.xl,
    gap: Spacing.md,
  },
  progressItem: {},
  progressLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    marginTop: Spacing.md,
  },
  summaryTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  summaryLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  savingsRatio: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  savingsRatioText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
