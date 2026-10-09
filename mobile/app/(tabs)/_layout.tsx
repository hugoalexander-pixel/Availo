import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { getThemeColors } from '../../src/theme';

export default function TabLayout() {
  const { isAuthenticated, isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  if (!isAuthenticated) return <Redirect href="/" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: theme.subtle,
      tabBarLabelStyle: { fontSize: 9, marginBottom: 2 },
      tabBarStyle: {
        height: 58 + bottomPadding,
        paddingTop: 5,
        paddingBottom: bottomPadding,
        borderTopColor: theme.border,
        backgroundColor: theme.surface,
      },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Cari', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⌕</Text> }} />
      <Tabs.Screen name="reservations" options={{ title: 'Reservasi', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 15 }}>▣</Text> }} />
      <Tabs.Screen name="saved" options={{ title: 'Tersimpan', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 17 }}>♡</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 17 }}>◉</Text> }} />
    </Tabs>
  );
}
