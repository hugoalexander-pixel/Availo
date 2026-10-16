import { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import BookingForm from "../../src/components/BookingForm";
import { Booking, BookingFormData } from "../../src/types/Booking";
import { getBookingById, updateBooking } from "../../src/services/BookingStorage";
import { Colors, FontSize, Spacing } from "../../src/constants/Theme";

export default function EditBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch {
        Alert.alert("Error", "Gagal memuat data booking.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleUpdate(data: BookingFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateBooking(id, data);
      Alert.alert("Berhasil", "Booking berhasil diperbarui.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Gagal memperbarui booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Booking" }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Booking" }} />
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Booking Tidak Ditemukan</Text>
          <Text style={styles.errorSubtitle}>
            Data booking yang Anda cari tidak tersedia.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Booking" }} />
      <BookingForm
        initialValues={{
          FacilityName: booking.FacilityName,
          Date: booking.Date,
          StartTime: booking.StartTime,
          EndTime: booking.EndTime,
          Purpose: booking.Purpose,
          Status: booking.Status,
        }}
        onSubmit={handleUpdate}
        submitLabel="Simpan Perubahan"
        isSubmitting={isSubmitting}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
