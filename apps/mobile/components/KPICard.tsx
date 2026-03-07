import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GlassCard } from './ui/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface KPICardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'alert';
  animated?: boolean;
  prefix?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const KPICard: React.FC<KPICardProps> = ({
  icon,
  title,
  value,
  subtitle,
  variant = 'default',
  animated = true,
  prefix = '',
  trend,
}) => {
  const displayValue = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(12)).current;
  const [renderedValue, setRenderedValue] = React.useState(
    typeof value === 'number' && animated ? 0 : value
  );

  useEffect(() => {
    // Card entrance
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(cardTranslate, { toValue: 0, damping: 16, stiffness: 200, useNativeDriver: true }),
    ]).start();

    // Number animation
    if (animated && typeof value === 'number') {
      const duration = 1200;
      const steps = 50;
      const stepTime = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setRenderedValue(Math.round(value * eased));
        if (step >= steps) { clearInterval(timer); setRenderedValue(value); }
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setRenderedValue(value);
    }
  }, [value]);

  const getAccentColor = () => {
    switch (variant) {
      case 'success': return Colors.primary;
      case 'warning': return Colors.warning;
      case 'alert': return Colors.alert;
      case 'info': return Colors.info;
      default: return Colors.textSecondary;
    }
  };

  const getGlassVariant = () => {
    switch (variant) {
      case 'success': return 'success' as const;
      case 'warning': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const accentColor = getAccentColor();
  const formatVal = () => {
    if (typeof renderedValue === 'number') return `${prefix}${renderedValue.toLocaleString('es-CO')}`;
    return `${prefix}${renderedValue}`;
  };

  return (
    <Animated.View style={{ flex: 1, opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }}>
      <GlassCard style={styles.container} variant={getGlassVariant()}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}18` }]}>
            <Ionicons name={icon} size={18} color={accentColor} />
          </View>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? Colors.positiveGlow : Colors.alertGlow }]}>
              <Ionicons
                name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'}
                size={12}
                color={trend === 'up' ? Colors.positive : trend === 'down' ? Colors.alert : Colors.textMuted}
              />
            </View>
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color: accentColor }]}>{formatVal()}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Accent line */}
        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: 3,
    lineHeight: Typography.size['2xl'] * 1.2,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
});
