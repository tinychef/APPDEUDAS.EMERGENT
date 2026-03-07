import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { GlassCard } from './ui/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { formatCurrency, formatShortCurrency } from '../utils/amortizacion';

interface DonutCompositionProps {
  interes: number;
  capital: number;
  cuota: number;
}

export const DonutComposition: React.FC<DonutCompositionProps> = ({ interes, capital, cuota }) => {
  const interesPercent = (interes / cuota) * 100;
  const capitalPercent = (capital / cuota) * 100;

  const pieData = [
    { value: interesPercent, color: Colors.alert },
    { value: capitalPercent, color: Colors.primary },
  ];

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.title}>Composición de Cuota</Text>
      <Text style={styles.subtitle}>Distribución mensual actual</Text>

      <View style={styles.chartRow}>
        <PieChart
          data={pieData}
          donut
          radius={64}
          innerRadius={42}
          innerCircleColor={Colors.background}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerValue}>{formatShortCurrency(cuota)}</Text>
              <Text style={styles.centerText}>cuota</Text>
            </View>
          )}
        />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.alert }]} />
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>Interés</Text>
              <Text style={[styles.legendValue, { color: Colors.alert }]}>{formatCurrency(interes)}</Text>
              <Text style={styles.legendPercent}>{interesPercent.toFixed(1)}%</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>Capital</Text>
              <Text style={[styles.legendValue, { color: Colors.primary }]}>{formatCurrency(capital)}</Text>
              <Text style={styles.legendPercent}>{capitalPercent.toFixed(1)}%</Text>
            </View>
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.md },
  title: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semibold, color: Colors.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: Typography.size.sm, color: Colors.textMuted, marginBottom: Spacing.lg },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  centerLabel: { alignItems: 'center' },
  centerValue: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  centerText: { fontSize: Typography.size.xs, color: Colors.textMuted },
  legend: { flex: 1, gap: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  legendContent: { flex: 1, gap: 2 },
  legendLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  legendValue: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semibold },
  legendPercent: { fontSize: Typography.size.xs, color: Colors.textMuted },
});
