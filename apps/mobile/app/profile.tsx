import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Stack, router } from "expo-router";
import { getAuthUser, clearAuthSession } from "../src/services/AuthStorage";
import { getApiBaseUrl, setCustomApiUrl } from "../src/config/api";
import { User } from "../src/types/Models";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/constants/Theme";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());

  useEffect(() => {
    async function loadUser() {
      const u = await getAuthUser();
      setUser(u);
    }
    loadUser();
  }, []);

  function handleSaveApiUrl() {
    setCustomApiUrl(apiUrl);
    Alert.alert("Berhasil", "Base URL API berhasil diperbarui untuk sesi ini.");
  }

  function handleResetApiUrl() {
    setCustomApiUrl(null);
    setApiUrl(getApiBaseUrl());
    Alert.alert("Reset", "Base URL API dikembalikan ke default.");
  }

  function handleLogout() {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari akun Availo Anda?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await clearAuthSession();
            router.replace("/login");
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Stack.Screen
        options={{
          title: "Profil Pengguna",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.Name ? user.Name.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>

        <Text style={styles.userName}>{user?.Name || "Pengguna Availo"}</Text>
        <Text style={styles.userEmail}>{user?.Email || "email@kampus.ac.id"}</Text>

        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor:
                user?.Role === "PENGELOLA"
                  ? Colors.warningLight
                  : Colors.primaryLight + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.roleBadgeText,
              {
                color:
                  user?.Role === "PENGELOLA" ? Colors.warning : Colors.primary,
              },
            ]}
          >
            {user?.Role === "PENGELOLA" ? "🏢 Pengelola Fasilitas" : "🎓 Mahasiswa"}
          </Text>
        </View>
      </View>

      {/* Role explanation */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Hak Akses Sistem (Role-Based)</Text>
        <Text style={styles.sectionBody}>
          {user?.Role === "PENGELOLA"
            ? "Akun Anda memiliki hak akses Pengelola: dapat membuat, mengubah, dan menghapus fasilitas kampus serta melihat pemantauan ruangan."
            : "Akun Anda memiliki hak akses Mahasiswa: dapat mencari fasilitas kosong secara real-time, memesan ruangan, mengambil foto dokumentasi ruangan, serta menerima notifikasi ketersediaan."}
        </Text>
      </View>

      {/* API Server Configuration */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Pengaturan Server API (Demo)</Text>
        <Text style={styles.configHint}>
          Gunakan untuk menghubungkan aplikasi ke backend di emulator (10.0.2.2) atau IP jaringan Wi-Fi perangkat fisik Anda.
        </Text>

        <TextInput
          style={styles.apiInput}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://10.0.2.2:3000/api"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.configButtonsRow}>
          <TouchableOpacity style={styles.saveUrlButton} onPress={handleSaveApiUrl}>
            <Text style={styles.saveUrlText}>Simpan URL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetUrlButton} onPress={handleResetApiUrl}>
            <Text style={styles.resetUrlText}>Reset Default</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutButtonText}>🚪 Keluar dari Akun</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  userCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: "700",
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionBody: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  configHint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  apiInput: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.xs,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  configButtonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  saveUrlButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  saveUrlText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  resetUrlButton: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  resetUrlText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error + "40",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
});
