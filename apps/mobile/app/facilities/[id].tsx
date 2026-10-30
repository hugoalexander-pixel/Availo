import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { apiClient, NetworkError } from "../../src/services/ApiClient";
import { Facility } from "../../src/types/Models";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  getFacilityStatusStyle,
} from "../../src/constants/Theme";
import LoadingView from "../../src/components/LoadingView";
import ErrorView from "../../src/components/ErrorView";

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);

  async function loadDetail() {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.get<{ Data: Facility }>(`/facilities/${id}`);
      setFacility(res.Data);
    } catch (err: any) {
      if (err instanceof NetworkError) {
        setError(err.message);
      } else {
        setError(err?.message || "Gagal memuat detail fasilitas.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function handleWatchFacility() {
    if (!facility) return;
    setWatching(true);
    try {
      await apiClient.post("/notifications/watch", { FacilityId: facility.Id });
      Alert.alert(
        "Pengingat Aktif 🔔",
        `Anda akan menerima notifikasi segera setelah ${facility.Name} tersedia!`
      );
    } catch (err: any) {
      Alert.alert("Info", err?.message || "Sudah dalam daftar pantauan ketersediaan.");
    } finally {
      setWatching(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Memuat Ruangan..." }} />
        <LoadingView message="Memuat detail ruangan..." />
      </>
    );
  }

  if (error || !facility) {
    return (
      <>
        <Stack.Screen options={{ title: "Detail Fasilitas" }} />
        <ErrorView
          message={error || "Fasilitas tidak ditemukan."}
          onRetry={loadDetail}
        />
      </>
    );
  }

  const statusStyle = getFacilityStatusStyle(facility.Status);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: facility.Name,
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusBannerText, { color: statusStyle.text }]}>
            ● Status: {statusStyle.label}
          </Text>
        </View>

        {/* Main Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.facilityTitle}>{facility.Name}</Text>
          <Text style={styles.locationSubtitle}>
            📍 {facility.Building?.Name} • Lantai {facility.Floor}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{facility.Capacity}</Text>
              <Text style={styles.statLabel}>Kapasitas (Orang)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{facility.Floor}</Text>
              <Text style={styles.statLabel}>Lantai Gedung</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {facility.Type === "LABORATORIUM"
                  ? "Lab"
                  : facility.Type === "RUANG_KELAS"
                  ? "Kelas"
                  : "Ruang"}
              </Text>
              <Text style={styles.statLabel}>Tipe Fasilitas</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {facility.Description && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Deskripsi Ruangan</Text>
            <Text style={styles.descriptionText}>{facility.Description}</Text>
          </View>
        )}

        {/* Amenities */}
        {facility.Amenities && facility.Amenities.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Fasilitas & Peralatan Pendukung</Text>
            <View style={styles.amenitiesGrid}>
              {facility.Amenities.map((a) => (
                <View key={a.Id} style={styles.amenityItem}>
                  <Text style={styles.amenityIcon}>{a.Icon || "✓"}</Text>
                  <Text style={styles.amenityName}>{a.Name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Watch Notification Action if in use */}
        {facility.Status === "SEDANG_DIGUNAKAN" && (
          <TouchableOpacity
            style={styles.watchButton}
            onPress={handleWatchFacility}
            disabled={watching}
            activeOpacity={0.8}
          >
            <Text style={styles.watchButtonText}>
              {watching ? "Mendaftarkan..." : "🔔 Pantau Ruangan (Notifikasi saat Kosong)"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Floating Bottom Booking Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            router.push({
              pathname: "/create",
              params: {
                facilityId: facility.Id.toString(),
                facilityName: facility.Name,
              },
            })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>📅 Reservasi Ruangan Ini</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  statusBanner: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  statusBannerText: {
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  facilityTitle: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.text,
  },
  locationSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statNumber: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  amenityIcon: {
    fontSize: FontSize.md,
  },
  amenityName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  watchButton: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warning,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  watchButtonText: {
    color: Colors.warning,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});

