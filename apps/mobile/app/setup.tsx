import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebtStore } from '../store/debtStore';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { calcularCuotaMensual, tasaEAtoEM, formatCurrency } from '../utils/amortizacion';

export default function SetupScreen() {
  const router = useRouter();
  const { setPrestamo, prestamo, hasSetup } = useDebtStore();

  const [monto, setMonto] = useState(prestamo.monto > 0 ? String(prestamo.monto) : '101400000');
  const [tasaEA, setTasaEA] = useState(prestamo.tasaEA > 0 ? String(prestamo.tasaEA * 100) : '12.01');
  const [plazoAnios, setPlazoAnios] = useState(prestamo.plazoMeses > 0 ? String(prestamo.plazoMeses / 12) : '15');
  const [fechaDesembolso, setFechaDesembolso] = useState(prestamo.fechaDesembolso || '2025-03-25');
  const [estrategia, setEstrategia] = useState<'REDUCIR_PLAZO' | 'REDUCIR_CUOTA'>(prestamo.estrategia || 'REDUCIR_PLAZO');

  const previewCuota = (() => {
    const m = parseFloat(monto.replace(/[^0-9]/g, '')) || 0;
    const t = parseFloat(tasaEA) / 100 || 0;
    const p = (parseFloat(plazoAnios) || 0) * 12;
    if (m > 0 && t > 0 && p > 0) return calcularCuotaMensual(m, tasaEAtoEM(t), p);
    return 0;
  })();

  const handleSubmit = () => {
    const montoNum = parseFloat(monto.replace(/[^0-9]/g, ''));
    const tasaNum = parseFloat(tasaEA) / 100;
    const plazoNum = parseFloat(plazoAnios) * 12;
    if (!montoNum || montoNum <= 0) { Alert.alert('Error', 'Ingresa un monto válido'); return; }
    if (!tasaNum || tasaNum <= 0) { Alert.alert('Error', 'Ingresa una tasa válida'); return; }
    if (!plazoNum || plazoNum <= 0) { Alert.alert('Error', 'Ingresa un plazo válido'); return; }
    setPrestamo({ monto: montoNum, tasaEA: tasaNum, plazoMeses: plazoNum, fechaDesembolso, estrategia });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.logoCircle}>
              <Text style={styles.logoText}>₣</Text>
            </LinearGradient>
            <Text style={styles.title}>FREEDEUDA</Text>
            <Text style={styles.subtitle}>Configura tu crédito para comenzar</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Monto */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>MONTO DEL PRÉSTAMO</Text>
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="number-pad"
                  placeholder="101,400,000"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Tasa */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>TASA DE INTERÉS (E.A.)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={tasaEA}
                  onChangeText={setTasaEA}
                  keyboardType="decimal-pad"
                  placeholder="12.01"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.suffix}>%</Text>
              </View>
            </View>

            {/* Plazo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PLAZO</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={plazoAnios}
                  onChangeText={setPlazoAnios}
                  keyboardType="number-pad"
                  placeholder="15"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.suffix}>años</Text>
              </View>
            </View>

            {/* Fecha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FECHA DE DESEMBOLSO</Text>
              <View style={styles.inputRow}>
                <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  value={fechaDesembolso}
                  onChangeText={setFechaDesembolso}
                  placeholder="2025-03-25"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Estrategia */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ESTRATEGIA DE ABONO</Text>
              <View style={styles.strategyRow}>
                {[
                  { key: 'REDUCIR_PLAZO', label: 'Reducir plazo', icon: 'time-outline' },
                  { key: 'REDUCIR_CUOTA', label: 'Reducir cuota', icon: 'cash-outline' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.strategyBtn, estrategia === s.key && styles.strategyBtnActive]}
                    onPress={() => setEstrategia(s.key as any)}
                  >
                    <Ionicons
                      name={s.icon as any}
                      size={18}
                      color={estrategia === s.key ? Colors.textOnGreen : Colors.textSecondary}
                    />
                    <Text style={[styles.strategyLabel, estrategia === s.key && styles.strategyLabelActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Preview */}
          {previewCuota > 0 && (
            <GlassCard style={styles.preview} variant="success">
              <Text style={styles.previewLabel}>Tu cuota mensual estimada</Text>
              <Text style={styles.previewValue}>{formatCurrency(Math.round(previewCuota))}</Text>
            </GlassCard>
          )}

          {/* CTA */}
          <GlassButton title="CALCULAR MI DEUDA" variant="primary" size="lg" onPress={handleSubmit}
            icon={<Ionicons name="arrow-forward" size={20} color={Colors.textOnGreen} />}
            style={styles.cta}
          />

          {hasSetup && (
            <TouchableOpacity style={styles.skip} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.skipText}>Ir al Dashboard</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: Spacing['4xl'] },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: Colors.textOnGreen },
  title: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  form: { gap: Spacing.xl, marginBottom: Spacing['2xl'] },
  fieldGroup: { gap: Spacing.sm },
  fieldLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textMuted,
    letterSpacing: 1.2,
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
  prefix: {
    fontSize: Typography.size.xl,
    color: Colors.textMuted,
    marginRight: Spacing.sm,
  },
  suffix: {
    fontSize: Typography.size.md,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    paddingVertical: Spacing.lg,
  },
  strategyRow: { flexDirection: 'row', gap: Spacing.md },
  strategyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  strategyBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  strategyLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  strategyLabelActive: { color: Colors.textOnGreen },
  preview: { alignItems: 'center', marginBottom: Spacing.xl },
  previewLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  previewValue: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    letterSpacing: -1,
  },
  cta: { marginBottom: Spacing.lg },
  skip: { alignItems: 'center', paddingVertical: Spacing.md },
  skipText: {
    fontSize: Typography.size.md,
    color: Colors.textMuted,
  },
});
