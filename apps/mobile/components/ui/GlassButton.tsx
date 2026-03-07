import React from 'react';
import { StyleSheet, Pressable, Text, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassButtonProps {
  onPress: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({
  onPress,
  title,
  style,
  textStyle,
  variant = 'primary',
  icon,
  disabled = false,
  size = 'md',
}: GlassButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.45 : opacity.value,
  }));

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: Typography.size.sm },
    md: { paddingVertical: 14, paddingHorizontal: 20, fontSize: Typography.size.md },
    lg: { paddingVertical: 18, paddingHorizontal: 28, fontSize: Typography.size.lg },
  };

  const getGradientColors = (): readonly [string, string] => {
    switch (variant) {
      case 'primary': return Colors.gradientPrimary;
      case 'danger': return [Colors.alert, Colors.alertDark] as const;
      default: return ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.06)'] as const;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return Colors.textOnGreen;
      case 'danger': return '#FFFFFF';
      case 'ghost': return Colors.primary;
      default: return Colors.textPrimary;
    }
  };

  if (variant === 'ghost') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.ghostContainer, style, animatedStyle]}
      >
        {icon}
        <Text style={[styles.text, { color: getTextColor(), fontSize: sizeStyles[size].fontSize }, textStyle]}>
          {title}
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, { borderColor: variant === 'primary' ? Colors.primary : Colors.border }, style, animatedStyle]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyles[size].paddingVertical,
            paddingHorizontal: sizeStyles[size].paddingHorizontal,
          },
        ]}
      >
        {icon}
        <Text style={[styles.text, { color: getTextColor(), fontSize: sizeStyles[size].fontSize }, textStyle]}>
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  ghostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
