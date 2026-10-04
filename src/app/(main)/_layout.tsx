import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme';

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#4B5563',

        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),

          backgroundColor: '#FFFFFF',

          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',

          elevation: 8,

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },

        tabBarLabelStyle: {
          fontSize: 9,
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
      {/* Início */}

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

      {/* Glicemia */}

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

      {/* Insulina */}

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

      {/* Dashboard */}

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

      {/* Relatórios */}

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

      {/* Perfil */}

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
    backgroundColor: '#DCEFFE',
  },
});