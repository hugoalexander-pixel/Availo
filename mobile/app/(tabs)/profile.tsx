import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { getThemeColors } from '../../src/theme';

const green = '#28583f';

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'M';
}

export default function ProfileScreen() {
  const { userProfile, signOut, updateProfile, isDark, toggleTheme } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  const [editVisible, setEditVisible] = useState(false);
  const [draftName, setDraftName] = useState(userProfile?.name ?? '');
  const profileName = userProfile?.name ?? 'Mahasiswa';

  const handleSignOut = () => {
    Alert.alert('Keluar dari akun?', 'Kamu akan kembali ke halaman masuk.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => { signOut(); router.replace('/'); } },
    ]);
  };

  const openEdit = () => {
    setDraftName(userProfile?.name ?? '');
    setEditVisible(true);
  };

  const saveProfile = () => {
    const name = draftName.trim();
    if (name.length < 2) {
      Alert.alert('Nama belum lengkap', 'Masukkan nama minimal 2 karakter.');
      return;
    }
    updateProfile({ name });
    setEditVisible(false);
  };

  const choosePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin galeri diperlukan', 'Izinkan akses foto agar kamu bisa memilih foto profil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        updateProfile({ photoUri: result.assets[0].uri });
      }
    } catch {
      Alert.alert('Foto tidak dapat dibuka', 'Coba pilih foto lain dari galeri.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.kicker, { color: theme.subtle }]}>AKUN</Text>
        <Text style={[styles.title, { color: theme.text }]}>Profil saya</Text>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable style={styles.avatarButton} onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Ubah foto profil">
            {userProfile?.photoUri
              ? <Image source={{ uri: userProfile.photoUri }} style={styles.avatarImage} />
              : <View style={styles.avatar}><Text style={styles.initials}>{getInitials(profileName)}</Text></View>}
            <View style={styles.cameraBadge}><Text style={styles.cameraIcon}>+</Text></View>
          </Pressable>
          <Text style={[styles.name, { color: theme.text }]}>{profileName}</Text>
          <Text style={[styles.email, { color: theme.primary }]}>{userProfile?.email ?? 'Email belum tersedia'}</Text>
          <Text style={[styles.detail, { color: theme.muted }]}>Mahasiswa · Universitas Pradita</Text>
          <Pressable style={[styles.photoButton, { backgroundColor: theme.primarySoft }]} onPress={choosePhoto}>
            <Text style={[styles.photoButtonText, { color: theme.primary }]}>{userProfile?.photoUri ? 'Ganti foto profil' : 'Tambah foto profil'}</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.editButton, { backgroundColor: theme.button }]} onPress={openEdit}>
          <Text style={styles.editText}>Edit profil</Text>
        </Pressable>
        <View style={[styles.themeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.themeCopy}>
            <Text style={[styles.themeTitle, { color: theme.text }]}>Tampilan gelap</Text>
            <Text style={[styles.themeDescription, { color: theme.muted }]}>{isDark ? 'Tema gelap aktif' : 'Tema terang aktif'}</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#dce5d9', true: '#668c6a' }} thumbColor={isDark ? '#eaf4e8' : '#fff'} accessibilityLabel="Aktifkan tema gelap" />
        </View>
        <Text style={[styles.note, { color: theme.subtle }]}>Tema dan profil tersimpan selama sesi prototype ini.</Text>
        <Pressable style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleSignOut}>
          <Text style={[styles.logoutText, { color: theme.danger }]}>Keluar</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit profil</Text>
            <Text style={[styles.modalSubtitle, { color: theme.muted }]}>Perbarui nama kamu. Email kampus terikat ke akun dan tidak bisa diubah di sini.</Text>

            <Text style={[styles.label, { color: theme.subtle }]}>NAMA LENGKAP</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Nama lengkap"
              placeholderTextColor="#a2aaa1"
              style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Text style={styles.label}>EMAIL MAHASISWA · BACA SAJA</Text>
            <View style={[styles.input, styles.readOnlyInput, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <Text style={[styles.readOnlyText, { color: theme.muted }]}>{userProfile?.email ?? 'Email belum tersedia'}</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.cancelButton, { backgroundColor: theme.surfaceSecondary }]} onPress={() => setEditVisible(false)}>
                <Text style={[styles.cancelText, { color: theme.muted }]}>Batal</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveText}>Simpan perubahan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  kicker: { color: '#91a087', fontWeight: '700', letterSpacing: 1, fontSize: 9, marginTop: 24 },
  title: { color: '#202d23', fontWeight: '800', fontSize: 27, marginTop: 7, marginBottom: 22 },
  card: { alignItems: 'center', backgroundColor: '#fff', padding: 25, borderWidth: 1, borderColor: '#e8ebe5', borderRadius: 11 },
  avatarButton: { width: 82, height: 82, marginBottom: 12 },
  avatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#f5d8c0', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#edf3e9' },
  initials: { color: '#78553e', fontWeight: '700', fontSize: 22 },
  cameraBadge: { position: 'absolute', right: -1, bottom: -1, width: 25, height: 25, borderRadius: 13, backgroundColor: green, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cameraIcon: { color: '#fff', fontSize: 18, lineHeight: 20, fontWeight: '500' },
  name: { color: '#253329', fontWeight: '700', fontSize: 15 },
  email: { color: green, fontSize: 11, marginTop: 5 },
  detail: { color: '#858f85', fontSize: 11, marginTop: 5 },
  photoButton: { minHeight: 35, marginTop: 16, paddingHorizontal: 14, borderRadius: 7, backgroundColor: '#edf3e9', alignItems: 'center', justifyContent: 'center' },
  photoButtonText: { color: green, fontSize: 10, fontWeight: '700' },
  themeCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, marginTop: 15, borderWidth: 1, borderRadius: 9 },
  themeCopy: { flex: 1, gap: 4 },
  themeTitle: { fontSize: 12, fontWeight: '700' },
  themeDescription: { fontSize: 10 },
  editButton: { minHeight: 45, marginTop: 15, borderRadius: 8, backgroundColor: green, alignItems: 'center', justifyContent: 'center' },
  editText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  note: { color: '#8b958b', fontSize: 10, lineHeight: 16, marginTop: 13, textAlign: 'center' },
  logoutButton: { minHeight: 44, marginTop: 18, borderRadius: 8, borderWidth: 1, borderColor: '#e4c9c4', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#ad544a', fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#13201988' },
  modalCard: { width: '100%', maxWidth: 400, padding: 22, borderRadius: 14 },
  modalTitle: { color: '#253329', fontSize: 20, fontWeight: '700' },
  modalSubtitle: { color: '#858f85', fontSize: 11, lineHeight: 16, marginTop: 5, marginBottom: 18 },
  label: { color: '#7d897c', fontSize: 9, letterSpacing: 0.8, fontWeight: '700', marginBottom: 6 },
  input: { minHeight: 45, borderWidth: 1, borderColor: '#e4e9e0', borderRadius: 8, paddingHorizontal: 12, color: '#26342a', backgroundColor: '#fff', fontSize: 12, marginBottom: 14 },
  readOnlyInput: { justifyContent: 'center', backgroundColor: '#f3f5f1' },
  readOnlyText: { color: '#7d897c', fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 9, marginTop: 2 },
  cancelButton: { flex: 1, minHeight: 43, borderRadius: 8, backgroundColor: '#f1f3ef', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#647064', fontSize: 11, fontWeight: '700' },
  saveButton: { flex: 1.4, minHeight: 43, borderRadius: 8, backgroundColor: green, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
