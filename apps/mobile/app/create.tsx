import { useState } from "react";
import { Alert } from "react-native";
import { Stack, router } from "expo-router";
import BookingForm from "../src/components/BookingForm";
import { BookingFormData } from "../src/types/Booking";
import { createBooking } from "../src/services/BookingStorage";

export default function CreateBookingScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(data: BookingFormData) {
    setIsSubmitting(true);
    try {
      await createBooking(data);
      Alert.alert("Berhasil", "Booking berhasil ditambahkan.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Gagal menambahkan booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "Tambah Booking" }} />
      <BookingForm
        onSubmit={handleCreate}
        submitLabel="Tambah Booking"
        isSubmitting={isSubmitting}
      />
    </>
  );
}
