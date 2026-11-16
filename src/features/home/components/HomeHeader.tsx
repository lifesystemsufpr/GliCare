import { greetingFor } from '@/shared/format';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';

interface HomeHeaderProps {
  userName: string;
  onPressNotifications?: () => void;
}

export function HomeHeader({
  userName,
  onPressNotifications,
}: HomeHeaderProps) {
  const styles = useStyles();
  const c = useThemeColors();
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={16}
            color={c.gray400}
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
          color={c.primary}
        />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
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
  backgroundColor: c.avatarBackground,
  alignItems: 'center',
  justifyContent: 'center',
},

greeting: {
  fontSize: 13,
  color: c.gray600,
},

name: {
  fontSize: 19,
  lineHeight: 22,
  fontWeight: '700',
  color: c.primary,
},
}));