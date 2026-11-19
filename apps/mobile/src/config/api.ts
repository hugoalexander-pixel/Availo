import { Platform } from "react-native";
import * as Device from "expo-device";

// Default API URL:
// 1. Prioritas utama: runtime/session override melalui menu Profil pengguna (customApiUrl)
// 2. Variabel lingkungan build-time: EXPO_PUBLIC_API_URL
// 3. Android Emulator: 10.0.2.2
// 4. Web browser: localhost:3000
// 5. Default fallback yang dapat diubah pengguna saat demo
const DEFAULT_URL = Platform.select({
  android: "http://10.0.2.2:3000/api",
  default: "http://localhost:3000/api",
});

let customApiUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (customApiUrl) {
    return customApiUrl;
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
