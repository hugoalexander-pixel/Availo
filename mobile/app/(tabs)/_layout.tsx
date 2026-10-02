import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#28583f';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: green,
      tabBarInactiveTintColor: '#899289',
      tabBarLabelStyle: { fontSize: 9, marginBottom: 2 },
      tabBarStyle: {
        height: 58 + bottomPadding,
        paddingTop: 5,
        paddingBottom: bottomPadding,
        borderTopColor: '#e9ece6',
        backgroundColor: '#fff',
      },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Cari', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⌕</Text> }} />
      <Tabs.Screen name="reservations" options={{ title: 'Reservasi', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 15 }}>▣</Text> }} />
      <Tabs.Screen name="saved" options={{ title: 'Tersimpan', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 17 }}>♡</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 17 }}>◉</Text> }} />
    </Tabs>
  );
}
