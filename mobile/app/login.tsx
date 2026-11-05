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

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginDemo } = usePrototypeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const passwordInputRef = useRef<TextInputInstance>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email kampus wajib diisi');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Format email tidak valid');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Kata sandi wajib diisi');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      showToast('Mohon lengkapi email dan kata sandi.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        showToast('Login berhasil! Selamat datang.', 'success');
        router.replace('/(tabs)');
      } else {
        setEmailError(res.error || 'Login gagal.');
        showToast(res.error || 'Email kampus atau kata sandi tidak valid.', 'error');
      }
    }, 600);
  };

  const handleQuickDemo = () => {
    loginDemo();
    showToast('Masuk dengan Akun Demo (Nadia Aulia).', 'success');
    router.replace('/(tabs)');
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
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandIconBox}>
              <Text style={styles.brandIcon}>⌂</Text>
            </View>
            <Text style={styles.brandTitle}>
              Kelas<Text style={styles.brandTitleAccent}>Kosong</Text>
            </Text>
            <View style={styles.campusPill}>
              <Text style={styles.campusPillText}>UNIVERSITAS NUSANTARA</Text>
            </View>
          </View>

          {/* Title & Description */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Masuk ke Akun</Text>
            <Text style={styles.pageSubtitle}>
              Gunakan email resmi kampus untuk melakukan reservasi ruang kuliah, lab, dan diskusi.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <FormField
              label="Email Kampus"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (emailError) setEmailError('');
              }}
              placeholder="nama.mhs@student.nusantara.ac.id"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              error={emailError}
              required
              accessibilityLabel="Input Email Kampus"
              hint="Format: nama@student.nusantara.ac.id"
            />

            <FormField
              ref={passwordInputRef}
              label="Kata Sandi"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Masukkan kata sandi akun"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={passwordError}
              required
              accessibilityLabel="Input Kata Sandi"
            />

            <AppButton
              label="Masuk ke Akun  →"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
              accessibilityLabel="Tombol Masuk ke Akun"
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU PENGUJIAN</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Demo Login */}
            <AppButton
              label="⚡ Masuk Cepat (Akun Demo Mahasiswa)"
              onPress={handleQuickDemo}
              variant="outline"
              style={styles.demoBtn}
              accessibilityLabel="Masuk Cepat menggunakan Akun Demo Mahasiswa Nadia Aulia"
            />
          </View>

          {/* Footer Link to Signup */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Belum memiliki akun mahasiswa?</Text>
            <Pressable
              onPress={() => router.push('/signup')}
              style={styles.signupLinkPressable}
              accessibilityRole="link"
              accessibilityLabel="Daftar akun mahasiswa baru"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.signupLinkText}>Daftar Sekarang →</Text>
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
    paddingVertical: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 460,
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
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 22,
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
    marginBottom: 20,
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
  loginBtn: {
    marginTop: 6,
    minHeight: 48,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e3eae0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#718574',
    letterSpacing: 0.6,
  },
  demoBtn: {
    minHeight: 46,
    borderColor: '#386343',
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
  signupLinkPressable: {
    minHeight: 32,
    justifyContent: 'center',
  },
  signupLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: brandGreen,
  },
});
