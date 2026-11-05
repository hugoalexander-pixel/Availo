import React, { useState, useCallback } from 'react';
import {
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

export default function SavedScreen() {
  const router = useRouter();
  const { savedRoomIds, toggleSaved } = usePrototypeStore();
  const { isMediumLarge } = useResponsive();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);
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
      showToast('Daftar ruang tersimpan diperbarui.', 'info');
    }, 600);
  }, []);

  const savedRooms = rooms.filter((room) => savedRoomIds.includes(room.id));

  const handleRemove = (roomId: number, roomName: string) => {
    toggleSaved(roomId);
    showToast(`${roomName} dihapus dari daftar tersimpan.`, 'info');
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
          <Text style={styles.kicker}>KOLEKSI PILIHAN</Text>
          <Text style={styles.title}>Ruang tersimpan</Text>
          <Text style={styles.subtitle}>
            Simpan ruang favorit agar mudah ditemukan dan dipesan kembali sewaktu-waktu.
          </Text>
        </View>

        {savedRooms.length > 0 ? (
          <View style={isMediumLarge ? styles.grid : styles.list}>
            {savedRooms.map((room) => (
              <View
                key={room.id}
                style={[styles.card, isMediumLarge && styles.gridCard]}
                accessibilityRole="summary"
                accessibilityLabel={`Ruang ${room.name}, ${room.building}, lantai ${room.floor}, kapasitas maksimal ${room.capacity} orang`}
              >
                <View
                  style={[styles.colorBox, { backgroundColor: room.color }]}
                  accessible={false}
                >
                  <Text style={styles.mark}>{room.mark}</Text>
                </View>

                <View style={styles.copy}>
                  <Text style={styles.name} numberOfLines={1}>
                    {room.name}
                  </Text>
                  <Text style={styles.detail}>
                    {room.building} · {room.floor}
                  </Text>
                  <Text style={styles.capacity}>
                    Maks. {room.capacity} orang
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleRemove(room.id, room.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus ${room.name} dari tersimpan`}
                  accessibilityHint="Menghapus ruang ini dari daftar koleksi tersimpan"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.heartButton}
                >
                  <Text style={styles.heartIcon} accessible={false}>
                    ♥
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={styles.emptyContainer}
            accessibilityRole="summary"
            accessibilityLabel="Belum ada ruang tersimpan"
          >
            <View style={styles.emptyIconCircle} accessible={false}>
              <Text style={styles.emptyIcon}>♡</Text>
            </View>
            <Text style={styles.emptyTitle}>Belum ada ruang tersimpan</Text>
            <Text style={styles.emptyText}>
              Tekan ikon hati pada kartu ruang di halaman Cari untuk menyimpannya di sini.
            </Text>
            <AppButton
              label="Eksplorasi Ruang Sekarang"
              onPress={() => router.push('/')}
              variant="secondary"
              style={styles.emptyButton}
              accessibilityLabel="Pindah ke halaman Cari Ruangan"
            />
          </View>
        )}
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
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e7df',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  gridCard: {
    width: '48%',
    flexGrow: 1,
  },
  colorBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    color: '#34553b',
    fontSize: 24,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 3,
  },
  name: {
    color: '#1a271e',
    fontWeight: '700',
    fontSize: 15,
  },
  detail: {
    color: '#425345',
    fontSize: 13,
  },
  capacity: {
    color: '#2d603a',
    fontSize: 12,
    fontWeight: '600',
  },
  heartButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#fbeeed',
  },
  heartIcon: {
    color: '#b02a1c',
    fontSize: 22,
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
});
