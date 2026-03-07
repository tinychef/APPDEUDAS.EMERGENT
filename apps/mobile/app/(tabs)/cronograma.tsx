import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, formatMonthYear, PaymentRow, formatShortCurrency } from '../../utils/amortizacion';

type FilterType = 'all' | 'with-extra' | 'year';

export default function CronogramaScreen() {
  const { resultado, abonos } = useDebtStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const cronograma = resultado?.cronograma || [];

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    cronograma.forEach(row => yearSet.add(row.fecha.getFullYear()));
    return Array.from(yearSet).sort();
  }, [cronograma]);

  const filteredData = useMemo(() => {
    let data = [...cronograma];
    if (filter === 'with-extra') data = data.filter(row => row.abonoExtra > 0);
    else if (filter === 'year' && selectedYear) data = data.filter(row => row.fecha.getFullYear() === selectedYear);
    return data;
  }, [cronograma, filter, selectedYear]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA': return Colors.positive;
      case 'PROXIMA': return Colors.primary;
      default: return Colors.textMuted;
    }
  };

  const renderRow = ({ item }: { item: PaymentRow }) => {
    const hasExtra = item.abonoExtra > 0;
    const isProxima = item.estado === 'PROXIMA';
    const isPagada = item.estado === 'PAGADA';

    return (
      <View style={[
        styles.row,
        hasExtra && styles.rowWithExtra,
        isProxima && styles.rowProxima,
      ]}>
        {/* Cuota + status */}
        <View style={styles.cellLeft}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.estado) }]} />
          <View>
            <Text style={[styles.cuotaNumber, isPagada && { color: Colors.textMuted }]}>#{item.cuota}</Text>
            <Text style={styles.dateText}>{formatMonthYear(item.fecha)}</Text>
          </View>
        </View>

        {/* Amounts */}
        <View style={styles.cellAmount}>
          <Text style={styles.amountLabel}>Interés</Text>
          <Text style={[styles.amountValue, { color: Colors.alert }]}>{formatShortCurrency(item.interes)}</Text>
        </View>

        <View style={styles.cellAmount}>
          <Text style={styles.amountLabel}>Capital</Text>
          <Text style={[styles.amountValue, { color: Colors.primary }]}>
            {formatShortCurrency(item.abonoCapital)}
            {hasExtra && <Text style={styles.extraPlus}> +</Text>}
          </Text>
        </View>

        <View style={styles.cellBalance}>
          <Text style={styles.amountLabel}>Saldo</Text>
          <Text style={styles.balanceValue}>{formatShortCurrency(item.saldoFinal)}</Text>
        </View>

        {/* Status icon */}
        <View style={styles.cellStatus}>
          {isProxima ? (
            <View style={styles.proximaBadge}>
              <Text style={styles.proximaText}>HOY</Text>
            </View>
          ) : (
            <Ionicons
              name={isPagada ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={getStatusColor(item.estado)}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cronograma</Text>
        <Text style={styles.subtitle}>{cronograma.length} cuotas · {abonos.length} con abono extra</Text>
      </View>

      {/* KPI Strip */}
      {resultado && (
        <View style={styles.kpiStrip}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Cuota fija</Text>
            <Text style={styles.kpiValue}>{formatShortCurrency(resultado.resumen.cuotaMensual)}</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Total intereses</Text>
            <Text style={[styles.kpiValue, { color: Colors.alert }]}>
              {formatShortCurrency(resultado.resumen.totalInteresesConAbonos)}
            </Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Ahorro</Text>
            <Text style={[styles.kpiValue, { color: Colors.primary }]}>
              {formatShortCurrency(resultado.resumen.ahorroIntereses)}
            </Text>
          </View>
        </View>
      )}

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'Todas' },
          { key: 'with-extra', label: 'Con abonos' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
            onPress={() => setFilter(f.key as FilterType)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        {years.map(year => (
          <TouchableOpacity
            key={year}
            style={[styles.filterButton, filter === 'year' && selectedYear === year && styles.filterButtonActive]}
            onPress={() => { setFilter('year'); setSelectedYear(year); }}
          >
            <Text style={[styles.filterText, filter === 'year' && selectedYear === year && styles.filterTextActive]}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>CUOTA</Text>
        <Text style={styles.tableHeaderCell}>INTERÉS</Text>
        <Text style={styles.tableHeaderCell}>CAPITAL</Text>
        <Text style={styles.tableHeaderCell}>SALDO</Text>
        <View style={styles.cellStatus} />
      </View>

      {/* Table */}
      <FlatList
        data={filteredData}
        renderItem={renderRow}
        keyExtractor={(item) => `cuota-${item.cuota}`}
        style={styles.table}
        contentContainerStyle={styles.tableContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={25}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  kpiStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  kpiItem: { flex: 1, alignItems: 'center', gap: 2 },
  kpiDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  kpiLabel: { fontSize: Typography.size.xs, color: Colors.textMuted },
  kpiValue: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  filterContainer: { maxHeight: 48, flexGrow: 0 },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
    paddingBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  filterTextActive: { color: Colors.textOnGreen, fontWeight: Typography.weight.semibold },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: Typography.weight.semibold,
  },
  table: { flex: 1 },
  tableContent: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowWithExtra: { borderLeftWidth: 2, borderLeftColor: Colors.primary },
  rowProxima: { borderColor: Colors.borderGreen, backgroundColor: Colors.primaryGlow },
  cellLeft: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  cuotaNumber: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  dateText: { fontSize: Typography.size.xs, color: Colors.textMuted },
  cellAmount: { flex: 1 },
  amountLabel: { fontSize: 9, color: Colors.textMuted, marginBottom: 1, letterSpacing: 0.3 },
  amountValue: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, color: Colors.textPrimary },
  extraPlus: { color: Colors.primary, fontWeight: Typography.weight.bold },
  cellBalance: { flex: 1 },
  balanceValue: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, color: Colors.textPrimary },
  cellStatus: { width: 36, alignItems: 'center' },
  proximaBadge: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  proximaText: { fontSize: 8, color: Colors.primary, fontWeight: Typography.weight.bold, letterSpacing: 0.5 },
});
