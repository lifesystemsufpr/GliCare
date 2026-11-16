import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { SessionGate } from '@/features/auth/components/SessionGate';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const { user, loading, sessionError } = useAuth();
  if (loading || sessionError) return <SessionGate />;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Área segura do topo (recorte/barra de status) para todas as abas.
        sceneStyle: {
          paddingTop: insets.top,
          backgroundColor: colors.screen,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray600,

        tabBarStyle: {
          height: 68 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),

          backgroundColor: colors.white,

          borderTopWidth: 1,
          borderTopColor: colors.gray200,

          elevation: 8,

          shadowColor: colors.black,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 14,
          fontWeight: '500',
        },

        tabBarIconStyle: {
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',

          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIcon,
              ]}
            >
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="glicemia"
        options={{
          title: 'Glicemia',

          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIcon,
              ]}
            >
              <Ionicons
                name={focused ? 'water' : 'water-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="insulina"
        options={{
          title: 'Insulina',

          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIcon,
              ]}
            >
              <Ionicons
                name={focused ? 'medical' : 'medical-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',

          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIcon,
              ]}
            >
              <Ionicons
                name={
                  focused
                    ? 'stats-chart'
                    : 'stats-chart-outline'
                }
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',

          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIcon,
              ]}
            >
              <Ionicons
                name={
                  focused
                    ? 'document-text'
                    : 'document-text-outline'
                }
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',

          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIcon,
              ]}
            >
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="lembretes"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 38,
    height: 30,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 16,
  },

  activeIcon: {
    backgroundColor: colors.secondary,
  },
});
