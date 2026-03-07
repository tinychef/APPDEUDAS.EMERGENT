import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { initDatabase } from '../data/local/db';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type DbState = 'initializing' | 'ready' | 'error';

function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 14,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Text entrance
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          delay: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Progress bar
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Pulsing dots
    const pulseDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();

    pulseDot(dotOpacity1, 0);
    pulseDot(dotOpacity2, 150);
    pulseDot(dotOpacity3, 300);
  }, []);

  return (
    <LinearGradient colors={Colors.gradientDarkGreen} style={styles.splash}>
      <StatusBar style="light" />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <LinearGradient colors={Colors.gradientPrimary} style={styles.logoGradient}>
          <Text style={styles.logoIcon}>₣</Text>
        </LinearGradient>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.splashTitle}>FREEDEUDA</Text>
        <Animated.Text style={[styles.splashTagline, { opacity: taglineOpacity }]}>
          Tu mapa hacia la libertad financiera
        </Animated.Text>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: barWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
        </View>
      </View>
    </LinearGradient>
  );
}

export default function RootLayout() {
  const [dbState, setDbState] = useState<DbState>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const initStarted = useRef(false);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    const minSplashTime = new Promise(res => setTimeout(res, 2000));

    Promise.all([
      initDatabase().then(() => setDbState('ready')).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setErrorMessage(message);
        setDbState('error');
      }),
      minSplashTime,
    ]).then(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    });
  }, []);

  useEffect(() => {
    if (showSplash || dbState !== 'ready') return;

    const inAuthGroup = segments[0] === '(auth)';
    const isLogin = segments[0] === 'login';

    if (!session && !isLogin) {
      router.replace('/login');
    } else if (session && isLogin) {
      router.replace('/(tabs)');
    }
  }, [session, showSplash, dbState, segments]);

  if (showSplash && dbState === 'initializing') {
    return <SplashScreen />;
  }

  if (dbState === 'error') {
    return (
      <LinearGradient colors={Colors.gradientDark} style={styles.centered}>
        <StatusBar style="light" />
        <Text style={styles.errorTitle}>Error al iniciar</Text>
        <Text style={styles.errorDetail}>{errorMessage}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.gradientDarkGreen} style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="setup"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2xl'],
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.textOnGreen,
  },
  splashTitle: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 4,
  },
  splashTagline: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    letterSpacing: 0.3,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    width: '60%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  errorTitle: {
    color: Colors.alert,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  errorDetail: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
});
