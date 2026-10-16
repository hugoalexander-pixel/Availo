import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookingForm } from '../src/components/BookingForm';
import { usePrototypeStore } from '../src/state/PrototypeStore';
import { getThemeColors } from '../src/theme';

export default function CreateBookingScreen() {
  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Kembali</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Tambah Booking</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <BookingForm
          onSuccess={() => router.back()}
          onCancel={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
