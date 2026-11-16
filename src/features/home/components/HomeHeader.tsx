import { greetingFor } from '@/shared/format';
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
            color={colors.gray400}
          />
        </View>

        <View style={styles.texts}>
          <Text style={styles.greeting}>{greetingFor()},</Text>
          <Text style={styles.name} numberOfLines={1}>{userName}!</Text>
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
  flex: 1,
  minWidth: 0,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  marginRight: 12,
},

texts: {
  flex: 1,
  minWidth: 0,
},

avatar: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: colors.avatarBackground,
  alignItems: 'center',
  justifyContent: 'center',
},

greeting: {
  fontSize: 13,
  color: colors.gray600,
},

name: {
  fontSize: 19,
  lineHeight: 22,
  fontWeight: '700',
  color: colors.primary,
},
});