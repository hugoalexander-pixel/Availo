import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { apiClient, NetworkError } from "../src/services/ApiClient";
import { NotificationItem } from "../src/types/Models";
import { sendInstantNotification } from "../src/services/NotificationService";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/constants/Theme";
import LoadingView from "../src/components/LoadingView";
import EmptyView from "../src/components/EmptyView";
import ErrorView from "../src/components/ErrorView";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setError(null);
    try {
      const res = await apiClient.get<{ Data: NotificationItem[] }>("/notifications");
      setNotifications(res.Data || []);
    } catch (err: any) {
      if (err instanceof NetworkError) {
        setError(err.message);
      } else {
        setError(err?.message || "Gagal memuat notifikasi.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.Id === id ? { ...n, IsRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  // Demo Trigger Notifikasi Native
  const handleTestNotification = async () => {
    const success = await sendInstantNotification(
      "Pengingat Reservasi Availo 🔔",
      "Ini adalah demo notifikasi lokal native yang berhasil dipicu di perangkat Anda!"
    );
    if (success) {
      Alert.alert(
        "Notifikasi Terkirim! 📲",
        "Periksa bilah notifikasi status bar perangkat Anda untuk melihat pengingat yang baru saja dikirim."
      );
    }
  };

  const renderNotificationCard = ({ item }: { item: NotificationItem }) => {
    return (
      <TouchableOpacity
        style={[styles.card, !item.IsRead && styles.cardUnread]}
        onPress={() => !item.IsRead && handleMarkAsRead(item.Id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>
            {item.Type === "FACILITY_AVAILABLE"
              ? "🟢"
              : item.Type === "RESERVATION_REMINDER"
              ? "⏰"
              : "ℹ️"}
          </Text>
          <Text style={styles.cardMessage} numberOfLines={3}>
            {item.Message}
          </Text>
          {!item.IsRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardDate}>
          {new Date(item.CreatedAt).toLocaleString("id-ID")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Notifikasi",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />

      {/* Demo Action Bar */}
      <View style={styles.demoBanner}>
        <View style={styles.demoBannerInfo}>
          <Text style={styles.demoBannerTitle}>Fitur Notifikasi Native</Text>
          <Text style={styles.demoBannerSub}>Uji pengingat jadwal ruangan di perangkat</Text>
        </View>
        <TouchableOpacity
          style={styles.demoNotifyButton}
          onPress={handleTestNotification}
          activeOpacity={0.8}
        >
          <Text style={styles.demoNotifyText}>🔔 Uji Notifikasi</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingView message="Memuat notifikasi..." />
      ) : error ? (
        <ErrorView message={error} onRetry={loadNotifications} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderNotificationCard}
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
              icon="🔔"
              title="Belum Ada Notifikasi"
              subtitle="Pemberitahuan ruangan kosong dan pengingat reservasi Anda akan ditampilkan di sini."
              actionLabel="🔔 Uji Coba Notifikasi Sekarang"
              onAction={handleTestNotification}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  demoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  demoBannerInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  demoBannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
  },
  demoBannerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  demoNotifyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  demoNotifyText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardUnread: {
    backgroundColor: Colors.primaryLight + "10",
    borderColor: Colors.primaryLight + "40",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  cardIcon: {
    fontSize: FontSize.lg,
  },
  cardMessage: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  cardDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginLeft: 28,
  },
});

