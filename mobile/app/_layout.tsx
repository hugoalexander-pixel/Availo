import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrototypeStoreProvider } from '../src/state/PrototypeStore';
<<<<<<< HEAD
=======
import { RoomSearchProvider } from '../src/features/room-search/state/RoomSearchProvider';
import { BookingProvider } from '../src/features/bookings/state/BookingProvider';
>>>>>>> e3751ce (docs: Membuat dan menambahkan penjelasan prototype KelasKosong)

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrototypeStoreProvider>
<<<<<<< HEAD
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
=======
        <RoomSearchProvider>
          <BookingProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </BookingProvider>
        </RoomSearchProvider>
>>>>>>> e3751ce (docs: Membuat dan menambahkan penjelasan prototype KelasKosong)
      </PrototypeStoreProvider>
    </SafeAreaProvider>
  );
}
