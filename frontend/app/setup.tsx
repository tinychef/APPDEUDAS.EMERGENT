import React, { useState, useEffect } from 'react';
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
import { useDebtStore } from '../store/debtStore';
import { GlassCard } from '../components/GlassCard';
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

  // Calculate preview
  const previewCuota = (() => {
    const m = parseFloat(monto.replace(/[^0-9]/g, '')) || 0;
    const t = parseFloat(tasaEA) / 100 || 0;
    const p = (parseFloat(plazoAnios) || 0) * 12;
    if (m > 0 && t > 0 && p > 0) {
      const tasaEM = tasaEAtoEM(t);
      return calcularCuotaMensual(m, tasaEM, p);
    }
    return 0;
  })();

  const handleSubmit = () => {
    const montoNum = parseFloat(monto.replace(/[^0-9]/g, ''));
    const tasaNum = parseFloat(tasaEA) / 100;
    const plazoNum = parseFloat(plazoAnios) * 12;

    if (!montoNum || montoNum <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    if (!tasaNum || tasaNum <= 0) {
      Alert.alert('Error', 'Ingresa una tasa de interés válida');
      return;
    }
    if (!plazoNum || plazoNum <= 0) {
      Alert.alert('Error', 'Ingresa un plazo válido');
      return;
    }

    setPrestamo({
      monto: montoNum,
      tasaEA: tasaNum,
      plazoMeses: plazoNum,
      fechaDesembolso,
      estrategia,
    });

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="map" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>DebtMap</Text>
            <Text style={styles.subtitle}>Configura tu préstamo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Monto */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MONTO DEL PRÉSTAMO</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefix}>$</Text>
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

            {/* Tasa de Interés */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TASA DE INTERÉS (E.A.)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={tasaEA}
                  onChangeText={setTasaEA}
                  keyboardType="decimal-pad"
                  placeholder="12.01"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
            </View>

            {/* Plazo */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PLAZO</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={plazoAnios}
                  onChangeText={setPlazoAnios}
                  keyboardType="number-pad"
                  placeholder="15"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.inputSuffix}>años</Text>
              </View>
            </View>

            {/* Fecha de Desembolso */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FECHA DE DESEMBOLSO</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
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
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ESTRATEGIA DE ABONO</Text>
              <View style={styles.strategyRow}>
                <TouchableOpacity
                  style={[
                    styles.strategyButton,
                    estrategia === 'REDUCIR_PLAZO' && styles.strategyButtonActive,
                  ]}
                  onPress={() => setEstrategia('REDUCIR_PLAZO')}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={estrategia === 'REDUCIR_PLAZO' ? Colors.background : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.strategyText,
                      estrategia === 'REDUCIR_PLAZO' && styles.strategyTextActive,
                    ]}
                  >
                    Reducir Plazo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.strategyButton,
                    estrategia === 'REDUCIR_CUOTA' && styles.strategyButtonActive,
                  ]}
                  onPress={() => setEstrategia('REDUCIR_CUOTA')}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={estrategia === 'REDUCIR_CUOTA' ? Colors.background : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.strategyText,
                      estrategia === 'REDUCIR_CUOTA' && styles.strategyTextActive,
                    ]}
                  >
                    Reducir Cuota
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Preview */}
          {previewCuota > 0 && (
            <GlassCard style={styles.previewCard} variant="highlight">
              <Text style={styles.previewLabel}>Tu cuota mensual será:</Text>
              <Text style={styles.previewValue}>{formatCurrency(Math.round(previewCuota))}</Text>
            </GlassCard>
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>CALCULAR MI DEUDA</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.background} />
          </TouchableOpacity>

          {/* Skip to Demo */}
          {hasSetup && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.skipText}>Ir al Dashboard</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  inputPrefix: {
    fontSize: Typography.size.xl,
    color: Colors.textMuted,
    marginRight: Spacing.sm,
  },
  inputSuffix: {
    fontSize: Typography.size.md,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  strategyRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  strategyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  strategyButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  strategyText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  strategyTextActive: {
    color: Colors.background,
  },
  previewCard: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  previewValue: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  submitText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.background,
    letterSpacing: 1,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  skipText: {
    fontSize: Typography.size.md,
    color: Colors.textMuted,
  },
});
