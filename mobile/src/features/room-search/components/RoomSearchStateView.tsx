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
  state: { minHeight: 136, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  copy: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: { minHeight: 42, paddingHorizontal: 20, marginTop: 6, borderRadius: 10, backgroundColor: '#28583f', justifyContent: 'center' },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
