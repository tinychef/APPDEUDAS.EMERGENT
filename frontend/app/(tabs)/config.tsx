import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, formatPercent } from '../../utils/amortizacion';

export default function ConfigScreen() {
  const router = useRouter();
  const { prestamo, loadDemoData, reset } = useDebtStore();

  const handleReset = () => {
    Alert.alert(
      'Restablecer datos',
      '¿Estás seguro de que quieres borrar todos los datos y empezar de nuevo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            reset();
            router.replace('/setup');
          },
        },
      ]
    );
  };

  const handleLoadDemo = () => {
    loadDemoData();
    Alert.alert('Éxito', 'Datos de demo cargados correctamente');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>Administra tu préstamo</Text>
        </View>

        {/* Current Loan Info */}
        <Text style={styles.sectionTitle}>Tu Préstamo Actual</Text>
        <GlassCard style={styles.loanCard}>
          <View style={styles.loanRow}>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Monto</Text>
              <Text style={styles.loanValue}>{formatCurrency(prestamo.monto)}</Text>
            </View>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Tasa E.A.</Text>
              <Text style={styles.loanValue}>{formatPercent(prestamo.tasaEA * 100)}</Text>
            </View>
          </View>
          <View style={styles.loanRow}>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Plazo</Text>
              <Text style={styles.loanValue}>{prestamo.plazoMeses} meses</Text>
            </View>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Estrategia</Text>
              <Text style={styles.loanValue}>
                {prestamo.estrategia === 'REDUCIR_PLAZO' ? 'Reducir plazo' : 'Reducir cuota'}
              </Text>
            </View>
          </View>
          <View style={styles.loanFooter}>
            <Text style={styles.loanFooterLabel}>Fecha de desembolso:</Text>
            <Text style={styles.loanFooterValue}>{prestamo.fechaDesembolso}</Text>
          </View>
        </GlassCard>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Acciones</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/setup')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Modificar préstamo</Text>
            <Text style={styles.actionSubtitle}>Cambiar parámetros del crédito</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLoadDemo}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.surfaceAlt }]}>
            <Ionicons name="refresh-outline" size={24} color={Colors.positive} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Cargar datos de demo</Text>
            <Text style={styles.actionSubtitle}>Restaurar ejemplo del préstamo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleReset}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,82,82,0.1)' }]}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: Colors.error }]}>Restablecer todo</Text>
            <Text style={styles.actionSubtitle}>Borrar todos los datos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* About */}
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <GlassCard style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <View style={styles.appIcon}>
              <Ionicons name="map" size={32} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.appName}>DebtMap</Text>
              <Text style={styles.appVersion}>Versión 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutText}>
            Tu mapa hacia la libertad financiera. Visualiza y optimiza el pago de tu crédito hipotecario con estrategias inteligentes de abono a capital.
          </Text>
          <View style={styles.aboutFooter}>
            <Text style={styles.footerText}>Hecho con </Text>
            <Ionicons name="heart" size={14} color={Colors.error} />
            <Text style={styles.footerText}> en Colombia</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing.xl,
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
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  loanCard: {
    gap: Spacing.md,
  },
  loanRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  loanItem: {
    flex: 1,
  },
  loanLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  loanValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  loanFooterLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
  loanFooterValue: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dangerButton: {
    borderColor: 'rgba(255,82,82,0.2)',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  aboutCard: {
    gap: Spacing.md,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  appVersion: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
  aboutText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  aboutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
});
