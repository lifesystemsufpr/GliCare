import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface HomeHeaderProps {
  userName: string;
  onPressNotifications?: () => void;
}

export function HomeHeader({
  userName,
  onPressNotifications,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={16}
            color="#9CA3AF"
          />
        </View>

        <View>
          <Text style={styles.greeting}>Bom dia,</Text>
          <Text style={styles.name}>{userName}!</Text>
        </View>
      </View>

      <Pressable
        onPress={onPressNotifications}
        hitSlop={12}
      >
        <Ionicons
          name="notifications-outline"
          size={25}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  height: 58,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

profile: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

avatar: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: '#E8EAF0',
  alignItems: 'center',
  justifyContent: 'center',
},

greeting: {
  fontSize: 13,
  color: '#4B5563',
},

name: {
  fontSize: 19,
  lineHeight: 22,
  fontWeight: '700',
  color: colors.primary,
},
});