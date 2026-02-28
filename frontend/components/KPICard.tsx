import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { Colors, Typography, Spacing } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface KPICardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
  animated?: boolean;
  prefix?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  icon,
  title,
  value,
  subtitle,
  variant = 'default',
  animated = true,
  prefix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(animated && typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (animated && typeof value === 'number') {
      const duration = 1500;
      const steps = 60;
      const stepTime = duration / steps;
      const increment = value / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(value * (step / steps), value);
        setDisplayValue(Math.round(current));

        if (step >= steps) {
          clearInterval(timer);
          setDisplayValue(value);
        }
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return Colors.positive;
      case 'warning':
        return Colors.alert;
      case 'info':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const formatDisplayValue = () => {
    if (typeof displayValue === 'number') {
      return `${prefix}${displayValue.toLocaleString('es-CO')}`;
    }
    return `${prefix}${displayValue}`;
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={getIconColor()} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: getIconColor() }]}>
        {formatDisplayValue()}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: Typography.weight.medium,
  },
  value: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
});
