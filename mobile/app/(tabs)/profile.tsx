import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.kicker}>AKUN</Text><Text style={styles.title}>Profil saya</Text>
        <View style={styles.card}><View style={styles.avatar}><Text style={styles.initials}>NA</Text></View><Text style={styles.name}>Nadia Aulia</Text><Text style={styles.detail}>Mahasiswa · Universitas Nusantara</Text></View>
        <Text style={styles.note}>Profil ini hanya data contoh untuk prototype. Login dan pengelolaan akun akan disambungkan ke backend.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#f7f8f4' }, content: { padding: 20 }, kicker: { color: '#91a087', fontWeight: '700', letterSpacing: 1, fontSize: 9, marginTop: 24 }, title: { color: '#202d23', fontWeight: '800', fontSize: 27, marginTop: 7, marginBottom: 22 }, card: { alignItems: 'center', backgroundColor: '#fff', padding: 26, borderWidth: 1, borderColor: '#e8ebe5', borderRadius: 11 }, avatar: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#f5d8c0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, initials: { color: '#78553e', fontWeight: '700', fontSize: 19 }, name: { color: '#253329', fontWeight: '700', fontSize: 14 }, detail: { color: '#858f85', fontSize: 11, marginTop: 5 }, note: { color: '#8b958b', fontSize: 10, lineHeight: 16, marginTop: 15, textAlign: 'center' } });
