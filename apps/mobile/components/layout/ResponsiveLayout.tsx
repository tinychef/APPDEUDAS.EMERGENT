import React, { ReactNode, useState, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Animated } from 'react-native';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useDebtStore } from '../../store/debtStore';
import { formatMonthYear } from '../../utils/amortizacion';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

type TabRoute = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const ROUTES: TabRoute[] = [
  { name: 'index', title: 'Dashboard', icon: 'home-outline', iconActive: 'home' },
  { name: 'abonos', title: 'Pagos', icon: 'wallet-outline', iconActive: 'wallet' },
  { name: 'cronograma', title: 'Estadísticas', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  { name: 'simular', title: 'Simular', icon: 'flash-outline', iconActive: 'flash' },
  { name: 'config', title: 'Perfil', icon: 'person-circle-outline', iconActive: 'person-circle' },
];

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const currentPath = usePathname();
  const { resultado, prestamo } = useDebtStore();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(1)).current;

  const toggleCollapse = () => {
    Animated.spring(sidebarAnim, {
      toValue: collapsed ? 1 : 0,
      damping: 18,
      stiffness: 220,
      useNativeDriver: false,
    }).start();
    setCollapsed(!collapsed);
  };

  const fechaLibertad = resultado?.resumen.fechaFinReal;
  const mesesRestantes = resultado
    ? resultado.resumen.plazoReal - resultado.cronograma.filter(c => c.estado === 'PAGADA').length
    : null;

  if (!isDesktop) {
    return <View style={styles.mobileContainer}>{children}</View>;
  }

  const sidebarWidth = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [72, 260],
  });

  const labelOpacity = sidebarAnim.interpolate({
    inputRange: [0.6, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.desktopContainer}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <BlurView intensity={20} tint="default" style={StyleSheet.absoluteFill} />

        {/* Logo area */}
        <View style={styles.sidebarTop}>
          <View style={styles.logoRow}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.logoMark}>
              <Text style={styles.logoChar}>₣</Text>
            </LinearGradient>
            <Animated.Text style={[styles.sidebarTitle, { opacity: labelOpacity }]} numberOfLines={1}>
              FREEDEUDA
            </Animated.Text>
          </View>

          {/* Collapse toggle */}
          <Pressable style={styles.collapseBtn} onPress={toggleCollapse}>
            <Ionicons
              name={collapsed ? 'chevron-forward' : 'chevron-back'}
              size={16}
              color={Colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Nav items */}
        <View style={styles.sidebarNav}>
          {ROUTES.map((route) => {
            const isActive = currentPath === `/${route.name}` || (currentPath === '/' && route.name === 'index');
            return (
              <Pressable
                key={route.name}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push((route.name === 'index' ? '/' : `/${route.name}`) as any)}
              >
                {isActive && (
                  <View style={styles.activeBar} />
                )}
                <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                  <Ionicons
                    name={isActive ? route.iconActive : route.icon}
                    size={20}
                    color={isActive ? Colors.primary : Colors.textMuted}
                  />
                </View>
                <Animated.Text
                  style={[styles.navLabel, isActive && styles.navLabelActive, { opacity: labelOpacity }]}
                  numberOfLines={1}
                >
                  {route.title}
                </Animated.Text>
              </Pressable>
            );
          })}
        </View>

        {/* Footer widget */}
        {fechaLibertad && !collapsed && (
          <Animated.View style={[styles.footerWidget, { opacity: labelOpacity }]}>
            <View style={styles.divider} />
            <LinearGradient colors={Colors.gradientGreen} style={styles.libertadCard}>
              <View style={styles.libertadHeader}>
                <Ionicons name="trophy" size={14} color={Colors.primary} />
                <Text style={styles.libertadLabel}>Libertad Financiera</Text>
              </View>
              <Text style={styles.libertadDate}>{formatMonthYear(fechaLibertad)}</Text>
              {mesesRestantes !== null && (
                <Text style={styles.libertadSub}>{mesesRestantes} cuotas restantes</Text>
              )}
            </LinearGradient>
            <Text style={styles.versionText}>FreeDueda v1.0</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  sidebar: {
    backgroundColor: 'rgba(15, 17, 23, 0.95)',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 32,
    paddingHorizontal: 12,
    paddingBottom: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  sidebarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    overflow: 'hidden',
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoChar: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textOnGreen,
  },
  sidebarTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 2,
    overflow: 'hidden',
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
    marginHorizontal: 4,
  },
  sidebarNav: {
    flex: 1,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  navItemActive: {
    backgroundColor: Colors.primaryGlow,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navIconWrapActive: {
    backgroundColor: 'rgba(55, 65, 81, 0.18)',
  },
  navLabel: {
    fontSize: Typography.size.md,
    color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
    marginLeft: 10,
    flex: 1,
    overflow: 'hidden',
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  footerWidget: {
    gap: 8,
  },
  libertadCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
    gap: 3,
  },
  libertadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  libertadLabel: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  libertadDate: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  libertadSub: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  versionText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  mobileContainer: {
    flex: 1,
  },
});
