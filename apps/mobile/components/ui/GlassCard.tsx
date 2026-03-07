import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows } from '../../constants/theme';

type GlassCardVariant = 'default' | 'highlight' | 'success' | 'warning' | 'dark' | 'green' | 'purple';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  noPadding?: boolean;
  variant?: GlassCardVariant;
  shadow?: boolean;
}

const variantBorderColor: Record<GlassCardVariant, string> = {
  default: Colors.border,
  highlight: 'rgba(55, 65, 81, 0.30)',
  success: 'rgba(0, 200, 81, 0.25)',
  warning: 'rgba(255, 184, 0, 0.25)',
  dark: 'rgba(255,255,255,0.04)',
  green: Colors.borderGreen,
  purple: 'rgba(55, 65, 81, 0.30)',
};

const variantBackground: Record<GlassCardVariant, string> = {
  default: Colors.surface,
  highlight: 'rgba(55, 65, 81, 0.08)',
  success: 'rgba(0, 200, 81, 0.06)',
  warning: 'rgba(255, 184, 0, 0.06)',
  dark: 'rgba(0, 0, 0, 0.30)',
  green: 'rgba(55, 65, 81, 0.05)',
  purple: 'rgba(55, 65, 81, 0.10)',
};

export function GlassCard({
  children,
  style,
  intensity = 15,
  noPadding = false,
  variant = 'default',
  shadow = false,
}: GlassCardProps) {
  return (
    <BlurView
      intensity={intensity}
      tint="default"
      style={[
        styles.container,
        {
          borderColor: variantBorderColor[variant],
          backgroundColor: variantBackground[variant],
        },
        !noPadding && styles.padding,
        shadow && Shadows.md,
        variant === 'purple' && Shadows.purple,
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: 20,
  },
});
