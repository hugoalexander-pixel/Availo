import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rooms } from '../../src/features/rooms/data';
import { useBooking } from '../../src/features/bookings/state/BookingProvider';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { getThemeColors } from '../../src/theme';

export default function ReservationsScreen() {
  const { state, refreshHistory } = useBooking();
  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  const reservations = state.reservations;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.kicker, { color: theme.subtle }]}>AKTIVITASMU</Text>
        <Text style={[styles.title, { color: theme.text }]}>Reservasi saya</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Ruang yang sudah kamu pesan akan tampil di sini.</Text>

        {state.historyStatus === 'loading' ? (
          <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel="Memuat reservasi">
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.detail, { color: theme.muted }]}>Memuat reservasi...</Text>
          </View>
        ) : state.historyStatus === 'error' ? (
          <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.name, { color: theme.text }]}>Riwayat reservasi gagal dimuat</Text>
            <Text style={[styles.detail, { color: theme.muted }]}>Periksa koneksi, lalu muat ulang riwayat.</Text>
            <Pressable accessibilityRole="button" onPress={() => void refreshHistory()} style={styles.retryButton}>
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 11 }}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : reservations.length ? reservations.map((reservation) => {
          const room = rooms.find((item) => item.id === reservation.roomId);
          if (!room) return null;
          const start = new Date(reservation.startsAt);
          const end = new Date(reservation.endsAt);
          return (
            <View key={reservation.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}><Text style={{ color: theme.primary }}>▣</Text></View>
              <View style={styles.copy}>
                <Text style={[styles.name, { color: theme.text }]}>{room.name}</Text>
                <Text style={[styles.detail, { color: theme.muted }]}>{room.building} · {start.toLocaleDateString('id-ID')}</Text>
                <Text style={[styles.detail, { color: theme.muted }]}>{start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}–{end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · {reservation.people} orang</Text>
                <Text style={[styles.status, { color: theme.primary }]}>● {reservation.status === 'CONFIRMED' ? 'Dikonfirmasi' : reservation.status}</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Reservasi', 'Pembatalan akan tersedia setelah backend terhubung.')}>
                <Text style={[styles.more, { color: theme.subtle }]}>···</Text>
              </Pressable>
            </View>
          );
        }) : (
          <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyIcon, { color: theme.primary }]}>▣</Text>
            <Text style={[styles.name, { color: theme.text }]}>Belum ada reservasi</Text>
            <Text style={[styles.detail, { color: theme.muted }]}>Cari ruang dan pesan untuk melihat reservasi di sini.</Text>
          </View>
        )}
        <Text style={[styles.note, { color: theme.subtle }]}>Reservasi prototype disimpan sementara di memori aplikasi.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20 },
  kicker: { fontWeight: '700', letterSpacing: 1, fontSize: 9, marginTop: 24 },
  title: { fontWeight: '800', fontSize: 27, marginTop: 7 },
  subtitle: { fontSize: 12, marginTop: 8, marginBottom: 22 },
  state: { minHeight: 115, alignItems: 'center', justifyContent: 'center', gap: 9 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 13, borderWidth: 1, borderRadius: 11, marginBottom: 10 },
  icon: { width: 39, height: 39, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  copy: { flex: 1, gap: 4 },
  name: { fontWeight: '700', fontSize: 12 },
  detail: { fontSize: 10 },
  status: { fontSize: 9 },
  more: { fontSize: 20 },
  empty: { borderRadius: 11, borderWidth: 1, alignItems: 'center', padding: 26 },
  emptyIcon: { fontSize: 30, marginBottom: 8 },
  note: { fontSize: 9, textAlign: 'center', marginTop: 17 },
  retryButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 15 },
});
