import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrototypeStoreProvider } from '../src/state/PrototypeStore';
import { RoomSearchProvider } from '../src/features/room-search/state/RoomSearchProvider';
import { BookingProvider } from '../src/features/bookings/state/BookingProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrototypeStoreProvider>
        <RoomSearchProvider>
          <BookingProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="create" options={{ presentation: 'modal' }} />
              <Stack.Screen name="edit/[id]" options={{ presentation: 'modal' }} />
            </Stack>
          </BookingProvider>
        </RoomSearchProvider>
      </PrototypeStoreProvider>
    </SafeAreaProvider>
  );
}
