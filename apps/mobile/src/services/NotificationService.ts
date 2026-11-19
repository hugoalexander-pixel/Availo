import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert, Linking, Platform } from "react-native";
import { PermissionResult } from "./CameraService";
import { logger } from "../utils/logger";

// Konfigurasi bagaimana notifikasi ditampilkan saat app di Foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Meminta izin notifikasi dengan penanganan 3 status:
 * 1. granted
 * 2. denied
 * 3. blocked (arahkan ke Settings)
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  if (Platform.OS === "web") return "granted";

  const settings = await Notifications.getPermissionsAsync();
  if (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return "granted";
  }

  if (settings.canAskAgain) {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    if (
      requested.granted ||
      requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return "granted";
    }

    const result = requested.canAskAgain ? "denied" : "blocked";
    logger.warn("PERMISSION", `Izin notifikasi ditolak (status: ${result})`, { canAskAgain: requested.canAskAgain });
    return result;
  }

  logger.warn("PERMISSION", "Izin notifikasi diblokir permanen (blocked)");
  return "blocked";
}

export function showNotificationBlockedAlert() {
  Alert.alert(
    "Izin Notifikasi Dimatikan",
    "Aplikasi tidak dapat mengirimkan pengingat jadwal reservasi ruangan karena izin notifikasi dinonaktifkan. Buka Pengaturan untuk mengaktifkannya?",
    [
      { text: "Nanti Saja", style: "cancel" },
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

/**
 * Mengirim notifikasi instan langsung (berguna untuk demo verifikasi).
 */
export async function sendInstantNotification(title: string, body: string): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (perm === "blocked") {
    logger.warn("NOTIFICATION", "Kirim notifikasi dicegah: izin notifikasi diblokir");
    showNotificationBlockedAlert();
    return false;
  }
  if (perm === "denied") {
    logger.warn("NOTIFICATION", "Kirim notifikasi dicegah: izin notifikasi ditolak");
    Alert.alert("Izin Notifikasi Ditolak", "Pengingat tidak dapat ditampilkan tanpa izin notifikasi.");
    return false;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // langsung kirim sekarang
    });
    logger.info("NOTIFICATION", "Notifikasi instan berhasil dikirim", { title });
    return true;
  } catch (error: any) {
    logger.error("NOTIFICATION", `Gagal mengirim notifikasi instan: ${error?.message}`, error);
    return false;
  }
}

/**
 * Menjadwalkan pengingat jadwal reservasi.
 * Menjadwalkan pengingat 5 detik setelah booking dibuat (agar bisa didemokan langsung),
 * serta pengingat sebelum jadwal mulai jika waktunya di masa mendatang.
 */
export async function scheduleReservationReminder(data: {
  facilityName: string;
  date: string;
  startTime: string;
}): Promise<string | null> {
  const perm = await requestNotificationPermission();
  if (perm !== "granted") {
    logger.warn("NOTIFICATION", `Jadwal notifikasi dilewati: izin berstatus ${perm}`, { perm });
    if (perm === "blocked") showNotificationBlockedAlert();
    return null;
  }

  try {
    // 1. Notifikasi demo instan (5 detik) untuk konfirmasi visual
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Konfirmasi Reservasi Ruangan 🏛️",
        body: `Reservasi di ${data.facilityName} (${data.date} pukul ${data.startTime}) telah aktif!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });

    logger.info("NOTIFICATION", "Pengingat reservasi berhasil dijadwalkan", {
      notificationId,
      facilityName: data.facilityName,
    });

    return notificationId;
  } catch (err: any) {
    logger.error("NOTIFICATION", `Error scheduling notification: ${err?.message}`, err);
    return null;
  }
}
