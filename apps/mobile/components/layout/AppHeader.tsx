import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname } from 'expo-router';
import { useThemeStore } from '../../store/themeStore';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useIsDesktop } from '../../hooks/useIsDesktop';

const NAV_ITEMS = [
  { name: 'index',      title: 'Dashboard',    icon: 'home-outline' as const },
  { name: 'abonos',     title: 'Pagos',         icon: 'wallet-outline' as const },
  { name: 'cronograma', title: 'Estadísticas',  icon: 'bar-chart-outline' as const },
  { name: 'simular',    title: 'Simular',       icon: 'flash-outline' as const },
  { name: 'config',     title: 'Perfil',        icon: 'person-circle-outline' as const },
];

interface AppHeaderProps {
  showLogo?: boolean;
}

export function AppHeader({ showLogo = true }: AppHeaderProps) {
  const colors = useThemeStore((s) => s.colors);
  const { mode, toggleTheme } = useThemeStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useIsDesktop();

  const navigate = (name: string) => {
    setDrawerOpen(false);
    router.push((name === 'index' ? '/' : `/${name}`) as any);
  };

  const styles = makeStyles(colors);

  return (
    <>
      <View style={styles.header}>
        {/* Logo */}
        {showLogo && (
          <View style={styles.logoRow}>
            <LinearGradient colors={colors.gradientPrimary} style={styles.logoCircle}>
              <Text style={styles.logoChar}>₣</Text>
            </LinearGradient>
            <Text style={styles.logoText}>FREEDEUDA</Text>
          </View>
        )}

        {/* Right: hamburger (only on mobile) */}
        {!isDesktop && (
          <TouchableOpacity
            style={styles.hamburger}
            onPress={() => setDrawerOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Drawer modal */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setDrawerOpen(false)}>
          <Pressable style={styles.drawer} onPress={() => {}}>
            {/* Drawer header */}
            <View style={styles.drawerHeader}>
              <LinearGradient colors={colors.gradientPrimary} style={styles.drawerLogo}>
                <Text style={styles.drawerLogoChar}>₣</Text>
              </LinearGradient>
              <View>
                <Text style={styles.drawerTitle}>FREEDEUDA</Text>
                <Text style={styles.drawerSub}>Tu optimizador de crédito</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setDrawerOpen(false)}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Nav items */}
            <View style={styles.navList}>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === `/${item.name}` ||
                  (pathname === '/' && item.name === 'index');
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    onPress={() => navigate(item.name)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.title}
                    </Text>
                    {isActive && <View style={styles.activeBar} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Theme toggle */}
            <View style={styles.themeRow}>
              <Ionicons
                name={mode === 'dark' ? 'moon-outline' : 'sunny-outline'}
                size={18}
                color={colors.textSecondary}
              />
              <Text style={styles.themeLabel}>
                Modo {mode === 'dark' ? 'oscuro' : 'claro'}
              </Text>
              <Switch
                value={mode === 'light'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primaryGlow }}
                thumbColor={mode === 'light' ? colors.primary : colors.textMuted}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const makeStyles = (colors: ReturnType<typeof useThemeStore.getState>['colors']) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    logoCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoChar: {
      fontSize: 18,
      fontWeight: Typography.weight.extrabold,
      color: colors.textOnPrimary,
    },
    logoText: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
      color: colors.textPrimary,
      letterSpacing: 2,
    },
    hamburger: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Drawer
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    drawer: {
      backgroundColor: colors.backgroundAlt,
      borderTopLeftRadius: BorderRadius['3xl'],
      borderTopRightRadius: BorderRadius['3xl'],
      borderTopWidth: 1,
      borderTopColor: colors.borderGreen,
      padding: Spacing.xl,
      paddingBottom: Spacing['3xl'],
      gap: Spacing.xl,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    drawerLogo: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    drawerLogoChar: {
      fontSize: 20,
      fontWeight: Typography.weight.extrabold,
      color: colors.textOnPrimary,
    },
    drawerTitle: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
      color: colors.textPrimary,
      letterSpacing: 1.5,
    },
    drawerSub: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      marginLeft: 'auto',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navList: { gap: Spacing.xs },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.xl,
    },
    navItemActive: {
      backgroundColor: colors.primaryGlow,
    },
    navLabel: {
      fontSize: Typography.size.md,
      color: colors.textSecondary,
      fontWeight: Typography.weight.medium,
      flex: 1,
    },
    navLabelActive: {
      color: colors.primary,
      fontWeight: Typography.weight.semibold,
    },
    activeBar: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingTop: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    themeLabel: {
      flex: 1,
      fontSize: Typography.size.md,
      color: colors.textSecondary,
    },
  });
