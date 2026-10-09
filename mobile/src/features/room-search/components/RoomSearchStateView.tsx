import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';
import { getThemeColors } from '../../../theme';

type Props = {
  status: 'loading' | 'success' | 'empty' | 'error';
  error?: string | null;
  onRetry: () => void;
  isDark?: boolean;
  children: ReactNode;
};

export function RoomSearchStateView({ status, error, onRetry, isDark = false, children }: Props) {
  const theme = getThemeColors(isDark);
  if (status === 'success') return <>{children}</>;
  if (status === 'loading') return (
    <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel="Memuat ruang">
      <ActivityIndicator color={theme.primary} />
      <Text style={[styles.copy, { color: theme.muted }]}>Memuat daftar ruang...</Text>
    </View>
  );
  if (status === 'empty') return (
    <View style={styles.state}>
      <Text style={[styles.title, { color: theme.text }]}>Ruang tidak ditemukan</Text>
      <Text style={[styles.copy, { color: theme.muted }]}>Ubah kapasitas, tipe ruang, atau waktu pencarian.</Text>
    </View>
  );
  return (
    <View style={styles.state}>
      <Text style={[styles.title, { color: theme.text }]}>Pencarian gagal</Text>
      <Text style={[styles.copy, { color: theme.muted }]}>{error || 'Terjadi kesalahan. Coba lagi.'}</Text>
      <Pressable onPress={onRetry} style={styles.retry} accessibilityRole="button">
        <Text style={styles.retryText}>Coba lagi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  state: { minHeight: 128, alignItems: 'center', justifyContent: 'center', padding: 22, gap: 9, borderRadius: 10 },
  title: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  copy: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
  retry: { minHeight: 38, paddingHorizontal: 16, marginTop: 4, borderRadius: 7, backgroundColor: '#28583f', justifyContent: 'center' },
  retryText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
