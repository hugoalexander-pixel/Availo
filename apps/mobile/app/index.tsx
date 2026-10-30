import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { useFocusEffect, router, Stack } from "expo-router";
import { apiClient, NetworkError } from "../src/services/ApiClient";
import { getAuthUser } from "../src/services/AuthStorage";
import { getAllReservationPhotos } from "../src/services/ReservationPhotoStorage";
import { Reservation, User } from "../src/types/Models";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  getReservationStatusStyle,
} from "../src/constants/Theme";
import LoadingView from "../src/components/LoadingView";
import EmptyView from "../src/components/EmptyView";
import ErrorView from "../src/components/ErrorView";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatTime(isoTimeStr: string): string {
  try {
    const d = new Date(isoTimeStr);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch {
    return isoTimeStr;
  }
}

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [photosMap, setPhotosMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const user = await getAuthUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setCurrentUser(user);

      // Ambil reservasi dari backend API
      const res = await apiClient.get<{ Data: Reservation[] }>("/reservations/my");
      setReservations(res.Data || []);

      // Ambil mapping foto lokal
      const localPhotos = await getAllReservationPhotos();
      setPhotosMap(localPhotos);
    } catch (err: any) {
      if (err?.status === 401) {
        router.replace("/login");
      } else if (err instanceof NetworkError) {
        setError(err.message);
      } else {
        setError(err?.message || "Gagal memuat daftar reservasi.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Batalkan Reservasi (US-3)
  const handleCancel = (item: Reservation) => {
    Alert.alert(
      "Batalkan Reservasi?",
      `Apakah Anda yakin ingin membatalkan reservasi di "${item.FacilityName}"? Ruangan akan kembali tersedia untuk mahasiswa lain.`,
      [
        { text: "Kembali", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.patch(`/reservations/${item.Id}/cancel`);
              Alert.alert("Berhasil", "Reservasi Anda telah dibatalkan.");
              loadData();
            } catch (err: any) {
              Alert.alert("Gagal Membatalkan", err?.message || "Terjadi kesalahan.");
            }
          },
        },
      ]
    );
  };

  // Selesai Lebih Awal / Early End (US-4)
  const handleEarlyEnd = (item: Reservation) => {
    Alert.alert(
      "Selesai Lebih Awal? ⏱️",
      `Apakah pemakaian ruangan "${item.FacilityName}" sudah selesai? Sistem akan langsung membebaskan ruangan dan memberi tahu mahasiswa lain yang sedang menunggu.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Bebaskan Ruangan",
          onPress: async () => {
            try {
              await apiClient.patch(`/reservations/${item.Id}/early-end`);
              Alert.alert(
                "Ruangan Dibebaskan! 🎉",
                "Terima kasih telah mengakhiri reservasi lebih awal. Mahasiswa yang memantau ruangan ini telah diberi notifikasi."
              );
              loadData();
            } catch (err: any) {
              Alert.alert("Gagal Mengakhiri", err?.message || "Terjadi kesalahan.");
            }
          },
        },
      ]
    );
  };

  // Filter tab data
  const filteredList = reservations.filter((r) => {
    if (activeTab === "active") {
      return r.Status === "UPCOMING" || r.Status === "ACTIVE";
    }
    return r.Status === "COMPLETED" || r.Status === "CANCELLED" || r.Status === "EARLY_ENDED";
  });

  const renderReservationCard = ({ item }: { item: Reservation }) => {
    const statusStyle = getReservationStatusStyle(item.Status);
    const photoUri = photosMap[item.Id.toString()];
    const isUpcoming = item.Status === "UPCOMING";
    const isActive = item.Status === "ACTIVE";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.facilityName} numberOfLines={1}>
              {item.FacilityName}
            </Text>
            {item.BuildingName && (
              <Text style={styles.buildingName}>📍 {item.BuildingName}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        {/* Thumbnail Foto Kondisi Ruangan (Advanced Feature 2) */}
        {photoUri && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoThumbnail} />
            <Text style={styles.photoCaption}>📷 Bukti foto kondisi ruangan</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{formatDate(item.Date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>
              {formatTime(item.StartTime)} - {formatTime(item.EndTime)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <Text style={styles.infoText}>{item.PartySize} orang peserta</Text>
          </View>
          {item.Purpose && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📝</Text>
              <Text style={styles.infoText} numberOfLines={2}>
                {item.Purpose}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {(isUpcoming || isActive) && (
          <View style={styles.cardActions}>
            {isUpcoming && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push(`/edit/${item.Id}`)}
              >
                <Text style={styles.editButtonText}>✏️ Ubah</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.earlyEndButton}
              onPress={() => handleEarlyEnd(item)}
            >
              <Text style={styles.earlyEndButtonText}>⏱️ Selesai</Text>
            </TouchableOpacity>

            {isUpcoming && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancel(item)}
              >
                <Text style={styles.cancelButtonText}>✕ Batal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Availo",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "800", fontSize: FontSize.xl },
          headerRight: () => (
            <View style={styles.headerRightRow}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push("/notifications")}
              >
                <Text style={styles.headerIconText}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push("/profile")}
              >
                <Text style={styles.headerIconText}>👤</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Quick Navigation Banner */}
      <View style={styles.topBanner}>
        <View style={styles.userGreeting}>
          <Text style={styles.greetingText}>
            Halo, {currentUser?.Name || "Mahasiswa"} 👋
          </Text>
          <Text style={styles.roleSubtext}>
            {currentUser?.Role === "PENGELOLA" ? "🏢 Pengelola Fasilitas" : "🎓 Mahasiswa"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/facilities")}
        >
          <Text style={styles.browseButtonText}>🔍 Cari Ruangan</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Filter: Aktif vs Riwayat */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[styles.tabText, activeTab === "active" && styles.tabTextActive]}
          >
            Mendatang & Aktif
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}
          >
            Riwayat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {loading ? (
        <LoadingView message="Memuat reservasi..." />
      ) : error ? (
        <ErrorView message={error} onRetry={loadData} />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderReservationCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyView
              icon={activeTab === "active" ? "📅" : "📜"}
              title={
                activeTab === "active"
                  ? "Belum Ada Reservasi Aktif"
                  : "Belum Ada Riwayat"
              }
              subtitle={
                activeTab === "active"
                  ? "Cari ruangan kampus yang tersedia dan pesan sekarang untuk kebutuhan kuliah Anda."
                  : "Riwayat reservasi yang selesai atau dibatalkan akan muncul di sini."
              }
              actionLabel={activeTab === "active" ? "+ Cari & Reservasi Ruangan" : undefined}
              onAction={activeTab === "active" ? () => router.push("/facilities") : undefined}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRightRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginRight: Spacing.xs,
  },
  headerIconButton: {
    padding: Spacing.sm,
  },
  headerIconText: {
    fontSize: FontSize.lg,
  },
  topBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userGreeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
  },
  roleSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  browseButton: {
    backgroundColor: Colors.primaryLight + "18",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight + "40",
  },
  browseButtonText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: "700",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  facilityName: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  buildingName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  photoContainer: {
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoThumbnail: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  photoCaption: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    fontStyle: "italic",
  },
  cardBody: {
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoIcon: {
    fontSize: FontSize.sm,
    width: 20,
    textAlign: "center",
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  editButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight + "18",
    alignItems: "center",
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  earlyEndButton: {
    flex: 1.2,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.warningLight,
    alignItems: "center",
  },
  earlyEndButtonText: {
    color: Colors.warning,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.error,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    bottom: Spacing.xxxl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: "300",
    marginTop: -2,
  },
});
