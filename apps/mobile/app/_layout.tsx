import { useEffect, useState } from "react";
import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../src/constants/Theme";
import { getAuthToken } from "../src/services/AuthStorage";
import LoadingView from "../src/components/LoadingView";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { logger } from "../src/utils/logger";

declare const ErrorUtils: any;

// Global JS error handler setup
if (typeof ErrorUtils !== "undefined" && ErrorUtils.getGlobalHandler) {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    logger.error("CRASH_GLOBAL", `Fatal: ${isFatal} - ${error?.message}`, error);
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    logger.screen(pathname || "/");
  }, [pathname]);

  return null;
}

function MainApp() {
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getAuthToken();
        if (!token) {
          logger.info("AUTH", "Tidak ada sesi aktif, mengarahkan ke /login");
          router.replace("/login");
        } else {
          logger.info("AUTH", "Sesi aktif ditemukan");
        }
      } catch (err: any) {
        logger.error("AUTH", "Gagal memeriksa sesi", err);
        router.replace("/login");
      } finally {
        setCheckedAuth(true);
      }
    }
    checkAuth();
  }, []);

  if (!checkedAuth) {
    return <LoadingView message="Memuat aplikasi Availo..." />;
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationTracker />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ title: "Availo" }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: "Daftar Akun" }} />
        <Stack.Screen name="facilities/index" options={{ title: "Fasilitas Kampus" }} />
        <Stack.Screen name="facilities/[id]" options={{ title: "Detail Fasilitas" }} />
        <Stack.Screen name="create" options={{ title: "Reservasi Ruangan" }} />
        <Stack.Screen name="edit/[id]" options={{ title: "Ubah Reservasi" }} />
        <Stack.Screen name="notifications" options={{ title: "Notifikasi" }} />
        <Stack.Screen name="profile" options={{ title: "Profil Pengguna" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
