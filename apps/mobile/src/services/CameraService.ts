import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";

export type PermissionResult = "granted" | "denied" | "blocked";

export interface PickPhotoResult {
  cancelled: boolean;
  uri?: string;
}

/**
 * Meminta izin kamera dengan penanganan lengkap 3 kasus:
 * 1. granted
 * 2. denied (bisa minta lagi)
 * 3. blocked / ditolak permanen (arahkan ke Settings)
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  if (Platform.OS === "web") return "granted";

  const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
  if (status === ImagePicker.PermissionStatus.GRANTED) {
    return "granted";
  }

  if (canAskAgain) {
    const requested = await ImagePicker.requestCameraPermissionsAsync();
    if (requested.status === ImagePicker.PermissionStatus.GRANTED) {
      return "granted";
    }
    return requested.canAskAgain ? "denied" : "blocked";
  }

  return "blocked";
}

/**
 * Meminta izin galeri media dengan penanganan 3 kasus
 */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  if (Platform.OS === "web") return "granted";

  const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (status === ImagePicker.PermissionStatus.GRANTED) {
    return "granted";
  }

  if (canAskAgain) {
    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (requested.status === ImagePicker.PermissionStatus.GRANTED) {
      return "granted";
    }
    return requested.canAskAgain ? "denied" : "blocked";
  }

  return "blocked";
}

function showPermissionBlockedAlert(featureName: string) {
  Alert.alert(
    `Izin ${featureName} Dibutuhkan`,
    `Aplikasi membutuhkan izin ${featureName} untuk mendokumentasikan kondisi ruangan. Anda telah menolak izin ini secara permanen. Buka Pengaturan aplikasi untuk mengizinkannya?`,
    [
      { text: "Batal", style: "cancel" },
      {
        text: "Buka Pengaturan",
        onPress: () => {
          if (Platform.OS !== "web") {
            Linking.openSettings();
          }
        },
      },
    ]
  );
}

function showPermissionDeniedAlert(featureName: string) {
  Alert.alert(
    `Izin ${featureName} Ditolak`,
    `Aplikasi tidak dapat mengambil foto tanpa izin ${featureName}. Anda dapat mencoba lagi kapan saja.`
  );
}

/**
 * Mengambil foto langsung dari Kamera perangkat.
 * Menangani izin (granted, denied, blocked) dan pembatalan oleh user tanpa crash.
 */
export async function takePhotoWithCamera(): Promise<PickPhotoResult> {
  const perm = await requestCameraPermission();

  if (perm === "blocked") {
    showPermissionBlockedAlert("Kamera");
    return { cancelled: true };
  }

  if (perm === "denied") {
    showPermissionDeniedAlert("Kamera");
    return { cancelled: true };
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      // Pembatalan ditangani ramah
      return { cancelled: true };
    }

    return {
      cancelled: false,
      uri: result.assets[0].uri,
    };
  } catch (error: any) {
    Alert.alert("Gagal Mengambil Foto", error?.message || "Terjadi kesalahan pada kamera.");
    return { cancelled: true };
  }
}

/**
 * Memilih foto dari Galeri / Dokumen perangkat.
 */
export async function pickPhotoFromGallery(): Promise<PickPhotoResult> {
  const perm = await requestMediaLibraryPermission();

  if (perm === "blocked") {
    showPermissionBlockedAlert("Galeri Foto");
    return { cancelled: true };
  }

  if (perm === "denied") {
    showPermissionDeniedAlert("Galeri Foto");
    return { cancelled: true };
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { cancelled: true };
    }

    return {
      cancelled: false,
      uri: result.assets[0].uri,
    };
  } catch (error: any) {
    Alert.alert("Gagal Memilih Foto", error?.message || "Terjadi kesalahan pada galeri.");
    return { cancelled: true };
  }
}
