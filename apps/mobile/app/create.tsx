import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { apiClient, ApiError, NetworkError } from "../src/services/ApiClient";
import { Facility, Reservation } from "../src/types/Models";
import { takePhotoWithCamera, pickPhotoFromGallery } from "../src/services/CameraService";
import { scheduleReservationReminder } from "../src/services/NotificationService";
import { saveReservationPhoto } from "../src/services/ReservationPhotoStorage";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/constants/Theme";
import LoadingView from "../src/components/LoadingView";

interface FormErrors {
  FacilityId?: string;
  Date?: string;
  StartTime?: string;
  EndTime?: string;
  PartySize?: string;
  Purpose?: string;
  general?: string;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CreateReservationScreen() {
  const params = useLocalSearchParams<{ facilityId?: string; facilityName?: string }>();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);

  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(
    params.facilityId ? Number(params.facilityId) : null
  );
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [partySize, setPartySize] = useState("4");
  const [purpose, setPurpose] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [showFacilityPicker, setShowFacilityPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    async function fetchFacilities() {
      try {
        const res = await apiClient.get<{ Data: Facility[] }>("/facilities");
        setFacilities(res.Data || []);
        if (!selectedFacilityId && res.Data && res.Data.length > 0) {
          setSelectedFacilityId(res.Data[0].Id);
        }
      } catch (e) {
        console.warn("Gagal memuat fasilitas untuk form:", e);
      } finally {
        setLoadingFacilities(false);
      }
    }
    fetchFacilities();
  }, []);

  const selectedFacility = facilities.find((f) => f.Id === selectedFacilityId);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!selectedFacilityId) {
      newErrors.FacilityId = "Pilih ruangan fasilitas terlebih dahulu.";
    }

    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      newErrors.Date = "Format tanggal harus YYYY-MM-DD (contoh: 2026-11-01)";
    }

    if (!startTime.trim() || !/^\d{2}:\d{2}$/.test(startTime.trim())) {
      newErrors.StartTime = "Format jam: HH:MM (contoh: 09:00)";
    }

    if (!endTime.trim() || !/^\d{2}:\d{2}$/.test(endTime.trim())) {
      newErrors.EndTime = "Format jam: HH:MM (contoh: 11:00)";
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.EndTime = "Jam selesai harus setelah jam mulai.";
    }

    const sizeNum = Number(partySize);
    if (!partySize || isNaN(sizeNum) || sizeNum < 1) {
      newErrors.PartySize = "Jumlah peserta minimal 1 orang.";
    } else if (selectedFacility && sizeNum > selectedFacility.Capacity) {
      newErrors.PartySize = `Maksimal kapasitas ruangan adalah ${selectedFacility.Capacity} orang.`;
    }

    if (!purpose.trim()) {
      newErrors.Purpose = "Tujuan reservasi wajib diisi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handlePickPhoto() {
    Alert.alert(
      "Dokumentasi Kondisi Ruangan 📸",
      "Pilih sumber foto kondisi awal ruangan:",
      [
        {
          text: "Buka Kamera",
          onPress: async () => {
            const res = await takePhotoWithCamera();
            if (!res.cancelled && res.uri) {
              setPhotoUri(res.uri);
            }
          },
        },
        {
          text: "Pilih dari Galeri",
          onPress: async () => {
            const res = await pickPhotoFromGallery();
            if (!res.cancelled && res.uri) {
              setPhotoUri(res.uri);
            }
          },
        },
        { text: "Batal", style: "cancel" },
      ]
    );
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        FacilityId: selectedFacilityId,
        Date: date.trim(),
        StartTime: `${startTime.trim()}:00`,
        EndTime: `${endTime.trim()}:00`,
        PartySize: Number(partySize),
        Purpose: purpose.trim(),
      };

      const res = await apiClient.post<{ Data: Reservation; Message: string }>(
        "/reservations",
        payload
      );

      const createdReservation = res.Data;

      // 1. Simpan foto lokal perangkat jika ada
      if (photoUri && createdReservation?.Id) {
        await saveReservationPhoto(createdReservation.Id, photoUri);
      }

      // 2. Jadwalkan notifikasi lokal
      await scheduleReservationReminder({
        facilityName: selectedFacility?.Name || "Ruangan Kampus",
        date: date.trim(),
        startTime: startTime.trim(),
      });

      Alert.alert(
        "Reservasi Berhasil! 🎉",
        `Ruangan ${selectedFacility?.Name} telah direservasi untuk ${date.trim()} jam ${startTime.trim()}.\n\nPengingat notifikasi telah dijadwalkan di perangkat Anda.`,
        [{ text: "Lihat Booking Saya", onPress: () => router.replace("/") }]
      );
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrors({ general: err.message });
      } else if (err instanceof NetworkError) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "Gagal membuat reservasi. Periksa koneksi ke server." });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingFacilities) {
    return <LoadingView message="Memuat daftar ruangan..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "Reservasi Ruangan",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {errors.general && (
          <View style={styles.generalErrorBox}>
            <Text style={styles.generalErrorText}>⚠️ {errors.general}</Text>
          </View>
        )}

        {/* Pemilihan Ruangan / Fasilitas */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Pilih Fasilitas / Ruangan *</Text>
          <TouchableOpacity
            style={[styles.inputButton, errors.FacilityId && styles.inputError]}
            onPress={() => setShowFacilityPicker(!showFacilityPicker)}
          >
            <Text style={[styles.inputText, !selectedFacility && styles.placeholderText]}>
              {selectedFacility
                ? `${selectedFacility.Name} (${selectedFacility.Building?.Name} • Kap. ${selectedFacility.Capacity})`
                : "Pilih fasilitas ruangan..."}
            </Text>
            <Text style={styles.chevron}>{showFacilityPicker ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {showFacilityPicker && (
            <View style={styles.pickerDropdown}>
              {facilities.map((f) => (
                <TouchableOpacity
                  key={f.Id}
                  style={[
                    styles.pickerOption,
                    selectedFacilityId === f.Id && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedFacilityId(f.Id);
                    setShowFacilityPicker(false);
                    if (errors.FacilityId) setErrors((p) => ({ ...p, FacilityId: undefined }));
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      selectedFacilityId === f.Id && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {f.Name} — {f.Building?.Name} (Kapasitas: {f.Capacity} org)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.FacilityId && <Text style={styles.errorText}>{errors.FacilityId}</Text>}
        </View>

        {/* Tanggal Reservasi */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tanggal Reservasi (YYYY-MM-DD) *</Text>
          <TextInput
            style={[styles.textInput, errors.Date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textTertiary}
            value={date}
            onChangeText={(v) => {
              setDate(v);
              if (errors.Date) setErrors((p) => ({ ...p, Date: undefined }));
            }}
            keyboardType="numbers-and-punctuation"
          />
          {errors.Date && <Text style={styles.errorText}>{errors.Date}</Text>}
        </View>

        {/* Waktu Mulai & Waktu Selesai */}
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.label}>Jam Mulai *</Text>
            <TextInput
              style={[styles.textInput, errors.StartTime && styles.inputError]}
              placeholder="09:00"
              placeholderTextColor={Colors.textTertiary}
              value={startTime}
              onChangeText={(v) => {
                setStartTime(v);
                if (errors.StartTime) setErrors((p) => ({ ...p, StartTime: undefined }));
              }}
              keyboardType="numbers-and-punctuation"
            />
            {errors.StartTime && <Text style={styles.errorText}>{errors.StartTime}</Text>}
          </View>
          <View style={styles.timeSeparator}>
            <Text style={styles.timeSeparatorText}>—</Text>
          </View>
          <View style={styles.timeField}>
            <Text style={styles.label}>Jam Selesai *</Text>
            <TextInput
              style={[styles.textInput, errors.EndTime && styles.inputError]}
              placeholder="11:00"
              placeholderTextColor={Colors.textTertiary}
              value={endTime}
              onChangeText={(v) => {
                setEndTime(v);
                if (errors.EndTime) setErrors((p) => ({ ...p, EndTime: undefined }));
              }}
              keyboardType="numbers-and-punctuation"
            />
            {errors.EndTime && <Text style={styles.errorText}>{errors.EndTime}</Text>}
          </View>
        </View>

        {/* Jumlah Peserta */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Jumlah Peserta * {selectedFacility ? `(Maks: ${selectedFacility.Capacity})` : ""}
          </Text>
          <TextInput
            style={[styles.textInput, errors.PartySize && styles.inputError]}
            placeholder="Contoh: 5"
            placeholderTextColor={Colors.textTertiary}
            value={partySize}
            onChangeText={(v) => {
              setPartySize(v);
              if (errors.PartySize) setErrors((p) => ({ ...p, PartySize: undefined }));
            }}
            keyboardType="number-pad"
          />
          {errors.PartySize && <Text style={styles.errorText}>{errors.PartySize}</Text>}
        </View>

        {/* Tujuan Reservasi */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tujuan Penggunaan Ruangan *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, errors.Purpose && styles.inputError]}
            placeholder="Contoh: Diskusi tugas akhir dan presentasi project..."
            placeholderTextColor={Colors.textTertiary}
            value={purpose}
            onChangeText={(v) => {
              setPurpose(v);
              if (errors.Purpose) setErrors((p) => ({ ...p, Purpose: undefined }));
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.Purpose && <Text style={styles.errorText}>{errors.Purpose}</Text>}
        </View>

        {/* Advanced Feature 2: Foto Kondisi Ruangan (Kamera / Galeri) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Dokumentasi Foto Kondisi Ruangan</Text>
          <Text style={styles.photoHint}>
            Ambil foto ruangan sebelum penggunaan untuk bukti kondisi fasilitas (disimpan di perangkat).
          </Text>

          {photoUri ? (
            <View style={styles.photoPreviewWrapper}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoActionBtn} onPress={handlePickPhoto}>
                  <Text style={styles.photoActionBtnText}>🔄 Ganti Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, styles.photoDeleteBtn]}
                  onPress={() => setPhotoUri(null)}
                >
                  <Text style={styles.photoDeleteText}>🗑️ Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoBox} onPress={handlePickPhoto}>
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={styles.addPhotoTitle}>Ambil / Unggah Foto Ruangan</Text>
              <Text style={styles.addPhotoSubtitle}>Kamera atau Galeri</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Konfirmasi Reservasi</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  generalErrorBox: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + "40",
  },
  generalErrorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inputText: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  chevron: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  pickerDropdown: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    elevation: 4,
  },
  pickerOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primaryLight + "15",
  },
  pickerOptionText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  timeField: {
    flex: 1,
  },
  timeSeparator: {
    paddingTop: 32,
    paddingHorizontal: Spacing.xs,
  },
  timeSeparatorText: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
  },
  photoHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  addPhotoBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  addPhotoTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.primary,
  },
  addPhotoSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  photoPreviewWrapper: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  photoPreview: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  photoActions: {
    flexDirection: "row",
    padding: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  photoActionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
  },
  photoActionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.text,
  },
  photoDeleteBtn: {
    backgroundColor: Colors.errorLight,
  },
  photoDeleteText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.error,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});
