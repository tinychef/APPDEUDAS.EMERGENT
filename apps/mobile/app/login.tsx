import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// To handle OAuth redirects
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);

    const performOAuth = async () => {
        try {
            setLoading(true);
            const redirectUrl = Linking.createURL('/');
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                },
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else if (data?.url) {
                const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                if (res.type === 'success') {
                    // Parse the URL to session here if needed, or rely on auto-refresh
                    // with modern supabase-js, the deep-link will be intercepted by GoTrue automatically
                    // if configured properly in App.tsx or useLinking.
                }
            }
        } catch (err: any) {
            Alert.alert('Authentication Error', err?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={Colors.gradientDarkGreen} style={styles.background}>

                <View style={styles.header}>
                    <LinearGradient colors={Colors.gradientPrimary} style={styles.logoGradient}>
                        <Text style={styles.logoIcon}>₣</Text>
                    </LinearGradient>
                    <Text style={styles.appName}>FREEDEUDA</Text>
                    <Text style={styles.tagline}>Inicia sesión para tomar el control de tus finanzas.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Acceso Seguro</Text>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={performOAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.textPrimary} />
                        ) : (
                            <>
                                <Ionicons name="logo-google" size={20} color={Colors.textPrimary} />
                                <Text style={styles.googleButtonText}>Continuar con Google</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>
                    Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
                </Text>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    background: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing['4xl'],
    },
    logoGradient: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
        ...Shadows.purple,
    },
    logoIcon: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.textOnPrimary,
    },
    appName: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
        letterSpacing: 2,
        marginBottom: Spacing.sm,
    },
    tagline: {
        fontSize: Typography.size.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing['2xl'],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: Spacing['2xl'],
        ...Shadows.md,
    },
    cardTitle: {
        fontSize: Typography.size.lg,
        color: Colors.textPrimary,
        fontWeight: Typography.weight.semibold,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    googleButtonText: {
        fontSize: Typography.size.md,
        color: Colors.textPrimary,
        fontWeight: Typography.weight.semibold,
    },
    footerText: {
        fontSize: Typography.size.xs,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: Spacing.xl,
    },
});
