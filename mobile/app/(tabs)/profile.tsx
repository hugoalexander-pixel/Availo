import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { getThemeColors } from '../../src/theme';
import { ProfileForm } from '../../src/features/profile/ProfileForm';
import { useProfileRepository } from '../../src/features/profile/profileRepository';
import { validateProfile } from '../../src/features/profile/validation';

const green = '#28583f';

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'M';
}

export default function ProfileScreen() {
  const { userProfile, isDark, toggleTheme } = usePrototypeStore();
  const repo = useProfileRepository();
  const theme = getThemeColors(isDark);

  const [editVisible, setEditVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const profileName = userProfile?.name ?? 'Mahasiswa';

  const handleSignOut = () => {
    Alert.alert('Keluar dari akun?', 'Kamu akan kembali ke halaman masuk.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => { repo.signOut(); router.replace('/'); } },
    ]);
  };

  const openEdit = () => {
    setDraftName(userProfile?.name ?? '');
    setNameError(null);
    setEditVisible(true);
  };

  const saveProfile = () => {
    const errors = validateProfile(draftName, userProfile?.email ?? '');
    if (errors.name) {
      setNameError(errors.name);
      return;
    }
    repo.updateProfile({ name: draftName.trim() });
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
        repo.updateProfile({ name: repo.getProfile()?.name ?? '', photoUri: result.assets[0].uri });
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

      <ProfileForm
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        name={draftName}
        onNameChange={(v) => { setDraftName(v); setNameError(null); }}
        email={userProfile?.email ?? 'Email belum tersedia'}
        isDark={isDark}
        onSave={saveProfile}
        error={nameError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  kicker: { color: '#91a087', fontWeight: '700', letterSpacing: 1, fontSize: 11, marginTop: 14 },
  title: { color: '#202d23', fontWeight: '800', fontSize: 26, marginTop: 6, marginBottom: 20, letterSpacing: -0.5 },
  card: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderWidth: 1, borderColor: '#e8ebe5', borderRadius: 16 },
  avatarButton: { width: 88, height: 88, marginBottom: 14 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#f5d8c0', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#edf3e9' },
  initials: { color: '#78553e', fontWeight: '700', fontSize: 24 },
  cameraBadge: { position: 'absolute', right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: green, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cameraIcon: { color: '#fff', fontSize: 16, lineHeight: 18, fontWeight: '600' },
  name: { color: '#253329', fontWeight: '700', fontSize: 17 },
  email: { color: green, fontSize: 13, marginTop: 4, fontWeight: '600' },
  detail: { color: '#858f85', fontSize: 12, marginTop: 4 },
  photoButton: { minHeight: 38, marginTop: 16, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#edf3e9', alignItems: 'center', justifyContent: 'center' },
  photoButtonText: { color: green, fontSize: 12, fontWeight: '700' },
  themeCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, marginTop: 16, borderWidth: 1, borderRadius: 12 },
  themeCopy: { flex: 1, gap: 4 },
  themeTitle: { fontSize: 14, fontWeight: '700' },
  themeDescription: { fontSize: 12 },
  editButton: { minHeight: 46, marginTop: 16, borderRadius: 10, backgroundColor: green, alignItems: 'center', justifyContent: 'center' },
  editText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  note: { color: '#8b958b', fontSize: 11, lineHeight: 17, marginTop: 14, textAlign: 'center' },
  logoutButton: { minHeight: 46, marginTop: 16, borderRadius: 10, borderWidth: 1.5, borderColor: '#e4c9c4', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#ad544a', fontSize: 14, fontWeight: '700' },
});
