import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { apiClient, ApiError, NetworkError } from "../../src/services/ApiClient";
import { Reservation } from "../../src/types/Models";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/constants/Theme";
import LoadingView from "../../src/components/LoadingView";
import ErrorView from "../../src/components/ErrorView";

export default function EditReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [partySize, setPartySize] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReservation() {
      if (!id) return;
      setError(null);
      setLoading(true);
      try {
        const res = await apiClient.get<{ Data: Reservation }>(`/reservations/${id}`);
        const data = res.Data;
        setReservation(data);
        setPartySize(data.PartySize ? data.PartySize.toString() : "1");
        setPurpose(data.Purpose || "");
      } catch (err: any) {
        if (err instanceof NetworkError) {
          setError(err.message);
        } else {
          setError(err?.message || "Gagal memuat data reservasi.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadReservation();
  }, [id]);

  async function handleSave() {
    if (!id || !reservation) return;

    const sizeNum = Number(partySize);
    if (!partySize || isNaN(sizeNum) || sizeNum < 1) {
      Alert.alert("Validasi Gagal", "Jumlah peserta minimal 1 orang.");
      return;
    }

    if (!purpose.trim()) {
      Alert.alert("Validasi Gagal", "Tujuan penggunaan ruangan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/reservations/${id}`, {
        PartySize: sizeNum,
        Purpose: purpose.trim(),
      });

      Alert.alert("Berhasil", "Perubahan reservasi berhasil disimpan.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        Alert.alert("Gagal Memperbarui", err.message);
      } else if (err instanceof NetworkError) {
        Alert.alert("Koneksi Terputus", err.message);
      } else {
        Alert.alert("Error", "Gagal memperbarui reservasi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Memuat Data..." }} />
        <LoadingView message="Memuat reservasi..." />
      </>
    );
  }

  if (error || !reservation) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Reservasi" }} />
        <ErrorView
          message={error || "Reservasi tidak ditemukan."}
          onRetry={() => router.back()}
        />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "Ubah Reservasi",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <Text style={styles.facilityName}>{reservation.FacilityName}</Text>
          <Text style={styles.facilityBuilding}>
            📍 {reservation.BuildingName || "Kampus"}
          </Text>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleText}>
              📅 {reservation.Date} • 🕐 {reservation.StartTime} - {reservation.EndTime}
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Informasi yang Dapat Diubah</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Jumlah Peserta</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 5"
              placeholderTextColor={Colors.textTertiary}
              value={partySize}
              onChangeText={setPartySize}
              keyboardType="number-pad"
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tujuan Penggunaan</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tujuan peminjaman ruangan..."
              placeholderTextColor={Colors.textTertiary}
              value={purpose}
              onChangeText={setPurpose}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  facilityName: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  facilityBuilding: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scheduleRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scheduleText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
});
