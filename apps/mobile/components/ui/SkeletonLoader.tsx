import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = BorderRadius.sm, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[skeletonStyles.card, style]}>
      <Skeleton height={12} width="40%" borderRadius={6} style={{ marginBottom: 12 }} />
      <Skeleton height={28} width="70%" borderRadius={8} style={{ marginBottom: 8 }} />
      <Skeleton height={10} width="55%" borderRadius={5} />
    </View>
  );
}

export function SkeletonKPI({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[skeletonStyles.kpi, style]}>
      <Skeleton height={10} width="60%" borderRadius={5} style={{ marginBottom: 10 }} />
      <Skeleton height={24} width="80%" borderRadius={7} style={{ marginBottom: 6 }} />
      <Skeleton height={8} width="45%" borderRadius={4} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  kpi: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
});
