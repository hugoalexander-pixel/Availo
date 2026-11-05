import React, { useState, useRef } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  type TextInputInstance,
  View,
} from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { FormField } from '../../src/components/FormField';
import { AppButton } from '../../src/components/AppButton';
import { Toast } from '../../src/components/Toast';
import { useResponsive } from '../../src/hooks/useResponsive';
import { usePrototypeStore } from '../../src/state/PrototypeStore';

export default function ProfileScreen() {
  const { isMediumLarge } = useResponsive();
  const { user, updateProfile, logout } = usePrototypeStore();

  const [name, setName] = useState(user?.name || 'Nadia Aulia');
  const [nim, setNim] = useState(user?.nim || '2024010192');
  const email = user?.email || 'nadia.aulia@student.nusantara.ac.id';
  const prodi = user?.prodi || 'Sistem Informasi';

  const [nameError, setNameError] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const nimInputRef = useRef<TextInputInstance>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      setNameError('Nama lengkap wajib diisi');
      showToast('Nama lengkap tidak boleh kosong.', 'error');
      return;
    }
    setNameError('');

    setLoadingSave(true);
    setTimeout(() => {
      updateProfile({ name: name.trim(), nim: nim.trim() });
      setLoadingSave(false);
      showToast('Profil mahasiswa berhasil diperbarui.', 'success');
    }, 500);
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar dari Akun',
      'Apakah kamu yakin ingin keluar dari akun ini? Sesi login akan berakhir dan kamu harus masuk kembali.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer key={user?.email || 'guest'}>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.kicker}>AKUN PENGGUNA</Text>
          <Text style={styles.title}>Profil saya</Text>
          <Text style={styles.subtitle}>
            Informasi identitas mahasiswa untuk reservasi dan izin akses ruang kampus.
          </Text>
        </View>

        <View
          style={[styles.profileCard, isMediumLarge && styles.profileCardWide]}
          accessibilityRole="summary"
          accessibilityLabel={`Profil pengguna ${name}, Mahasiswa ${prodi}, Universitas Nusantara`}
        >
          <View style={styles.avatar} accessible={false}>
            <Text style={styles.initials}>NA</Text>
          </View>
          <View style={styles.profileTextInfo}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileRole}>Mahasiswa Aktif</Text>
            <Text style={styles.profileCampus}>Universitas Nusantara · {prodi}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>Ubah Data Pengguna</Text>

          <FormField
            label="Nama Lengkap"
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (nameError) setNameError('');
            }}
            placeholder="Masukkan nama lengkap"
            returnKeyType="next"
            onSubmitEditing={() => nimInputRef.current?.focus()}
            error={nameError}
            required
            accessibilityLabel="Input Nama Lengkap"
          />

          <FormField
            ref={nimInputRef}
            label="Nomor Induk Mahasiswa (NIM)"
            value={nim}
            onChangeText={setNim}
            placeholder="Contoh: 2024010192"
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleSaveProfile}
            required
            accessibilityLabel="Input Nomor Induk Mahasiswa"
          />

          <FormField
            label="Email Kampus"
            value={email}
            editable={false}
            locked={true}
            hint="Email resmi kampus terhubung SSO universitas & tidak dapat diubah"
            accessibilityLabel="Email Kampus terhubung SSO universitas dan tidak dapat diubah"
          />

          <AppButton
            label="Simpan Perubahan Profil"
            onPress={handleSaveProfile}
            loading={loadingSave}
            style={styles.saveButton}
            accessibilityLabel="Tombol Simpan Perubahan Profil"
          />

          <AppButton
            label="Keluar dari Akun"
            onPress={handleLogout}
            variant="destructive"
            style={styles.logoutButton}
            accessibilityLabel="Tombol Keluar dari Akun"
            accessibilityHint="Membuka konfirmasi untuk keluar dari sesi akun"
          />
        </View>

        <View style={styles.infoBox} accessible={false}>
          <Text style={styles.infoBoxIcon}>ℹ</Text>
          <Text style={styles.note}>
            Data profil saat ini disimulasikan secara lokal pada prototype dan siap dihubungkan ke backend autentikasi kampus.
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
    paddingBottom: 36,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e7df',
    borderRadius: 14,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
  },
  profileCardWide: {
    padding: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3eee2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#bcd6bc',
  },
  initials: {
    color: '#204d35',
    fontWeight: '800',
    fontSize: 20,
  },
  profileTextInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: '#1a271e',
    fontWeight: '700',
    fontSize: 18,
  },
  profileRole: {
    color: '#257038',
    fontSize: 13,
    fontWeight: '600',
  },
  profileCampus: {
    color: '#425345',
    fontSize: 13,
    marginTop: 2,
  },
  formSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e7df',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a271e',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    width: '100%',
  },
  logoutButton: {
    marginTop: 12,
    width: '100%',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef3eb',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  infoBoxIcon: {
    color: '#204d35',
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    color: '#4b5e4d',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
