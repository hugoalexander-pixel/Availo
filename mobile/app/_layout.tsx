import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrototypeStoreProvider } from '../src/state/PrototypeStore';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrototypeStoreProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PrototypeStoreProvider>
    </SafeAreaProvider>
  );
}
