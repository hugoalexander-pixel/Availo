import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePrototypeStore } from '../src/state/PrototypeStore';
import { getThemeColors } from '../src/theme';

const green = '#28583f';
type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { signIn, signUp, isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  const isSignup = mode === 'signup';

  const enterApp = () => router.replace('/(tabs)');

  const submit = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (isSignup && name.trim().length < 2) {
      Alert.alert('Nama belum lengkap', 'Masukkan nama minimal 2 karakter.');
      return;
    }
    if (!/^[^\s@]+@student\.pradita\.ac\.id$/i.test(normalizedEmail)) {
      Alert.alert('Gunakan email mahasiswa Pradita', 'Format email harus nama@student.pradita.ac.id.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Kata sandi terlalu pendek', 'Gunakan minimal 8 karakter.');
      return;
    }
    if (isSignup && password !== confirmPassword) {
      Alert.alert('Kata sandi tidak sama', 'Pastikan konfirmasi kata sandi sama.');
      return;
    }

    if (isSignup) signUp(name.trim(), normalizedEmail);
    else signIn(normalizedEmail);
    enterApp();
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandGlyph}>K</Text></View>
            <Text style={[styles.brand, { color: theme.text }]}>Kelas<Text style={styles.brandLight}>Kosong</Text></Text>
          </View>

          <View style={styles.heroArt}>
            <View style={styles.sun} />
            <View style={styles.window}><View style={styles.windowLine} /></View>
            <View style={styles.desk} />
            <View style={styles.deskLegLeft} />
            <View style={styles.deskLegRight} />
            <Text style={styles.plant}>✳</Text>
          </View>

          <Text style={[styles.eyebrow, { color: theme.subtle }]}>RUANG KAMPUS, JADI LEBIH DEKAT</Text>
          <Text style={[styles.title, { color: theme.text }]}>{isSignup ? 'Buat akunmu.' : 'Selamat datang\nkembali.'}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {isSignup
              ? 'Daftar untuk menemukan ruang yang pas untuk belajar dan berkolaborasi.'
              : 'Masuk untuk melanjutkan pencarian ruang kampus favoritmu.'}
          </Text>

          <View style={[styles.modeSwitch, { backgroundColor: theme.surfaceSecondary }]}>
            <Pressable onPress={() => switchMode('login')} style={[styles.modeButton, !isSignup && styles.modeActive, !isSignup && { backgroundColor: theme.surface }]}>
              <Text style={[styles.modeText, { color: theme.muted }, !isSignup && styles.modeTextActive, !isSignup && { color: theme.primary }]}>Masuk</Text>
            </Pressable>
            <Pressable onPress={() => switchMode('signup')} style={[styles.modeButton, isSignup && styles.modeActive, isSignup && { backgroundColor: theme.surface }]}>
              <Text style={[styles.modeText, { color: theme.muted }, isSignup && styles.modeTextActive, isSignup && { color: theme.primary }]}>Daftar</Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            {isSignup && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.subtle }]}>NAMA LENGKAP</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Contoh: Nadia Aulia"
                  placeholderTextColor="#a2aaa1"
                  style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            )}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.subtle }]}>EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="nama@student.pradita.ac.id"
                placeholderTextColor="#a2aaa1"
                style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.subtle }]}>KATA SANDI</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor="#a2aaa1"
                  style={[styles.passwordInput, { color: theme.text }]}
                  secureTextEntry={!passwordVisible}
                  textContentType={isSignup ? 'newPassword' : 'password'}
                  autoCapitalize="none"
                  returnKeyType={isSignup ? 'next' : 'done'}
                  onSubmitEditing={isSignup ? undefined : submit}
                />
                <Pressable onPress={() => setPasswordVisible((visible) => !visible)} accessibilityRole="button">
                  <Text style={styles.showPassword}>{passwordVisible ? 'Sembunyikan' : 'Lihat'}</Text>
                </Pressable>
              </View>
            </View>
            {isSignup && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.subtle }]}>ULANGI KATA SANDI</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Masukkan ulang kata sandi"
                  placeholderTextColor="#a2aaa1"
                  style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                  secureTextEntry={!passwordVisible}
                  textContentType="newPassword"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                />
              </View>
            )}

            {!isSignup && (
              <Pressable onPress={() => Alert.alert('Lupa kata sandi', 'Fitur ini tersedia setelah akun terhubung ke backend.')}>
                <Text style={[styles.forgot, { color: theme.primary }]}>Lupa kata sandi?</Text>
              </Pressable>
            )}

            <Pressable style={[styles.submit, { backgroundColor: theme.button }]} onPress={submit}>
              <Text style={styles.submitText}>{isSignup ? 'Buat akun' : 'Masuk ke aplikasi'}  →</Text>
            </Pressable>
          </View>

          <View style={[styles.demoNote, { backgroundColor: theme.primarySoft }]}>
            <Text style={styles.demoIcon}>i</Text>
            <Text style={[styles.demoText, { color: theme.muted }]}>Mode prototype: formulir ini belum terhubung ke server akun.</Text>
          </View>
          <Text style={[styles.terms, { color: theme.subtle }]}>Dengan melanjutkan, kamu menyetujui aturan penggunaan ruang kampus.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 25, paddingTop: 17, paddingBottom: 28 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: green, alignItems: 'center', justifyContent: 'center' },
  brandGlyph: { color: '#fff', fontSize: 20, fontWeight: '800' },
  brand: { color: '#192820', fontSize: 19, fontWeight: '800', letterSpacing: -0.6 },
  brandLight: { color: '#789178', fontWeight: '500' },
  heroArt: { height: 112, marginTop: 21, marginBottom: 20, borderRadius: 18, overflow: 'hidden', backgroundColor: '#eaf0e5', alignItems: 'center', justifyContent: 'flex-end' },
  sun: { position: 'absolute', top: 15, right: '25%', width: 35, height: 35, borderRadius: 18, backgroundColor: '#f1d6a9' },
  window: { position: 'absolute', top: 20, width: 94, height: 49, borderWidth: 5, borderColor: '#80957c', backgroundColor: '#f8f5e9', alignItems: 'center' },
  windowLine: { width: 4, height: 47, backgroundColor: '#bdcbb7' },
  desk: { width: 145, height: 12, borderRadius: 6, backgroundColor: '#ab805b', marginBottom: 28 },
  deskLegLeft: { position: 'absolute', bottom: 7, left: '37%', width: 6, height: 26, backgroundColor: '#96704f' },
  deskLegRight: { position: 'absolute', bottom: 7, right: '37%', width: 6, height: 26, backgroundColor: '#96704f' },
  plant: { position: 'absolute', right: 22, bottom: 11, color: '#567a5a', fontSize: 27 },
  eyebrow: { color: '#758a72', fontSize: 11, letterSpacing: 1.1, fontWeight: '700' },
  title: { marginTop: 8, color: '#192820', fontSize: 28, lineHeight: 34, letterSpacing: -0.8, fontWeight: '800' },
  subtitle: { marginTop: 6, color: '#7f897f', fontSize: 13, lineHeight: 19, maxWidth: 330 },
  modeSwitch: { flexDirection: 'row', marginTop: 18, padding: 4, borderRadius: 10, backgroundColor: '#e9ede6' },
  modeButton: { flex: 1, minHeight: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: '#fff', shadowColor: '#1b2b1d', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  modeText: { color: '#7f897f', fontSize: 13, fontWeight: '600' },
  modeTextActive: { color: green, fontWeight: '700' },
  form: { gap: 14, marginTop: 18 },
  field: { gap: 6 },
  label: { color: '#7d897c', fontSize: 11, letterSpacing: 0.7, fontWeight: '700', textTransform: 'uppercase' },
  input: { minHeight: 48, borderWidth: 1.5, borderColor: '#e4e9e0', borderRadius: 10, paddingHorizontal: 14, color: '#26342a', backgroundColor: '#fff', fontSize: 14 },
  passwordRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e4e9e0', borderRadius: 10, paddingHorizontal: 14, backgroundColor: '#fff' },
  passwordInput: { flex: 1, paddingVertical: 12, color: '#26342a', fontSize: 14 },
  showPassword: { color: green, fontSize: 12, fontWeight: '700', paddingVertical: 10, paddingLeft: 8 },
  forgot: { alignSelf: 'flex-end', color: green, fontSize: 12, fontWeight: '700', marginTop: -2 },
  submit: { minHeight: 48, marginTop: 4, borderRadius: 10, backgroundColor: green, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  demoNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: '#edf3e9' },
  demoIcon: { width: 18, height: 18, borderRadius: 9, textAlign: 'center', overflow: 'hidden', backgroundColor: '#dbe8d7', color: green, fontWeight: '800', fontSize: 12 },
  demoText: { flex: 1, color: '#657761', fontSize: 11, lineHeight: 16 },
  terms: { marginTop: 14, color: '#9aa198', fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
