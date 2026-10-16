import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Booking } from '../../src/types/Booking';
import { deleteBooking, getAllBookings } from '../../src/services/BookingStorage';
import { BookingForm } from '../../src/components/BookingForm';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { getThemeColors } from '../../src/theme';

const green = '#28583f';

export default function ReservationsScreen() {
  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getAllBookings();
      // Urutkan berdasarkan waktu pembuatan terbaru
      setBookings(data.reverse());
    } catch {
      Alert.alert('Error', 'Gagal memuat data booking dari local storage.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const confirmDelete = (booking: Booking) => {
    Alert.alert(
      'Hapus Booking?',
      `Apakah kamu yakin ingin menghapus booking "${booking.FacilityName}" pada tanggal ${booking.Date}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBooking(booking.Id);
              Alert.alert('Berhasil', 'Data booking telah dihapus dari storage.');
              void loadData();
            } catch (err) {
              Alert.alert('Gagal Menghapus', err instanceof Error ? err.message : 'Terjadi kesalahan.');
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: Booking['Status']) => {
    switch (status) {
      case 'Confirmed':
        return {
          label: 'Dikonfirmasi (Confirmed)',
          bg: '#dcfce7',
          color: '#15803d',
          dot: '#16a34a',
        };
      case 'Cancelled':
        return {
          label: 'Dibatalkan (Cancelled)',
          bg: '#fee2e2',
          color: '#b91c1c',
          dot: '#dc2626',
        };
      case 'Pending':
      default:
        return {
          label: 'Menunggu (Pending)',
          bg: '#fef3c7',
          color: '#b45309',
          dot: '#d97706',
        };
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.kicker, { color: theme.subtle }]}>LOCAL STORAGE · @AVAILO/BOOKINGS</Text>
          <Text style={[styles.title, { color: theme.text }]}>Riwayat Booking</Text>
        </View>
        <Pressable
          style={styles.addHeaderBtn}
          onPress={() => setIsCreateModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah booking baru"
        >
          <Text style={styles.addHeaderBtnText}>+ Tambah</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[green]} />}
      >
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Data tersimpan persisten secara lokal menggunakan AsyncStorage pada perangkat ini.
        </Text>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.muted }]}>Membaca data dari local storage...</Text>
          </View>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Belum Ada Booking</Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Belum ada data reservasi fasilitas kampus yang tersimpan di storage lokal. Tekan tombol di bawah untuk membuat booking baru.
            </Text>
            <Pressable
              style={styles.emptyActionBtn}
              onPress={() => setIsCreateModalOpen(true)}
              accessibilityRole="button"
            >
              <Text style={styles.emptyActionBtnText}>➕ Buat Booking Baru</Text>
            </Pressable>
          </View>
        ) : (
          /* List of Bookings */
          <View style={styles.listContainer}>
            <Text style={[styles.countBadge, { color: theme.muted }]}>
              Menampilkan {bookings.length} reservasi tersimpan:
            </Text>

            {bookings.map((booking) => {
              const badge = getStatusBadge(booking.Status);
              return (
                <View
                  key={booking.Id}
                  style={[styles.bookingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <Text numberOfLines={1} style={[styles.facilityTitle, { color: theme.text }]}>
                      {booking.FacilityName}
                    </Text>
                    <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                      <View style={[styles.badgeDot, { backgroundColor: badge.dot }]} />
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Card Details */}
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.subtle }]}>📅 Tanggal:</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{booking.Date}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.subtle }]}>⏰ Waktu:</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {booking.StartTime} – {booking.EndTime} WIB
                    </Text>
                  </View>

                  <View style={styles.purposeBox}>
                    <Text style={[styles.infoLabel, { color: theme.subtle }]}>🎯 Tujuan:</Text>
                    <Text style={[styles.purposeText, { color: theme.text }]}>{booking.Purpose}</Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.editBtn}
                      onPress={() => setEditingBooking(booking)}
                      accessibilityRole="button"
                      accessibilityLabel="Edit booking"
                    >
                      <Text style={styles.editBtnText}>✏️ Edit</Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => confirmDelete(booking)}
                      accessibilityRole="button"
                      accessibilityLabel="Hapus booking"
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Hapus</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <Pressable
        style={styles.fab}
        onPress={() => setIsCreateModalOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Tambah booking fasilitas"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* Modal Tambah Booking (Create) */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>Tambah Booking Baru</Text>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setIsCreateModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            <BookingForm
              onSuccess={() => {
                setIsCreateModalOpen(false);
                void loadData();
              }}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Edit Booking (Update) */}
      <Modal
        visible={editingBooking !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>Edit Reservasi Booking</Text>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setEditingBooking(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            {editingBooking && (
              <BookingForm
                booking={editingBooking}
                onSuccess={() => {
                  setEditingBooking(null);
                  void loadData();
                }}
                onCancel={() => setEditingBooking(null)}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  kicker: {
    fontWeight: '700',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  title: {
    fontWeight: '800',
    fontSize: 22,
    marginTop: 2,
    letterSpacing: -0.4,
  },
  addHeaderBtn: {
    backgroundColor: green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addHeaderBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 90,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  loadingState: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 280,
  },
  emptyActionBtn: {
    backgroundColor: green,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    gap: 14,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  facilityTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.3,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 75,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  purposeBox: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  purposeText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#edf3e9',
  },
  editBtnText: {
    color: green,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  deleteBtnText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
});
