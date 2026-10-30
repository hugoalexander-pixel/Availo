import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { User } from "../types/Models";

const TOKEN_KEY = "availo_auth_token";
const USER_KEY = "availo_auth_user";

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function saveAuthSession(token: string, user: User): Promise<void> {
  const userJson = JSON.stringify(user);
  const secureAvailable = await isSecureStoreAvailable();

  if (secureAvailable) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, userJson);
  } else {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, userJson);
  }
}

export async function getAuthToken(): Promise<string | null> {
  const secureAvailable = await isSecureStoreAvailable();
  if (secureAvailable) {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) return token;
    } catch {
      // fallback
    }
  }
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function getAuthUser(): Promise<User | null> {
  let userJson: string | null = null;
  const secureAvailable = await isSecureStoreAvailable();
  if (secureAvailable) {
    try {
      userJson = await SecureStore.getItemAsync(USER_KEY);
    } catch {
      // fallback
    }
  }
  if (!userJson) {
    userJson = await AsyncStorage.getItem(USER_KEY);
  }

  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  const secureAvailable = await isSecureStoreAvailable();
  if (secureAvailable) {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {
      // ignore
    }
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

