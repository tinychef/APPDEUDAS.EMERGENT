import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'success' | 'warning';
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  noPadding = false,
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'highlight':
        return Colors.primary;
      case 'success':
        return Colors.positive;
      case 'warning':
        return Colors.alert;
      default:
        return Colors.border;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor: getBorderColor() },
        variant !== 'default' && styles.highlightBorder,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  highlightBorder: {
    borderWidth: 1,
  },
  noPadding: {
    padding: 0,
  },
});
