import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrototypeStoreProvider, usePrototypeStore } from '../src/state/PrototypeStore';

function NavigationAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = usePrototypeStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const currentRoute = segments[0] as string | undefined;
    const isAuthRoute = currentRoute === 'login' || currentRoute === 'signup';

    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/login');
    } else if (isAuthenticated && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrototypeStoreProvider>
        <NavigationAuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </NavigationAuthGuard>
      </PrototypeStoreProvider>
    </SafeAreaProvider>
  );
}
