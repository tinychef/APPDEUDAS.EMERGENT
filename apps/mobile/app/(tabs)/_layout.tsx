import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../constants/theme';
import { ResponsiveLayout } from '../../components/layout/ResponsiveLayout';

function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperActive]}>
      <Ionicons name={name} size={22} color={color} />
      {focused && <View style={tabStyles.activeIndicator} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <ResponsiveLayout>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: tabStyles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: tabStyles.tabLabel,
          tabBarBackground: () => (
            <BlurView intensity={50} tint="default" style={[StyleSheet.absoluteFill, { borderTopWidth: 1, borderTopColor: 'rgba(55, 65, 81, 0.12)' }]} />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="abonos"
          options={{
            title: 'Pagos',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'wallet' : 'wallet-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="cronograma"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="simular"
          options={{
            title: 'Simular',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'flash' : 'flash-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="config"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </ResponsiveLayout>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderTopWidth: 0,
    paddingTop: 6,
    paddingBottom: 8,
    height: 70,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.medium,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  iconWrapper: {
    width: 42,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryGlow,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
