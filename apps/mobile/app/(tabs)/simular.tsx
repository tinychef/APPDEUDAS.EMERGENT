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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { KPICard } from '../../components/KPICard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, formatShortCurrency, calcularAmortizacion, ExtraPayment } from '../../utils/amortizacion';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

export default function SimularScreen() {
  const { prestamo, resultado } = useDebtStore();

  const [montoAbono, setMontoAbono] = useState(500000);
  const [frecuencia, setFrecuencia] = useState(1);
  const [duracionMeses, setDuracionMeses] = useState(12);

  const simulacion = useMemo(() => {
    if (!resultado) return null;
    const { abonos } = useDebtStore.getState();
    const simulatedAbonos: ExtraPayment[] = [...abonos];
    const startMonth = resultado.cronograma.find(c => c.estado === 'PROXIMA')?.cuota || 1;
    for (let i = 0; i < duracionMeses; i += frecuencia) {
      const cuota = startMonth + i;
      if (cuota <= prestamo.plazoMeses) {
        const existingIndex = simulatedAbonos.findIndex(a => a.cuota === cuota);
        if (existingIndex >= 0) {
          simulatedAbonos[existingIndex] = { ...simulatedAbonos[existingIndex], monto: simulatedAbonos[existingIndex].monto + montoAbono };
        } else {
          simulatedAbonos.push({ cuota, monto: montoAbono, fecha: new Date().toISOString().split('T')[0] });
        }
      }
    }
    const resultadoSimulado = calcularAmortizacion(prestamo, simulatedAbonos);
    const nuevosTotalAbonos = simulatedAbonos.reduce((sum, a) => sum + a.monto, 0);
    const abonosAdicionales = nuevosTotalAbonos - resultado.resumen.totalAbonos;
    return {
      resultado: resultadoSimulado,
      totalAbonoSimulado: abonosAdicionales,
      cantidadAbonos: Math.ceil(duracionMeses / frecuencia),
    };
  }, [prestamo, montoAbono, frecuencia, duracionMeses, resultado]);

  if (!resultado || !simulacion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="flash" size={32} color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando simulador...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const comparacion = {
    plazoOriginal: resultado.resumen.plazoOriginal,
    plazoActual: resultado.resumen.plazoReal,
    plazoSimulado: simulacion.resultado.resumen.plazoReal,
    mesesAdicionales: resultado.resumen.plazoReal - simulacion.resultado.resumen.plazoReal,
    interesesSimulados: simulacion.resultado.resumen.totalInteresesConAbonos,
    ahorroAdicional: resultado.resumen.totalInteresesConAbonos - simulacion.resultado.resumen.totalInteresesConAbonos,
  };

  const chartWidth = Math.min(screenWidth - 80, 600);
  const sampleRate = Math.ceil(resultado.cronogramaSinAbonos.length / 20);

  const originalData = resultado.cronogramaSinAbonos
    .filter((_, i) => i % sampleRate === 0)
    .map(item => ({ value: item.saldoFinal / 1000000 }));
  const actualData = resultado.cronograma
    .filter((_, i) => i % sampleRate === 0)
    .map(item => ({ value: item.saldoFinal / 1000000 }));
  while (actualData.length < originalData.length) actualData.push({ value: 0 });
  const simulatedData = simulacion.resultado.cronograma
    .filter((_, i) => i % sampleRate === 0)
    .map(item => ({ value: item.saldoFinal / 1000000 }));
  while (simulatedData.length < originalData.length) simulatedData.push({ value: 0 });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.headerIcon}>
            <Ionicons name="flash" size={20} color={Colors.textOnGreen} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Simulador</Text>
            <Text style={styles.subtitle}>¿Qué pasaría si abonas más?</Text>
          </View>
        </View>

        {/* Controls */}
        <GlassCard style={styles.controlsCard}>
          <Text style={styles.controlsTitle}>CONFIGURA TU ESTRATEGIA</Text>

          {/* Amount slider */}
          <View style={styles.sliderBlock}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>¿Cuánto puedes abonar?</Text>
              <Text style={styles.sliderValue}>{formatCurrency(montoAbono)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={100000}
              maximumValue={2000000}
              step={50000}
              value={montoAbono}
              onValueChange={setMontoAbono}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>$100K</Text>
              <Text style={styles.sliderRangeText}>$2M</Text>
            </View>
          </View>

          {/* Frequency slider */}
          <View style={styles.sliderBlock}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>¿Cada cuántos meses?</Text>
              <Text style={styles.sliderValue}>Cada {frecuencia} {frecuencia === 1 ? 'mes' : 'meses'}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={6}
              step={1}
              value={frecuencia}
              onValueChange={setFrecuencia}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>Mensual</Text>
              <Text style={styles.sliderRangeText}>Semestral</Text>
            </View>
          </View>

          {/* Duration slider */}
          <View style={[styles.sliderBlock, { marginBottom: 0 }]}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>¿Por cuánto tiempo?</Text>
              <Text style={styles.sliderValue}>{duracionMeses} meses</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={6}
              maximumValue={60}
              step={6}
              value={duracionMeses}
              onValueChange={setDuracionMeses}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderRange}>
              <Text style={styles.sliderRangeText}>6 meses</Text>
              <Text style={styles.sliderRangeText}>5 años</Text>
            </View>
          </View>
        </GlassCard>

        {/* Results label */}
        <Text style={styles.resultsLabel}>CON ESTA ESTRATEGIA</Text>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <KPICard
            icon="flag-outline"
            title="Terminas en"
            value={`Mes ${comparacion.plazoSimulado}`}
            subtitle={`${comparacion.mesesAdicionales} meses más corto`}
            variant="success"
            animated={false}
          />
          <KPICard
            icon="trending-down-outline"
            title="Ahorro extra"
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
            icon="receipt-outline"
            title="Intereses Totales"
            value={comparacion.interesesSimulados}
            prefix="$"
            subtitle="proyectados"
            variant="warning"
          />
        </View>

        {/* Chart */}
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
                <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
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
              color1={Colors.primary}
              color2={Colors.textMuted}
              color3={Colors.alert}
              thickness1={3}
              thickness2={2}
              thickness3={2}
              curved
              areaChart
              startFillColor1={Colors.primary}
              endFillColor1="transparent"
              startOpacity1={0.25}
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

        {/* Plazo comparison */}
        <GlassCard style={styles.comparacionCard}>
          <Text style={styles.comparacionTitle}>COMPARACIÓN DE PLAZOS</Text>
          <View style={styles.comparacionRow}>
            <View style={styles.comparacionItem}>
              <Text style={styles.comparacionLabel}>Original</Text>
              <Text style={[styles.comparacionValue, { color: Colors.alert, textDecorationLine: 'line-through' }]}>
                {comparacion.plazoOriginal}m
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={Colors.textMuted} />
            <View style={styles.comparacionItem}>
              <Text style={styles.comparacionLabel}>Actual</Text>
              <Text style={[styles.comparacionValue, { color: Colors.textSecondary }]}>{comparacion.plazoActual}m</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
            <View style={styles.comparacionItem}>
              <Text style={styles.comparacionLabel}>Simulado</Text>
              <Text style={[styles.comparacionValue, { color: Colors.primary }]}>{comparacion.plazoSimulado}m</Text>
            </View>
          </View>
        </GlassCard>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: Typography.size.md, color: Colors.textSecondary },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  controlsCard: { marginBottom: Spacing.xl, gap: Spacing.md },
  controlsTitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  sliderBlock: { marginBottom: Spacing.lg },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  sliderLabel: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  sliderValue: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.primary },
  slider: { width: '100%', height: 36 },
  sliderRange: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  sliderRangeText: { fontSize: Typography.size.xs, color: Colors.textMuted },
  resultsLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  kpiRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  chartCard: { marginTop: Spacing.md, marginBottom: Spacing.md },
  chartHeader: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  chartTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  chartLegend: { flexDirection: 'row', gap: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: Typography.size.xs, color: Colors.textSecondary },
  chartWrapper: { paddingHorizontal: Spacing.sm, marginLeft: -10, overflow: 'hidden' },
  comparacionCard: { marginTop: Spacing.md },
  comparacionTitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  comparacionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  comparacionItem: { alignItems: 'center', gap: 4 },
  comparacionLabel: { fontSize: Typography.size.xs, color: Colors.textMuted },
  comparacionValue: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
});
