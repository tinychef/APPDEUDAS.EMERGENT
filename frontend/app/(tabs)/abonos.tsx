import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, formatMonthYear, ExtraPayment } from '../../utils/amortizacion';

export default function AbonosScreen() {
  const { abonos, resultado, addAbono, removeAbono } = useDebtStore();
  const [showModal, setShowModal] = useState(false);
  const [newAbono, setNewAbono] = useState({ cuota: '', monto: '' });

  const handleAddAbono = () => {
    const cuota = parseInt(newAbono.cuota);
    const monto = parseFloat(newAbono.monto.replace(/[^0-9]/g, ''));

    if (isNaN(cuota) || cuota <= 0) {
      Alert.alert('Error', 'Ingresa un número de cuota válido');
      return;
    }
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + cuota - 1);

    addAbono({
      cuota,
      monto,
      fecha: fecha.toISOString().split('T')[0],
    });

    setNewAbono({ cuota: '', monto: '' });
    setShowModal(false);
    Alert.alert('Éxito', 'Abono registrado correctamente');
  };

  const totalAbonos = abonos.reduce((sum, a) => sum + a.monto, 0);
  const cronograma = resultado?.cronograma || [];

  // Get impact info for each abono
  const getAbonoImpact = (cuota: number) => {
    const payment = cronograma.find(c => c.cuota === cuota);
    if (!payment) return null;
    return {
      saldoAntes: payment.saldoFinal + payment.abonoCapital,
      saldoDespues: payment.saldoFinal,
      fecha: payment.fecha,
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Abonos Extraordinarios</Text>
          <Text style={styles.subtitle}>
            Total aportado: {formatCurrency(totalAbonos)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.background} />
          <Text style={styles.addButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Card */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Abonos</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                {abonos.length}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Monto Total</Text>
              <Text style={[styles.summaryValue, { color: Colors.positive }]}>
                {formatCurrency(totalAbonos)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Meses Ahorrados</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                {resultado?.resumen.mesesAhorrados || 0}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Timeline */}
        <View style={styles.timeline}>
          {cronograma.slice(0, 24).map((payment, index) => {
            const abono = abonos.find(a => a.cuota === payment.cuota);
            const hasAbono = !!abono;
            const isLargest = abono && abono.monto === Math.max(...abonos.map(a => a.monto));

            return (
              <View key={payment.cuota} style={styles.timelineItem}>
                {/* Timeline line */}
                {index < cronograma.slice(0, 24).length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    hasAbono && { backgroundColor: Colors.primary }
                  ]} />
                )}
                
                {/* Timeline dot */}
                <View style={[
                  styles.timelineDot,
                  hasAbono && styles.timelineDotActive,
                  isLargest && styles.timelineDotLargest,
                ]}>
                  {hasAbono && (
                    <Ionicons name="checkmark" size={12} color={Colors.background} />
                  )}
                </View>

                {/* Content */}
                <View style={[
                  styles.timelineContent,
                  hasAbono && styles.timelineContentActive,
                  isLargest && styles.timelineContentLargest,
                ]}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineMonth}>
                      {formatMonthYear(payment.fecha)}
                    </Text>
                    <Text style={styles.timelineCuota}>Cuota #{payment.cuota}</Text>
                  </View>

                  {hasAbono ? (
                    <View style={styles.abonoInfo}>
                      <View style={styles.abonoRow}>
                        <Text style={styles.abonoLabel}>Abono extra</Text>
                        <Text style={styles.abonoMonto}>
                          {formatCurrency(abono.monto)}
                        </Text>
                      </View>
                      <View style={styles.abonoRow}>
                        <Text style={styles.abonoSaldoLabel}>Saldo restante</Text>
                        <Text style={styles.abonoSaldo}>
                          {formatCurrency(payment.saldoFinal)}
                        </Text>
                      </View>
                      {isLargest && (
                        <View style={styles.largestBadge}>
                          <Ionicons name="star" size={12} color={Colors.warning} />
                          <Text style={styles.largestText}>Mayor abono</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.noAbonoInfo}>
                      <Text style={styles.noAbonoText}>Sin abono extra</Text>
                      <TouchableOpacity
                        style={styles.addAbonoButton}
                        onPress={() => {
                          setNewAbono({ cuota: String(payment.cuota), monto: '' });
                          setShowModal(true);
                        }}
                      >
                        <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                        <Text style={styles.addAbonoText}>Agregar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Abono Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>¿Cuánto vas a abonar?</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de cuota</Text>
              <TextInput
                style={styles.input}
                value={newAbono.cuota}
                onChangeText={(text) => setNewAbono(prev => ({ ...prev, cuota: text }))}
                keyboardType="number-pad"
                placeholder="Ej: 13"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto del abono</Text>
              <TextInput
                style={styles.input}
                value={newAbono.monto}
                onChangeText={(text) => setNewAbono(prev => ({ ...prev, monto: text }))}
                keyboardType="number-pad"
                placeholder="$ 500,000"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {resultado && newAbono.monto && (
              <GlassCard style={styles.impactCard}>
                <Text style={styles.impactTitle}>IMPACTO ESTIMADO:</Text>
                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>Días que te adelantas:</Text>
                  <Text style={[styles.impactValue, { color: Colors.positive }]}>
                    +{Math.round(parseFloat(newAbono.monto.replace(/[^0-9]/g, '') || '0') / resultado.resumen.cuotaMensual * 30)} días
                  </Text>
                </View>
              </GlassCard>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddAbono}
              >
                <Text style={styles.submitButtonText}>Registrar Abono</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: Colors.background,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  summaryCard: {
    marginBottom: Spacing.xl,
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
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  timeline: {
    marginLeft: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 8,
    top: 24,
    bottom: -Spacing.lg,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 3,
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timelineDotLargest: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineContentActive: {
    borderColor: Colors.primary,
    borderLeftWidth: 3,
  },
  timelineContentLargest: {
    borderColor: Colors.warning,
    borderLeftWidth: 3,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timelineMonth: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  timelineCuota: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  abonoInfo: {
    gap: Spacing.sm,
  },
  abonoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  abonoLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  abonoMonto: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  abonoSaldoLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  abonoSaldo: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  largestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  largestText: {
    fontSize: Typography.size.xs,
    color: Colors.warning,
    fontWeight: Typography.weight.medium,
  },
  noAbonoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noAbonoText: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
  addAbonoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addAbonoText: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  impactCard: {
    marginVertical: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  impactTitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  impactValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
    fontSize: Typography.size.md,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  submitButtonText: {
    color: Colors.background,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.md,
  },
});
