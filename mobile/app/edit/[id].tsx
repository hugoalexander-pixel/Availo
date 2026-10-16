import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Booking } from '../../src/types/Booking';
import { getBookingById } from '../../src/services/BookingStorage';
import { BookingForm } from '../../src/components/BookingForm';
import { usePrototypeStore } from '../../src/state/PrototypeStore';
import { getThemeColors } from '../../src/theme';

export default function EditBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);

  useEffect(() => {
    async function fetchBooking() {
      if (!id) return;
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } finally {
        setLoading(false);
      }
    }
    void fetchBooking();
  }, [id]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Kembali</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Booking</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.muted }]}>Memuat data booking...</Text>
          </View>
        ) : !booking ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: theme.text }]}>Data booking tidak ditemukan.</Text>
            <Pressable onPress={() => router.back()} style={styles.btn}>
              <Text style={styles.btnText}>Kembali</Text>
            </Pressable>
          </View>
        ) : (
          <BookingForm
            booking={booking}
            onSuccess={() => router.back()}
            onCancel={() => router.back()}
          />
        )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
  },
  btn: {
    backgroundColor: '#28583f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
