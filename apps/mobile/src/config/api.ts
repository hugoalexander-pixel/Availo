import { Platform } from "react-native";

// Default API URL:
// - Android Emulator: 10.0.2.2 points to host localhost
// - iOS Simulator / Web: localhost
const DEFAULT_URL = Platform.select({
  android: "http://10.0.2.2:3000/api",
  default: "http://localhost:3000/api",
});

let customApiUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (customApiUrl) return customApiUrl;
  return process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;
}

export function setCustomApiUrl(url: string | null): void {
  customApiUrl = url ? url.trim().replace(/\/+$/, "") : null;
}

