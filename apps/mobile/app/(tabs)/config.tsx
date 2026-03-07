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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useDebtStore } from '../../store/debtStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency, formatPercent } from '../../utils/amortizacion';

export default function PerfilScreen() {
  const router = useRouter();
  const { prestamo, loadDemoData, reset } = useDebtStore();

  const handleReset = () => {
    Alert.alert(
      'Restablecer datos',
      '¿Estás seguro? Se borrarán todos los datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => { reset(); router.replace('/setup'); },
        },
      ]
    );
  };

  const actionItems = [
    {
      icon: 'create-outline' as const,
      title: 'Modificar préstamo',
      subtitle: 'Cambiar parámetros del crédito',
      color: Colors.primary,
      bg: Colors.primaryGlow,
      onPress: () => router.push('/setup'),
    },
    {
      icon: 'refresh-outline' as const,
      title: 'Cargar datos demo',
      subtitle: 'Restaurar ejemplo del préstamo',
      color: Colors.primaryLight,
      bg: Colors.positiveGlow,
      onPress: () => { loadDemoData(); Alert.alert('Éxito', 'Datos de demo cargados'); },
    },
    {
      icon: 'trash-outline' as const,
      title: 'Restablecer todo',
      subtitle: 'Borrar todos los datos',
      color: Colors.alert,
      bg: Colors.alertGlow,
      onPress: handleReset,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.avatar}>
            <Text style={styles.avatarText}>₣</Text>
          </LinearGradient>
          <View>
            <Text style={styles.profileName}>FreeDueda</Text>
            <Text style={styles.profileSub}>Tu optimizador de crédito</Text>
          </View>
        </View>

        {/* Loan info card */}
        <Text style={styles.sectionTitle}>Tu Préstamo</Text>
        <GlassCard style={styles.loanCard} variant="green">
          <View style={styles.loanGrid}>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Monto</Text>
              <Text style={styles.loanValue}>{formatCurrency(prestamo.monto)}</Text>
            </View>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Tasa E.A.</Text>
              <Text style={styles.loanValue}>{formatPercent(prestamo.tasaEA * 100)}</Text>
            </View>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Plazo</Text>
              <Text style={styles.loanValue}>{prestamo.plazoMeses} m.</Text>
            </View>
            <View style={styles.loanItem}>
              <Text style={styles.loanLabel}>Estrategia</Text>
              <Text style={styles.loanValue}>
                {prestamo.estrategia === 'REDUCIR_PLAZO' ? 'Reducir plazo' : 'Reducir cuota'}
              </Text>
            </View>
          </View>
          <View style={styles.loanFooter}>
            <Text style={styles.loanFooterLabel}>Fecha de desembolso</Text>
            <Text style={styles.loanFooterValue}>{prestamo.fechaDesembolso}</Text>
          </View>
        </GlassCard>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Acciones</Text>
        <View style={styles.actionsContainer}>
          {actionItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.actionItem,
                idx === actionItems.length - 1 && styles.actionItemDanger,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, idx === actionItems.length - 1 && { color: Colors.alert }]}>
                  {item.title}
                </Text>
                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <GlassCard style={styles.aboutCard}>
          <View style={styles.aboutRow}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.aboutIcon}>
              <Ionicons name="infinite" size={24} color={Colors.textOnGreen} />
            </LinearGradient>
            <View>
              <Text style={styles.aboutName}>FreeDueda</Text>
              <Text style={styles.aboutVersion}>Versión 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutDescription}>
            Tu asistente inteligente para gestionar y optimizar el pago de tu crédito hipotecario con estrategias de abono a capital.
          </Text>
          <View style={styles.aboutFooter}>
            <Text style={styles.footerText}>Hecho con </Text>
            <Ionicons name="heart" size={13} color={Colors.alert} />
            <Text style={styles.footerText}> en Colombia · AntiGravity</Text>
          </View>
        </GlassCard>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing['4xl'] },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textOnGreen,
  },
  profileName: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  profileSub: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  loanCard: { gap: Spacing.md },
  loanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  loanItem: { flex: 1, minWidth: 100 },
  loanLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
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
  loanFooterLabel: { fontSize: Typography.size.sm, color: Colors.textMuted },
  loanFooterValue: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  actionsContainer: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionItemDanger: {
    borderBottomWidth: 0,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  actionContent: { flex: 1 },
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
  aboutCard: { gap: Spacing.md },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aboutIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  aboutVersion: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
  aboutDescription: {
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
