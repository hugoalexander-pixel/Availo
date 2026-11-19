import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";
import { logger } from "../utils/logger";

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
    const result = requested.canAskAgain ? "denied" : "blocked";
    logger.warn("PERMISSION", `Izin kamera ditolak (status: ${result})`, { canAskAgain: requested.canAskAgain });
    return result;
  }

  logger.warn("PERMISSION", "Izin kamera diblokir permanen (blocked)");
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
    const result = requested.canAskAgain ? "denied" : "blocked";
    logger.warn("PERMISSION", `Izin galeri ditolak (status: ${result})`, { canAskAgain: requested.canAskAgain });
    return result;
  }

  logger.warn("PERMISSION", "Izin galeri diblokir permanen (blocked)");
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
    logger.warn("CAMERA", "Pengambilan foto dicegah: izin kamera diblokir");
    showPermissionBlockedAlert("Kamera");
    return { cancelled: true };
  }

  if (perm === "denied") {
    logger.warn("CAMERA", "Pengambilan foto dicegah: izin kamera ditolak");
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
      logger.info("CAMERA", "Pengguna membatalkan jepretan kamera");
      return { cancelled: true };
    }

    logger.info("CAMERA", "Foto berhasil diambil dari kamera", { uri: result.assets[0].uri });
    return {
      cancelled: false,
      uri: result.assets[0].uri,
    };
  } catch (error: any) {
    logger.error("CAMERA", `Kesalahan saat mengambil foto: ${error?.message}`, error);
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
    logger.warn("CAMERA", "Pemilihan galeri dicegah: izin galeri diblokir");
    showPermissionBlockedAlert("Galeri Foto");
    return { cancelled: true };
  }

  if (perm === "denied") {
    logger.warn("CAMERA", "Pemilihan galeri dicegah: izin galeri ditolak");
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
      logger.info("CAMERA", "Pengguna membatalkan pemilihan dari galeri");
      return { cancelled: true };
    }

    logger.info("CAMERA", "Foto berhasil dipilih dari galeri", { uri: result.assets[0].uri });
    return {
      cancelled: false,
      uri: result.assets[0].uri,
    };
  } catch (error: any) {
    logger.error("CAMERA", `Kesalahan saat memilih dari galeri: ${error?.message}`, error);
    Alert.alert("Gagal Memilih Foto", error?.message || "Terjadi kesalahan pada galeri.");
    return { cancelled: true };
  }
}
