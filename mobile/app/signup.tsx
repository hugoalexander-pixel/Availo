import React, { useState, useRef } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  type TextInputInstance,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { FormField } from '../src/components/FormField';
import { AppButton } from '../src/components/AppButton';
import { Toast } from '../src/components/Toast';
import { usePrototypeStore } from '../src/state/PrototypeStore';

const brandGreen = '#204d35';
const brandAccent = '#386343';
const textPrimary = '#192820';

export default function SignupScreen() {
  const router = useRouter();
  const { register } = usePrototypeStore();

  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('Sistem Informasi');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [nimError, setNimError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const nimInputRef = useRef<TextInputInstance>(null);
  const prodiInputRef = useRef<TextInputInstance>(null);
  const emailInputRef = useRef<TextInputInstance>(null);
  const passwordInputRef = useRef<TextInputInstance>(null);
  const confirmPasswordInputRef = useRef<TextInputInstance>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    let hasError = false;

    if (!name.trim()) {
      setNameError('Nama lengkap wajib diisi');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!nim.trim()) {
      setNimError('NIM mahasiswa wajib diisi');
      hasError = true;
    } else if (nim.trim().length < 6) {
      setNimError('NIM minimal 6 digit angka');
      hasError = true;
    } else {
      setNimError('');
    }

    if (!email.trim()) {
      setEmailError('Email kampus wajib diisi');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Format email kampus tidak valid');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Kata sandi wajib diisi');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Kata sandi minimal 6 karakter');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Konfirmasi kata sandi tidak cocok');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) {
      showToast('Periksa kembali formulir pendaftaran Anda.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      const res = await register({
        name: name.trim(),
        nim: nim.trim(),
        prodi: prodi.trim() || 'Sistem Informasi',
        email: email.trim().toLowerCase(),
        password,
      });
      setLoading(false);

      if (res.success) {
        showToast('Pendaftaran berhasil! Selamat datang di Availo.', 'success');
        router.replace('/(tabs)');
      } else {
        showToast(res.error || 'Pendaftaran gagal.', 'error');
      }
    }, 650);
  };

  return (
    <ScreenContainer>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <View style={styles.centerWrapper}>
        <View style={styles.cardContainer}>
          {/* Back button */}
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke halaman login"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backBtnText}>← Kembali ke Login</Text>
          </Pressable>

          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandIconBox}>
              <Text style={styles.brandIcon}>⌂</Text>
            </View>
            <Text style={styles.brandTitle}>
              Kelas<Text style={styles.brandTitleAccent}>Kosong</Text>
            </Text>
            <View style={styles.campusPill}>
              <Text style={styles.campusPillText}>PENDAFTARAN MAHASISWA</Text>
            </View>
          </View>

          {/* Title & Description */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Buat Akun Baru</Text>
            <Text style={styles.pageSubtitle}>
              Lengkapi identitas mahasiswa untuk mengaktifkan akses peminjaman fasilitas kampus.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <FormField
              label="Nama Lengkap"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (nameError) setNameError('');
              }}
              placeholder="Contoh: Budi Santoso"
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
              onChangeText={(val) => {
                setNim(val);
                if (nimError) setNimError('');
              }}
              placeholder="Contoh: 2024010192"
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => prodiInputRef.current?.focus()}
              error={nimError}
              required
              accessibilityLabel="Input Nomor Induk Mahasiswa"
            />

            <FormField
              ref={prodiInputRef}
              label="Program Studi"
              value={prodi}
              onChangeText={setProdi}
              placeholder="Contoh: Sistem Informasi / Teknik Informatika"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              required
              accessibilityLabel="Input Program Studi"
            />

            <FormField
              ref={emailInputRef}
              label="Email Resmi Kampus"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (emailError) setEmailError('');
              }}
              placeholder="nama@student.nusantara.ac.id"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              error={emailError}
              required
              accessibilityLabel="Input Email Resmi Kampus"
              hint="Email ini nantinya akan terkunci sebagai identitas resmi akun"
            />

            <FormField
              ref={passwordInputRef}
              label="Kata Sandi"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Minimal 6 karakter"
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              error={passwordError}
              required
              accessibilityLabel="Input Kata Sandi"
            />

            <FormField
              ref={confirmPasswordInputRef}
              label="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              placeholder="Ulangi kata sandi"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={confirmPasswordError}
              required
              accessibilityLabel="Input Konfirmasi Kata Sandi"
            />

            <AppButton
              label="Daftar Akun Mahasiswa  →"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerBtn}
              accessibilityLabel="Tombol Daftar Akun Mahasiswa"
            />
          </View>

          {/* Footer Link to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Sudah memiliki akun?</Text>
            <Pressable
              onPress={() => router.replace('/login')}
              style={styles.loginLinkPressable}
              accessibilityRole="link"
              accessibilityLabel="Kembali ke halaman masuk"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.loginLinkText}>Masuk Sekarang →</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e9de',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  backBtn: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3d5241',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIcon: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: textPrimary,
    letterSpacing: -0.4,
  },
  brandTitleAccent: {
    color: brandAccent,
    fontWeight: '400',
  },
  campusPill: {
    marginTop: 6,
    backgroundColor: '#eef4ec',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  campusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: brandGreen,
    letterSpacing: 0.8,
  },
  titleSection: {
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: textPrimary,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#4f6152',
    marginTop: 4,
    lineHeight: 18,
  },
  formContainer: {
    width: '100%',
  },
  registerBtn: {
    marginTop: 10,
    minHeight: 48,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 22,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#edf3ea',
    paddingTop: 16,
  },
  footerPrompt: {
    fontSize: 13,
    color: '#556658',
  },
  loginLinkPressable: {
    minHeight: 32,
    justifyContent: 'center',
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: brandGreen,
  },
});
