import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rooms } from '../../src/features/rooms/data';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { getThemeColors } from '../../src/theme';

export default function SavedScreen() {
  const { savedRoomIds, toggleSaved, isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  const savedRooms = rooms.filter((room) => savedRoomIds.includes(room.id));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.kicker, { color: theme.subtle }]}>KOLEKSI PILIHAN</Text>
        <Text style={[styles.title, { color: theme.text }]}>Ruang tersimpan</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Simpan ruang favorit agar mudah ditemukan lagi.</Text>

        {savedRooms.length ? savedRooms.map((room) => (
          <View key={room.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.color, { backgroundColor: room.color }]}><Text style={styles.mark}>{room.mark}</Text></View>
            <View style={styles.copy}>
              <Text style={[styles.name, { color: theme.text }]}>{room.name}</Text>
              <Text style={[styles.detail, { color: theme.muted }]}>{room.building} · Maks. {room.capacity} orang</Text>
            </View>
            <Pressable onPress={() => toggleSaved(room.id)} accessibilityRole="button" accessibilityLabel="Hapus dari tersimpan">
              <Text style={styles.heart}>♥</Text>
            </Pressable>
          </View>
        )) : (
          <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={styles.heartEmpty}>♡</Text>
            <Text style={[styles.name, { color: theme.text }]}>Belum ada ruang tersimpan</Text>
            <Text style={[styles.detail, { color: theme.muted }]}>Tekan ikon hati di kartu ruang untuk menyimpannya.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  kicker: { fontWeight: '700', letterSpacing: 1, fontSize: 11, marginTop: 14 },
  title: { fontWeight: '800', fontSize: 26, marginTop: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 6, marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  color: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mark: { color: '#37593c', fontSize: 22 },
  copy: { flex: 1, paddingHorizontal: 12, gap: 4 },
  name: { fontWeight: '700', fontSize: 15 },
  detail: { fontSize: 12 },
  heart: { color: '#cf6d61', fontSize: 24, padding: 6 },
  empty: { borderRadius: 14, borderWidth: 1, alignItems: 'center', padding: 32 },
  heartEmpty: { color: '#83a080', fontSize: 36, marginBottom: 10 },
});
