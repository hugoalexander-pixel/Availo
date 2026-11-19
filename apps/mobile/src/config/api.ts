import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

// Default API URL:
// 1. Prioritas utama: runtime/session override (customApiUrl)
// 2. Web browser: localhost:3000
// 3. Otomatis deteksi IP Host dari Metro Bundler (Expo Go di HP fisik)
// 4. Variabel lingkungan build-time: EXPO_PUBLIC_API_URL
// 5. Android Emulator: 10.0.2.2
const DEFAULT_URL = Platform.select({
  android: "http://10.0.2.2:3000/api",
  default: "http://localhost:3000/api",
});

let customApiUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (customApiUrl) {
    return customApiUrl;
  }

  // Jika dibuka di browser laptop (Web), selalu langsung arahkan ke localhost:3000/api
  if (Platform.OS === "web") {
    return "http://localhost:3000/api";
  }

  // Jika berjalan di Expo Go pada perangkat fisik, otomatis gunakan IP host Metro
  try {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
    if (hostUri) {
      const hostIp = hostUri.split(":")[0];
      if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
        return `http://${hostIp}:3000/api`;
      }
    }
  } catch {
    // Abaikan jika tidak tersedia
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.trim().replace(/\/+$/, "");
  }

  // Jika dijalankan di Android emulator
  if (Platform.OS === "android" && !Device.isDevice) {
    return "http://10.0.2.2:3000/api";
  }

  return DEFAULT_URL;
}

export function setCustomApiUrl(url: string | null): void {
  customApiUrl = url ? url.trim().replace(/\/+$/, "") : null;
}
