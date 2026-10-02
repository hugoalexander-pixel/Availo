import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rooms } from '../../src/features/rooms/data';
import { usePrototypeStore } from '../../src/state/PrototypeStore';

export default function SavedScreen() {
  const { savedRoomIds, toggleSaved } = usePrototypeStore();
  const savedRooms = rooms.filter((room) => savedRoomIds.includes(room.id));
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>KOLEKSI PILIHAN</Text><Text style={styles.title}>Ruang tersimpan</Text>
        <Text style={styles.subtitle}>Simpan ruang favorit agar mudah ditemukan lagi.</Text>
        {savedRooms.length ? savedRooms.map((room) => <View key={room.id} style={styles.card}><View style={[styles.color, { backgroundColor: room.color }]}><Text style={styles.mark}>{room.mark}</Text></View><View style={styles.copy}><Text style={styles.name}>{room.name}</Text><Text style={styles.detail}>{room.building} · Maks. {room.capacity} orang</Text></View><Pressable onPress={() => toggleSaved(room.id)}><Text style={styles.heart}>♥</Text></Pressable></View>) : <View style={styles.empty}><Text style={styles.heartEmpty}>♡</Text><Text style={styles.name}>Belum ada ruang tersimpan</Text><Text style={styles.detail}>Tekan ikon hati di kartu ruang untuk menyimpannya.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#f7f8f4' }, content: { padding: 20 }, kicker: { color: '#91a087', fontWeight: '700', letterSpacing: 1, fontSize: 9, marginTop: 24 }, title: { color: '#202d23', fontWeight: '800', fontSize: 27, marginTop: 7 }, subtitle: { color: '#7f897f', fontSize: 12, marginTop: 8, marginBottom: 22 }, card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 11, borderWidth: 1, borderColor: '#e8ebe5', borderRadius: 11, marginBottom: 10 }, color: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, mark: { color: '#628060', fontSize: 22 }, copy: { flex: 1, paddingHorizontal: 11, gap: 5 }, name: { color: '#253329', fontWeight: '700', fontSize: 12 }, detail: { color: '#858f85', fontSize: 10 }, heart: { color: '#cf6d61', fontSize: 20, padding: 5 }, empty: { backgroundColor: '#fff', borderRadius: 11, borderWidth: 1, borderColor: '#e8ebe5', alignItems: 'center', padding: 26 }, heartEmpty: { color: '#83a080', fontSize: 31, marginBottom: 8 } });
