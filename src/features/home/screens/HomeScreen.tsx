import { ScrollView, StyleSheet, View } from 'react-native';


import { DailySummary } from '../components/DailySummary';
import { GlucoseCard } from '../components/GlucoseCard';
import { HomeHeader } from '../components/HomeHeader';
import { InsulinCard } from '../components/InsulinCard';
import { ReminderCard } from '../components/ReminderCard';
import { WeeklyGlucoseChart } from '../components/WeeklyGlucoseChart';

export function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <HomeHeader
        userName="João"
        onPressNotifications={() => {
          console.log('Abrir lembretes');
        }}
      />

      <GlucoseCard
        value={98}
        status="Normal"
        measuredAt="Hoje, 07:30"
      />

      <View style={styles.cardsRow}>
        <InsulinCard
          dose={18}
          type="NPH"
          appliedAt="Hoje, 08:00"
        />

        <ReminderCard
          time="20:00"
          title="Aplicação de Insulina Basal"
        />
      </View>

      <DailySummary
        glucoseRegistered
        insulinRegistered
      />

      <WeeklyGlucoseChart
        data={[
          { day: 'Seg', value: 98 },
          { day: 'Ter', value: 105 },
          { day: 'Qua', value: 92 },
          { day: 'Qui', value: 110 },
          { day: 'Sex', value: 101 },
          { day: 'Sáb', value: 96 },
          { day: 'Dom', value: 99 },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
    gap: 20,
  },

  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});