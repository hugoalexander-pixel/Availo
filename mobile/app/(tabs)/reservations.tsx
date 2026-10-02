import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rooms } from '../../src/features/rooms/data';
import { usePrototypeStore } from '../../src/state/PrototypeStore';

export default function ReservationsScreen() {
  const { bookedRoomIds } = usePrototypeStore();
  const bookedRooms = rooms.filter((room) => bookedRoomIds.includes(room.id));
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>AKTIVITASMU</Text><Text style={styles.title}>Reservasi saya</Text>
        <Text style={styles.subtitle}>Ruang yang sudah kamu pesan akan tampil di sini.</Text>
        {bookedRooms.length ? bookedRooms.map((room) => <View key={room.id} style={styles.card}><View style={styles.icon}><Text>▣</Text></View><View style={styles.copy}><Text style={styles.name}>{room.name}</Text><Text style={styles.detail}>{room.building} · 10:00–12:00</Text><Text style={styles.status}>● Dikonfirmasi (prototype)</Text></View><Pressable onPress={() => Alert.alert('Reservasi', 'Pembatalan akan tersedia setelah backend terhubung.')}><Text style={styles.more}>···</Text></Pressable></View>) : <View style={styles.empty}><Text style={styles.emptyIcon}>▣</Text><Text style={styles.name}>Belum ada reservasi</Text><Text style={styles.detail}>Cari ruang dan pesan untuk melihat reservasi di sini.</Text></View>}
        <Text style={styles.note}>Reservasi prototype disimpan sementara di memori aplikasi.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#f7f8f4' }, content: { padding: 20 }, kicker: { color: '#91a087', fontWeight: '700', letterSpacing: 1, fontSize: 9, marginTop: 24 }, title: { color: '#202d23', fontWeight: '800', fontSize: 27, marginTop: 7 }, subtitle: { color: '#7f897f', fontSize: 12, marginTop: 8, marginBottom: 22 }, card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 13, borderWidth: 1, borderColor: '#e8ebe5', borderRadius: 11, marginBottom: 10 }, icon: { width: 39, height: 39, borderRadius: 9, backgroundColor: '#edf3e9', alignItems: 'center', justifyContent: 'center', marginRight: 11 }, copy: { flex: 1, gap: 4 }, name: { color: '#253329', fontWeight: '700', fontSize: 12 }, detail: { color: '#858f85', fontSize: 10 }, status: { color: '#4f8052', fontSize: 9 }, more: { color: '#859085', fontSize: 20 }, empty: { backgroundColor: '#fff', borderRadius: 11, borderWidth: 1, borderColor: '#e8ebe5', alignItems: 'center', padding: 26 }, emptyIcon: { color: '#83a080', fontSize: 30, marginBottom: 8 }, note: { color: '#9aa198', fontSize: 9, textAlign: 'center', marginTop: 17 } });
