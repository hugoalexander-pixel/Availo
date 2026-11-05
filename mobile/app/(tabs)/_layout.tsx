import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#204d35';
const inactiveColor = '#526052';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: green,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          minHeight: 60 + bottomPadding,
          height: 60 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          borderTopColor: '#e0e6dd',
          backgroundColor: '#ffffff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cari',
          tabBarAccessibilityLabel: 'Tab Cari Ruangan',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]} accessible={false}>
              ⌕
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservasi',
          tabBarAccessibilityLabel: 'Tab Reservasi Saya',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]} accessible={false}>
              ▣
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Tersimpan',
          tabBarAccessibilityLabel: 'Tab Ruang Tersimpan',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]} accessible={false}>
              ♥
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarAccessibilityLabel: 'Tab Profil Akun',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]} accessible={false}>
              ◉
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
});
