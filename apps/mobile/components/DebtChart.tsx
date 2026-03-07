import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { PaymentRow, formatShortCurrency } from '../utils/amortizacion';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { GlassCard } from './ui/GlassCard';

interface DebtChartProps {
  dataWithPayments: PaymentRow[];
  dataWithoutPayments: PaymentRow[];
  montoInicial?: number;
}

export const DebtChart: React.FC<DebtChartProps> = ({
  dataWithPayments,
  dataWithoutPayments,
  montoInicial,
}) => {
  const montoLabel = montoInicial ? formatShortCurrency(montoInicial) : formatShortCurrency((dataWithPayments[0]?.saldoFinal || 0) + (dataWithPayments[0]?.abonoCapital || 0));
  // Prepare data for chart (sample every nth point for performance)
  const sampleRate = Math.ceil(dataWithoutPayments.length / 30);

  const withPaymentsData = dataWithPayments
    .filter((_, i) => i % sampleRate === 0 || i === dataWithPayments.length - 1)
    .map((item) => ({
      value: item.saldoFinal / 1000000,
      dataPointText: '',
    }));

  const withoutPaymentsData = dataWithoutPayments
    .filter((_, i) => i % sampleRate === 0 || i === dataWithoutPayments.length - 1)
    .map((item) => ({
      value: item.saldoFinal / 1000000,
      dataPointText: '',
    }));

  // Pad withPaymentsData to match length if needed
  while (withPaymentsData.length < withoutPaymentsData.length) {
    withPaymentsData.push({ value: 0, dataPointText: '' });
  }

  const { width: windowWidth } = useWindowDimensions();
  // Cap chart width: subtract sidebar (250px on desktop) + card padding + margins
  const maxChartWidth = Math.min(windowWidth - 120, 600);
  const chartWidth = maxChartWidth;

  return (
    <GlassCard style={styles.container} noPadding>
      <View style={styles.header}>
        <Text style={styles.title}>Evolución de tu Deuda</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.alert }]} />
            <Text style={styles.legendText}>Sin abonos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Con abonos</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={withPaymentsData}
          data2={withoutPaymentsData}
          width={chartWidth}
          height={200}
          spacing={chartWidth / withoutPaymentsData.length}
          color1={Colors.primary}
          color2={Colors.alert}
          thickness1={3}
          thickness2={2}
          dataPointsColor1={Colors.primary}
          dataPointsColor2={Colors.alert}
          dataPointsRadius1={0}
          dataPointsRadius2={0}
          curved
          areaChart
          startFillColor1={Colors.primary}
          endFillColor1="transparent"
          startOpacity1={0.3}
          endOpacity1={0}
          startFillColor2={Colors.alert}
          endFillColor2="transparent"
          startOpacity2={0.1}
          endOpacity2={0}
          hideRules
          yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
          yAxisColor={Colors.border}
          xAxisColor={Colors.border}
          noOfSections={4}
          yAxisLabelSuffix="M"
          hideDataPoints
          initialSpacing={10}
          endSpacing={10}
          adjustToWidth
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Deuda inicial</Text>
          <Text style={styles.footerValue}>{montoLabel}</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Fin con abonos</Text>
          <Text style={[styles.footerValue, { color: Colors.primary }]}>Mes {dataWithPayments.length}</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Fin original</Text>
          <Text style={[styles.footerValue, { color: Colors.alert }]}>Mes {dataWithoutPayments.length}</Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  legend: {
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
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  footerLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
});
