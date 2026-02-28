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
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, formatMonthYear, PaymentRow } from '../../utils/amortizacion';

type FilterType = 'all' | 'with-extra' | 'year';

export default function CronogramaScreen() {
  const { resultado, abonos } = useDebtStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const cronograma = resultado?.cronograma || [];
  
  // Get unique years from cronograma
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    cronograma.forEach(row => yearSet.add(row.fecha.getFullYear()));
    return Array.from(yearSet).sort();
  }, [cronograma]);

  // Filter data
  const filteredData = useMemo(() => {
    let data = [...cronograma];
    
    if (filter === 'with-extra') {
      data = data.filter(row => row.abonoExtra > 0);
    } else if (filter === 'year' && selectedYear) {
      data = data.filter(row => row.fecha.getFullYear() === selectedYear);
    }
    
    return data;
  }, [cronograma, filter, selectedYear]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA': return Colors.positive;
      case 'PROXIMA': return Colors.primary;
      default: return Colors.textMuted;
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'PAGADA': return 'checkmark-circle';
      case 'PROXIMA': return 'time';
      default: return 'ellipse-outline';
    }
  };

  const renderRow = ({ item }: { item: PaymentRow }) => {
    const hasExtra = item.abonoExtra > 0;
    const isProxima = item.estado === 'PROXIMA';
    
    return (
      <View style={[
        styles.row,
        hasExtra && styles.rowWithExtra,
        isProxima && styles.rowProxima,
      ]}>
        {/* Cuota number */}
        <View style={styles.cellCuota}>
          <Text style={styles.cuotaNumber}>#{item.cuota}</Text>
          {hasExtra && (
            <View style={styles.extraDot} />
          )}
        </View>

        {/* Date */}
        <View style={styles.cellDate}>
          <Text style={styles.dateText}>
            {formatMonthYear(item.fecha)}
          </Text>
        </View>

        {/* Cuota Fija */}
        <View style={styles.cellAmount}>
          <Text style={styles.amountLabel}>Cuota</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(item.cuotaMensual)}
          </Text>
        </View>

        {/* Interest */}
        <View style={styles.cellAmount}>
          <Text style={styles.amountLabel}>Interés</Text>
          <Text style={[styles.amountValue, { color: Colors.alert }]}>
            {formatCurrency(item.interes)}
          </Text>
        </View>

        {/* Capital */}
        <View style={styles.cellAmount}>
          <Text style={styles.amountLabel}>Capital</Text>
          <Text style={[styles.amountValue, { color: Colors.primary }]}>
            {formatCurrency(item.abonoCapital)}
            {hasExtra && (
              <Text style={styles.extraIndicator}> +</Text>
            )}
          </Text>
        </View>

        {/* Balance */}
        <View style={styles.cellBalance}>
          <Text style={styles.amountLabel}>Saldo</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(item.saldoFinal)}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.cellStatus}>
          <Ionicons
            name={getStatusIcon(item.estado) as any}
            size={20}
            color={getStatusColor(item.estado)}
          />
          {isProxima && (
            <Text style={styles.proximaText}>PRÓXIMA</Text>
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
        <Text style={styles.title}>Cronograma de Pagos</Text>
        <Text style={styles.subtitle}>
          {cronograma.length} cuotas programadas
        </Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'with-extra' && styles.filterButtonActive]}
          onPress={() => setFilter('with-extra')}
        >
          <View style={styles.filterWithDot}>
            <View style={styles.filterDot} />
            <Text style={[styles.filterText, filter === 'with-extra' && styles.filterTextActive]}>
              Con abonos
            </Text>
          </View>
        </TouchableOpacity>

        {years.map(year => (
          <TouchableOpacity
            key={year}
            style={[
              styles.filterButton,
              filter === 'year' && selectedYear === year && styles.filterButtonActive
            ]}
            onPress={() => {
              setFilter('year');
              setSelectedYear(year);
            }}
          >
            <Text style={[
              styles.filterText,
              filter === 'year' && selectedYear === year && styles.filterTextActive
            ]}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary */}
      <GlassCard style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Mostrando</Text>
            <Text style={styles.summaryValue}>{filteredData.length} cuotas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Con abono extra</Text>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>
              {filteredData.filter(r => r.abonoExtra > 0).length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pagadas</Text>
            <Text style={[styles.summaryValue, { color: Colors.positive }]}>
              {filteredData.filter(r => r.estado === 'PAGADA').length}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Table */}
      <FlatList
        data={filteredData}
        renderItem={renderRow}
        keyExtractor={(item) => `cuota-${item.cuota}`}
        style={styles.table}
        contentContainerStyle={styles.tableContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
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
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.background,
    fontWeight: Typography.weight.medium,
  },
  filterWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  summaryCard: {
    margin: Spacing.lg,
    marginTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  table: {
    flex: 1,
  },
  tableContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  rowWithExtra: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  rowProxima: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.primary,
  },
  cellCuota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    width: 50,
  },
  cuotaNumber: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  extraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  cellDate: {
    width: 70,
  },
  dateText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  cellAmount: {
    flex: 1,
    minWidth: 80,
  },
  amountLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
  },
  extraIndicator: {
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
  cellBalance: {
    flex: 1,
    minWidth: 90,
  },
  balanceValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  cellStatus: {
    width: 60,
    alignItems: 'center',
  },
  proximaText: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
    marginTop: 2,
  },
});
