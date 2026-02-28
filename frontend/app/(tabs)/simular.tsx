import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Slider from '@react-native-community/slider';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/GlassCard';
import { KPICard } from '../../components/KPICard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, calcularAmortizacion, ExtraPayment } from '../../utils/amortizacion';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

export default function SimularScreen() {
  const { prestamo, resultado } = useDebtStore();
  
  const [montoAbono, setMontoAbono] = useState(500000);
  const [frecuencia, setFrecuencia] = useState(1); // every N months
  const [duracionMeses, setDuracionMeses] = useState(12);

  // Calculate simulation
  const simulacion = useMemo(() => {
    if (!resultado) return null;

    // Generate simulated extra payments
    const simulatedAbonos: ExtraPayment[] = [];
    const startMonth = (resultado.cronograma.find(c => c.estado === 'PROXIMA')?.cuota || 1);
    
    for (let i = 0; i < duracionMeses; i += frecuencia) {
      const cuota = startMonth + i;
      if (cuota <= prestamo.plazoMeses) {
        simulatedAbonos.push({
          cuota,
          monto: montoAbono,
          fecha: new Date().toISOString().split('T')[0],
        });
      }
    }

    const resultadoSimulado = calcularAmortizacion(prestamo, simulatedAbonos);
    
    return {
      resultado: resultadoSimulado,
      totalAbonoSimulado: simulatedAbonos.reduce((sum, a) => sum + a.monto, 0),
      cantidadAbonos: simulatedAbonos.length,
    };
  }, [prestamo, montoAbono, frecuencia, duracionMeses, resultado]);

  if (!resultado || !simulacion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  const comparacion = {
    plazoOriginal: resultado.resumen.plazoOriginal,
    plazoActual: resultado.resumen.plazoReal,
    plazoSimulado: simulacion.resultado.resumen.plazoReal,
    mesesAdicionales: resultado.resumen.plazoReal - simulacion.resultado.resumen.plazoReal,
    interesesOriginales: resultado.resumen.totalInteresesSinAbonos,
    interesesActuales: resultado.resumen.totalInteresesConAbonos,
    interesesSimulados: simulacion.resultado.resumen.totalInteresesConAbonos,
    ahorroAdicional: resultado.resumen.totalInteresesConAbonos - simulacion.resultado.resumen.totalInteresesConAbonos,
  };

  // Chart data
  const chartWidth = screenWidth - 80;
  const sampleRate = Math.ceil(resultado.cronogramaSinAbonos.length / 20);
  
  const originalData = resultado.cronogramaSinAbonos
    .filter((_, i) => i % sampleRate === 0)
    .map(item => ({ value: item.saldoFinal / 1000000 }));

  const actualData = resultado.cronograma
    .filter((_, i) => i % sampleRate === 0)
    .map(item => ({ value: item.saldoFinal / 1000000 }));

  // Pad actual data
  while (actualData.length < originalData.length) {
    actualData.push({ value: 0 });
  }

  const simulatedData = simulacion.resultado.cronograma
    .filter((_, i) => i % sampleRate === 0)
    .map(item => ({ value: item.saldoFinal / 1000000 }));

  // Pad simulated data
  while (simulatedData.length < originalData.length) {
    simulatedData.push({ value: 0 });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="sparkles" size={28} color={Colors.primary} />
          <Text style={styles.title}>¿Qué pasaría si...?</Text>
        </View>
        <Text style={styles.subtitle}>
          Simula diferentes estrategias de abono
        </Text>

        {/* Controls */}
        <GlassCard style={styles.controlsCard}>
          {/* Monthly Amount Slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>¿Cuánto puedes abonar?</Text>
              <Text style={styles.sliderValue}>
                {formatCurrency(montoAbono)}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={100000}
              maximumValue={2000000}
              step={50000}
              value={montoAbono}
              onValueChange={setMontoAbono}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.surfaceAlt}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>$100K</Text>
              <Text style={styles.sliderRangeText}>$2M</Text>
            </View>
          </View>

          {/* Frequency Slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>¿Cada cuántos meses?</Text>
              <Text style={styles.sliderValue}>
                Cada {frecuencia} {frecuencia === 1 ? 'mes' : 'meses'}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={6}
              step={1}
              value={frecuencia}
              onValueChange={setFrecuencia}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.surfaceAlt}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>Mensual</Text>
              <Text style={styles.sliderRangeText}>Semestral</Text>
            </View>
          </View>

          {/* Duration Slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>¿Por cuánto tiempo?</Text>
              <Text style={styles.sliderValue}>
                {duracionMeses} meses
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={6}
              maximumValue={60}
              step={6}
              value={duracionMeses}
              onValueChange={setDuracionMeses}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.surfaceAlt}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>6 meses</Text>
              <Text style={styles.sliderRangeText}>5 años</Text>
            </View>
          </View>
        </GlassCard>

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>CON ESTA ESTRATEGIA:</Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KPICard
            icon="flag-outline"
            title="Terminas en"
            value={`Mes ${comparacion.plazoSimulado}`}
            subtitle={`${comparacion.mesesAdicionales} meses más corto`}
            variant="info"
            animated={false}
          />
          <KPICard
            icon="wallet-outline"
            title="Ahorro Adicional"
            value={comparacion.ahorroAdicional}
            prefix="$"
            subtitle="en intereses"
            variant="success"
          />
        </View>

        <View style={styles.kpiRow}>
          <KPICard
            icon="cash-outline"
            title="Total a Abonar"
            value={simulacion.totalAbonoSimulado}
            prefix="$"
            subtitle={`${simulacion.cantidadAbonos} abonos`}
            variant="info"
            animated={false}
          />
          <KPICard
            icon="trending-down-outline"
            title="Intereses Totales"
            value={comparacion.interesesSimulados}
            prefix="$"
            subtitle="proyectados"
            variant="warning"
          />
        </View>

        {/* Comparison Chart */}
        <GlassCard style={styles.chartCard} noPadding>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Proyección de Saldo</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.alert }]} />
                <Text style={styles.legendText}>Original</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.textMuted }]} />
                <Text style={styles.legendText}>Actual</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.positive }]} />
                <Text style={styles.legendText}>Simulado</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.chartWrapper}>
            <LineChart
              data={simulatedData}
              data2={actualData}
              data3={originalData}
              width={chartWidth}
              height={180}
              spacing={chartWidth / originalData.length}
              color1={Colors.positive}
              color2={Colors.textMuted}
              color3={Colors.alert}
              thickness1={3}
              thickness2={2}
              thickness3={2}
              curved
              areaChart
              startFillColor1={Colors.positive}
              endFillColor1="transparent"
              startOpacity1={0.2}
              endOpacity1={0}
              hideRules
              hideDataPoints
              yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
              yAxisColor={Colors.border}
              xAxisColor={Colors.border}
              noOfSections={4}
              yAxisLabelSuffix="M"
              initialSpacing={10}
              endSpacing={10}
              adjustToWidth
            />
          </View>
        </GlassCard>

        {/* Summary */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Plazo Original</Text>
              <Text style={[styles.summaryValue, { color: Colors.alert, textDecorationLine: 'line-through' }]}>
                {comparacion.plazoOriginal} meses
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.textMuted} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Plazo Actual</Text>
              <Text style={[styles.summaryValue, { color: Colors.textSecondary }]}>
                {comparacion.plazoActual} meses
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.textMuted} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Plazo Simulado</Text>
              <Text style={[styles.summaryValue, { color: Colors.positive }]}>
                {comparacion.plazoSimulado} meses
              </Text>
            </View>
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
  loadingText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  controlsCard: {
    marginBottom: Spacing.xl,
  },
  sliderContainer: {
    marginBottom: Spacing.xl,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
  },
  sliderValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderRangeText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  chartCard: {
    marginTop: Spacing.md,
  },
  chartHeader: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  chartTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  chartWrapper: {
    paddingHorizontal: Spacing.sm,
    marginLeft: -10,
  },
  summaryCard: {
    marginTop: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
});
