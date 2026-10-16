import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Booking } from "../src/types/Booking";
import { getAllBookings, deleteBooking } from "../src/services/BookingStorage";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/constants/Theme";

function getStatusColor(status: Booking["Status"]) {
  switch (status) {
    case "Pending":
      return { bg: Colors.pendingLight, text: Colors.pending };
    case "Confirmed":
      return { bg: Colors.confirmedLight, text: Colors.confirmed };
    case "Cancelled":
      return { bg: Colors.cancelledLight, text: Colors.cancelled };
  }
}

function getStatusLabel(status: Booking["Status"]) {
  switch (status) {
    case "Pending":
      return "Menunggu";
    case "Confirmed":
      return "Dikonfirmasi";
    case "Cancelled":
      return "Dibatalkan";
  }
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const data = await getAllBookings();
      data.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
      setBookings(data);
    } catch {
      Alert.alert("Error", "Gagal memuat data booking.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadBookings();
    }, [loadBookings])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleDelete = (booking: Booking) => {
    Alert.alert(
      "Hapus Booking",
      `Apakah Anda yakin ingin menghapus booking "${booking.FacilityName}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBooking(booking.Id);
              await loadBookings();
              Alert.alert("Berhasil", "Booking berhasil dihapus.");
            } catch {
              Alert.alert("Error", "Gagal menghapus booking.");
            }
          },
        },
      ]
    );
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusColor = getStatusColor(item.Status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.facilityName} numberOfLines={1}>
            {item.FacilityName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {getStatusLabel(item.Status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{formatDate(item.Date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>
              {item.StartTime} - {item.EndTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📝</Text>
            <Text style={styles.infoText} numberOfLines={2}>
              {item.Purpose}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/edit/${item.Id}`)}
          >
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Belum Ada Booking</Text>
      <Text style={styles.emptySubtitle}>
        Tekan tombol + untuk menambahkan booking fasilitas kampus Anda.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data booking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Booking Saya</Text>
        <Text style={styles.headerCount}>
          {bookings.length} booking
        </Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.Id}
        renderItem={renderBookingCard}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          bookings.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  headerCount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyListContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  facilityName: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardBody: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
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
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: "300",
    marginTop: -2,
  },
});
