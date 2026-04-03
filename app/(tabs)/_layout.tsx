import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 },
        headerStyle: { backgroundColor: '#FFF' },
        headerTitleStyle: { fontWeight: '600', color: '#1E293B' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', headerTitle: 'Lingua' }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: 'Learn', headerTitle: 'Daily Lesson' }}
      />
      <Tabs.Screen
        name="review"
        options={{ title: 'Review', headerTitle: 'Quick Review' }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', headerTitle: 'My Progress' }}
      />
    </Tabs>
  );
}
