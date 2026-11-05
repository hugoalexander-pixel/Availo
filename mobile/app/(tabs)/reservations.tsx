import React, { useState, useCallback } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { rooms } from '../../src/features/rooms/data';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppButton } from '../../src/components/AppButton';
import { Toast } from '../../src/components/Toast';
import { useResponsive } from '../../src/hooks/useResponsive';

export default function ReservationsScreen() {
  const router = useRouter();
  const { bookedRoomIds, removeBooking } = usePrototypeStore();
  const { isMediumLarge } = useResponsive();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Daftar reservasi diperbarui secara real-time.', 'info');
    }, 600);
  }, []);

  const bookedRooms = rooms.filter((room) => bookedRoomIds.includes(room.id));

  const handleCancelBooking = (roomId: number, roomName: string) => {
    Alert.alert(
      'Batalkan Reservasi',
      `Apakah Anda yakin ingin membatalkan reservasi untuk ${roomName}? Ruangan akan kembali tersedia untuk mahasiswa lain.`,
      [
        { text: 'Kembali', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: () => {
            setLoadingId(roomId);
            setTimeout(() => {
              removeBooking(roomId);
              setLoadingId(null);
              showToast(`Reservasi ${roomName} berhasil dibatalkan.`, 'success');
            }, 500);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#204d35"
          colors={['#204d35']}
        />
      }
    >
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.kicker}>AKTIVITASMU</Text>
          <Text style={styles.title}>Reservasi saya</Text>
          <Text style={styles.subtitle}>
            Kelola jadwal penggunaan ruang kampus yang sedang aktif atau yang akan datang.
          </Text>
        </View>

        {bookedRooms.length > 0 ? (
          <View style={isMediumLarge ? styles.grid : styles.list}>
            {bookedRooms.map((room) => {
              const isCancelling = loadingId === room.id;
              return (
                <View
                  key={room.id}
                  style={[styles.card, isMediumLarge && styles.gridCard]}
                  accessibilityRole="summary"
                  accessibilityLabel={`Reservasi untuk ${room.name}, ${room.building}, lantai ${room.floor}, status terkonfirmasi`}
                >
                  <View style={styles.topCardRow}>
                    <View style={styles.iconBadge} accessible={false}>
                      <Text style={styles.iconBadgeText}>▣</Text>
                    </View>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={styles.roomName} numberOfLines={1}>
                        {room.name}
                      </Text>
                      <Text style={styles.roomLocation}>
                        {room.building} · {room.floor}
                      </Text>
                    </View>
                    <View
                      style={styles.statusBadge}
                      accessibilityLabel="Status reservasi terkonfirmasi aktif"
                    >
                      <Text style={styles.statusDot}>●</Text>
                      <Text style={styles.statusText}>Dikonfirmasi</Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>WAKTU</Text>
                      <Text style={styles.detailValue}>10:00 – 12:00 WIB</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>TANGGAL</Text>
                      <Text style={styles.detailValue}>2 Okt 2026</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>KAPASITAS</Text>
                      <Text style={styles.detailValue}>{room.capacity} Orang</Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => handleCancelBooking(room.id, room.name)}
                      disabled={isCancelling}
                      style={styles.cancelBtn}
                      accessibilityRole="button"
                      accessibilityLabel={`Batalkan reservasi ${room.name}`}
                      accessibilityHint="Membuka konfirmasi pembatalan reservasi"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color="#c0392b" />
                      ) : (
                        <>
                          <Text style={styles.cancelBtnIcon} accessible={false}>✕</Text>
                          <Text style={styles.cancelBtnText}>Batalkan Reservasi</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View
            style={styles.emptyContainer}
            accessibilityRole="summary"
            accessibilityLabel="Belum ada reservasi aktif"
          >
            <View style={styles.emptyIconCircle} accessible={false}>
              <Text style={styles.emptyIcon}>▣</Text>
            </View>
            <Text style={styles.emptyTitle}>Belum ada reservasi aktif</Text>
            <Text style={styles.emptyText}>
              Temukan ruang yang cocok untuk kegiatan belajarmu dan lakukan pemesanan secara instan.
            </Text>
            <AppButton
              label="Cari Ruang Sekarang"
              onPress={() => router.push('/')}
              style={styles.emptyButton}
              accessibilityLabel="Pindah ke halaman Cari Ruangan"
            />
          </View>
        )}

        <View style={styles.infoBanner} accessible={false}>
          <Text style={styles.infoBannerIcon}>ℹ</Text>
          <Text style={styles.note}>
            Data reservasi prototype disimpan secara lokal pada memori aplikasi untuk demonstrasi alur.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerBlock: {
    marginBottom: 20,
  },
  kicker: {
    color: '#3d5942',
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 12,
  },
  title: {
    color: '#1a271e',
    fontWeight: '800',
    fontSize: 28,
    marginTop: 6,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: '#425345',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  list: {
    gap: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e7df',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCard: {
    width: '48%',
    flexGrow: 1,
  },
  topCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#edf4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    color: '#204d35',
    fontSize: 18,
    fontWeight: '700',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  roomName: {
    color: '#1a271e',
    fontWeight: '700',
    fontSize: 16,
  },
  roomLocation: {
    color: '#425345',
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eaf4e8',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c6e0c4',
  },
  statusDot: {
    color: '#257038',
    fontSize: 10,
  },
  statusText: {
    color: '#20582f',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf7',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#edf1ea',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5e7160',
    letterSpacing: 0.6,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a271e',
    marginTop: 3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#edf1ea',
    paddingTop: 12,
  },
  cancelBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f2c6c2',
    backgroundColor: '#fdf3f2',
  },
  cancelBtnIcon: {
    color: '#b02a1c',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtnText: {
    color: '#b02a1c',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e7df',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#edf4ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIcon: {
    color: '#31633d',
    fontSize: 32,
  },
  emptyTitle: {
    color: '#1a271e',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#425345',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
  },
  emptyButton: {
    marginTop: 20,
    minWidth: 200,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef3eb',
    padding: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  infoBannerIcon: {
    color: '#28583f',
    fontSize: 14,
    fontWeight: '700',
  },
  note: {
    color: '#4b5e4d',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});
