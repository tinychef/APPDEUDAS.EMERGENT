import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography } from '../constants/theme';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 160,
  strokeWidth = 12,
  label,
  sublabel,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setAnimatedProgress(Math.min(progress * (step / steps), progress));
      if (step >= steps) { clearInterval(timer); setAnimatedProgress(progress); }
    }, stepTime);
    return () => clearInterval(timer);
  }, [progress]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={Colors.primary} />
            <Stop offset="100%" stopColor={Colors.primaryLight} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.percentage}>{animatedProgress.toFixed(1)}%</Text>
        {label && <Text style={styles.label}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  content: { alignItems: 'center' },
  percentage: { fontSize: Typography.size['3xl'], fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  label: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 4 },
  sublabel: { fontSize: Typography.size.xs, color: Colors.textMuted },
});
