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
import { LinearGradient } from 'expo-linear-gradient';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, formatMonthYear, ExtraPayment } from '../../utils/amortizacion';

export default function AbonosScreen() {
  const { abonos, resultado, addAbono, removeAbono } = useDebtStore();
  const [showModal, setShowModal] = useState(false);
  const [newAbono, setNewAbono] = useState({ cuota: '', monto: '' });
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const handleAddAbono = () => {
    const cuota = parseInt(newAbono.cuota);
    const monto = parseFloat(newAbono.monto.replace(/[^0-9]/g, ''));
    if (isNaN(cuota) || cuota <= 0) { Alert.alert('Error', 'Ingresa un número de cuota válido'); return; }
    if (isNaN(monto) || monto <= 0) { Alert.alert('Error', 'Ingresa un monto válido'); return; }
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + cuota - 1);
    addAbono({ cuota, monto, fecha: fecha.toISOString().split('T')[0] });
    setNewAbono({ cuota: '', monto: '' });
    setShowModal(false);
    Alert.alert('Éxito', 'Abono registrado correctamente');
  };

  const totalAbonos = abonos.reduce((sum, a) => sum + a.monto, 0);
  const cronograma = resultado?.cronograma || [];
  const maxAbono = abonos.length > 0 ? Math.max(...abonos.map(a => a.monto)) : 0;
  const displayList = mostrarTodos ? cronograma : cronograma.slice(0, 24);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pagos Extras</Text>
          <Text style={styles.subtitle}>{formatCurrency(totalAbonos)} aportados</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.addBtnGradient}>
            <Ionicons name="add" size={22} color={Colors.textOnGreen} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Summary Strip */}
        <GlassCard style={styles.summaryCard} variant="green">
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Abonos</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>{abonos.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={[styles.summaryValue, { color: Colors.primaryLight }]}>{formatCurrency(totalAbonos)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Meses ahorrados</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>{resultado?.resumen.mesesAhorrados || 0}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Timeline */}
        <View style={styles.timeline}>
          {displayList.map((payment, index) => {
            const abono = abonos.find(a => a.cuota === payment.cuota);
            const hasAbono = !!abono;
            const isLargest = abono && abono.monto === maxAbono;

            return (
              <View key={payment.cuota} style={styles.timelineItem}>
                {/* Connector line */}
                {index < displayList.length - 1 && (
                  <View style={[styles.timelineLine, hasAbono && { backgroundColor: Colors.primaryGlow }]} />
                )}

                {/* Dot */}
                <View style={[
                  styles.timelineDot,
                  hasAbono && styles.timelineDotActive,
                  isLargest && styles.timelineDotLargest,
                ]}>
                  {hasAbono && <Ionicons name="checkmark" size={10} color={Colors.textOnGreen} />}
                </View>

                {/* Card */}
                <GlassCard
                  style={[
                    styles.timelineContent,
                    hasAbono && { borderLeftWidth: 2, borderLeftColor: isLargest ? Colors.warning : Colors.primary },
                  ]}
                >
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineMonth}>{formatMonthYear(payment.fecha)}</Text>
                    <Text style={styles.timelineCuota}>Cuota #{payment.cuota}</Text>
                  </View>

                  {hasAbono ? (
                    <View style={styles.abonoInfo}>
                      <View style={styles.abonoRow}>
                        <Text style={styles.abonoLabel}>Abono extra</Text>
                        <Text style={styles.abonoMonto}>{formatCurrency(abono.monto)}</Text>
                      </View>
                      <View style={styles.abonoRow}>
                        <Text style={styles.abonoSaldoLabel}>Saldo restante</Text>
                        <Text style={styles.abonoSaldo}>{formatCurrency(payment.saldoFinal)}</Text>
                      </View>
                      {isLargest && (
                        <View style={styles.largestBadge}>
                          <Ionicons name="star" size={11} color={Colors.warning} />
                          <Text style={styles.largestText}>Mayor abono</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => Alert.alert(
                          'Eliminar abono',
                          `¿Eliminar el abono de ${formatCurrency(abono.monto)} de la cuota #${payment.cuota}?`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Eliminar', style: 'destructive', onPress: () => removeAbono(payment.cuota) },
                          ]
                        )}
                      >
                        <Ionicons name="trash-outline" size={13} color={Colors.alert} />
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.noAbonoInfo}>
                      <Text style={styles.noAbonoText}>Sin abono extra</Text>
                      <TouchableOpacity
                        style={styles.quickAddBtn}
                        onPress={() => { setNewAbono({ cuota: String(payment.cuota), monto: '' }); setShowModal(true); }}
                      >
                        <Ionicons name="add-circle-outline" size={15} color={Colors.primary} />
                        <Text style={styles.quickAddText}>Agregar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </GlassCard>
              </View>
            );
          })}
        </View>

        {cronograma.length > 24 && (
          <TouchableOpacity style={styles.verTodosButton} onPress={() => setMostrarTodos(prev => !prev)}>
            <Text style={styles.verTodosText}>
              {mostrarTodos ? 'Ver menos' : `Ver todas las cuotas (${cronograma.length})`}
            </Text>
            <Ionicons name={mostrarTodos ? 'chevron-up' : 'chevron-down'} size={15} color={Colors.primary} />
          </TouchableOpacity>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Abono Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nuevo Abono Extra</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NÚMERO DE CUOTA</Text>
              <View style={styles.inputRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  value={newAbono.cuota}
                  onChangeText={(t) => setNewAbono(p => ({ ...p, cuota: t }))}
                  keyboardType="number-pad"
                  placeholder="Ej: 13"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MONTO DEL ABONO</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={newAbono.monto}
                  onChangeText={(t) => setNewAbono(p => ({ ...p, monto: t }))}
                  keyboardType="number-pad"
                  placeholder="500,000"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {resultado && newAbono.monto && (
              <GlassCard style={styles.impactCard} variant="success">
                <Text style={styles.impactTitle}>IMPACTO ESTIMADO</Text>
                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>Días que te adelantas</Text>
                  <Text style={[styles.impactValue, { color: Colors.primary }]}>
                    +{Math.round(parseFloat(newAbono.monto.replace(/[^0-9]/g, '') || '0') / resultado.resumen.cuotaMensual * 30)} días
                  </Text>
                </View>
              </GlassCard>
            )}

            <View style={styles.modalButtons}>
              <GlassButton title="Cancelar" variant="ghost" onPress={() => setShowModal(false)} style={{ flex: 1 }} />
              <GlassButton
                title="Registrar"
                variant="primary"
                icon={<Ionicons name="checkmark" size={18} color={Colors.textOnGreen} />}
                onPress={handleAddAbono}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { borderRadius: 24, overflow: 'hidden' },
  addBtnGradient: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  summaryCard: { marginBottom: Spacing.xl },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  summaryDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  summaryLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 0.5 },
  summaryValue: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
  timeline: { marginLeft: Spacing.sm },
  timelineItem: { flexDirection: 'row', marginBottom: Spacing.md, position: 'relative' },
  timelineLine: {
    position: 'absolute',
    left: 8,
    top: 22,
    bottom: -Spacing.md,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 4,
    zIndex: 1,
  },
  timelineDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timelineDotLargest: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  timelineContent: { flex: 1 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  timelineMonth: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: Colors.textPrimary },
  timelineCuota: { fontSize: Typography.size.xs, color: Colors.textMuted },
  abonoInfo: { gap: Spacing.xs },
  abonoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  abonoLabel: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  abonoMonto: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.primary },
  abonoSaldoLabel: { fontSize: Typography.size.xs, color: Colors.textMuted },
  abonoSaldo: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  largestBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  largestText: { fontSize: Typography.size.xs, color: Colors.warning, fontWeight: Typography.weight.medium },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  deleteButtonText: { fontSize: Typography.size.xs, color: Colors.alert, fontWeight: Typography.weight.medium },
  noAbonoInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noAbonoText: { fontSize: Typography.size.sm, color: Colors.textMuted },
  quickAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickAddText: { fontSize: Typography.size.sm, color: Colors.primary, fontWeight: Typography.weight.medium },
  verTodosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryGlow,
  },
  verTodosText: { fontSize: Typography.size.sm, color: Colors.primary, fontWeight: Typography.weight.medium },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: {
    backgroundColor: '#131A15',
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: Colors.borderGreen,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
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
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputPrefix: { fontSize: Typography.size.xl, color: Colors.textMuted, marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    paddingVertical: Spacing.lg,
  },
  impactCard: { marginVertical: Spacing.lg },
  impactTitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  impactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  impactLabel: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  impactValue: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
});
