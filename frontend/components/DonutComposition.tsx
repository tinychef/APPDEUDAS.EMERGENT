import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { GlassCard } from './GlassCard';
import { Colors, Typography, Spacing } from '../constants/theme';
import { formatCurrency } from '../utils/amortizacion';

interface DonutCompositionProps {
  interes: number;
  capital: number;
  cuota: number;
}

export const DonutComposition: React.FC<DonutCompositionProps> = ({
  interes,
  capital,
  cuota,
}) => {
  const interesPercent = (interes / cuota) * 100;
  const capitalPercent = (capital / cuota) * 100;

  const pieData = [
    {
      value: interesPercent,
      color: Colors.alert,
      text: `${interesPercent.toFixed(1)}%`,
    },
    {
      value: capitalPercent,
      color: Colors.primary,
      text: `${capitalPercent.toFixed(1)}%`,
    },
  ];

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.title}>Composición de tu Cuota</Text>
      <Text style={styles.subtitle}>Distribución mensual actual</Text>
      
      <View style={styles.chartRow}>
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            donut
            radius={70}
            innerRadius={45}
            innerCircleColor={Colors.surface}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerValue}>{formatCurrency(cuota)}</Text>
                <Text style={styles.centerText}>Cuota</Text>
              </View>
            )}
          />
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.alert }]} />
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>Interés</Text>
              <Text style={[styles.legendValue, { color: Colors.alert }]}>
                {formatCurrency(interes)}
              </Text>
              <Text style={styles.legendPercent}>{interesPercent.toFixed(1)}%</Text>
            </View>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>Capital</Text>
              <Text style={[styles.legendValue, { color: Colors.primary }]}>
                {formatCurrency(capital)}
              </Text>
              <Text style={styles.legendPercent}>{capitalPercent.toFixed(1)}%</Text>
            </View>
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  centerText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  legendContainer: {
    flex: 1,
    marginLeft: Spacing.xl,
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  legendValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
  legendPercent: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
});
