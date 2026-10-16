import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { BookingFormData, BookingStatus } from "../types/Booking";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/Theme";

interface BookingFormProps {
  initialValues?: BookingFormData;
  onSubmit: (data: BookingFormData) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

interface FormErrors {
  FacilityName?: string;
  Date?: string;
  StartTime?: string;
  EndTime?: string;
  Purpose?: string;
}

const FACILITY_OPTIONS = [
  "Ruang Diskusi 302",
  "Lab Komputer A",
  "Aula Utama",
  "Ruang Rapat Lt.2",
  "Ruang Kelas 101",
  "Laboratorium Jaringan",
];

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function isValidTime(timeStr: string): boolean {
  return /^\d{2}:\d{2}$/.test(timeStr);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function BookingForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: BookingFormProps) {
  const [facilityName, setFacilityName] = useState(initialValues?.FacilityName ?? "");
  const [date, setDate] = useState(initialValues?.Date ?? "");
  const [startTime, setStartTime] = useState(initialValues?.StartTime ?? "");
  const [endTime, setEndTime] = useState(initialValues?.EndTime ?? "");
  const [purpose, setPurpose] = useState(initialValues?.Purpose ?? "");
  const [status, setStatus] = useState<BookingStatus>(initialValues?.Status ?? "Pending");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showFacilityPicker, setShowFacilityPicker] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!facilityName.trim()) {
      newErrors.FacilityName = "Nama fasilitas wajib diisi.";
    }
    if (!date.trim()) {
      newErrors.Date = "Tanggal wajib diisi.";
    } else if (!isValidDate(date)) {
      newErrors.Date = "Format tanggal: YYYY-MM-DD";
    }
    if (!startTime.trim()) {
      newErrors.StartTime = "Jam mulai wajib diisi.";
    } else if (!isValidTime(startTime)) {
      newErrors.StartTime = "Format jam: HH:MM";
    }
    if (!endTime.trim()) {
      newErrors.EndTime = "Jam selesai wajib diisi.";
    } else if (!isValidTime(endTime)) {
      newErrors.EndTime = "Format jam: HH:MM";
    }
    if (
      isValidTime(startTime) &&
      isValidTime(endTime) &&
      timeToMinutes(endTime) <= timeToMinutes(startTime)
    ) {
      newErrors.EndTime = "Jam selesai harus lebih akhir dari jam mulai.";
    }
    if (!purpose.trim()) {
      newErrors.Purpose = "Tujuan booking wajib diisi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit({
      FacilityName: facilityName.trim(),
      Date: date.trim(),
      StartTime: startTime.trim(),
      EndTime: endTime.trim(),
      Purpose: purpose.trim(),
      Status: status,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nama Fasilitas</Text>
          <TouchableOpacity
            style={[styles.input, errors.FacilityName && styles.inputError]}
            onPress={() => setShowFacilityPicker(!showFacilityPicker)}
          >
            <Text
              style={[
                styles.inputText,
                !facilityName && styles.placeholderText,
              ]}
            >
              {facilityName || "Pilih fasilitas..."}
            </Text>
            <Text style={styles.chevron}>{showFacilityPicker ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {showFacilityPicker && (
            <View style={styles.pickerDropdown}>
              {FACILITY_OPTIONS.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.pickerOption,
                    facilityName === name && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setFacilityName(name);
                    setShowFacilityPicker(false);
                    if (errors.FacilityName) {
                      setErrors((prev) => ({ ...prev, FacilityName: undefined }));
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      facilityName === name && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.FacilityName && (
            <Text style={styles.errorText}>{errors.FacilityName}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tanggal</Text>
          <TextInput
            style={[styles.textInput, errors.Date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textTertiary}
            value={date}
            onChangeText={(v) => {
              setDate(v);
              if (errors.Date) setErrors((prev) => ({ ...prev, Date: undefined }));
            }}
            keyboardType="numbers-and-punctuation"
          />
          {errors.Date && <Text style={styles.errorText}>{errors.Date}</Text>}
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.label}>Jam Mulai</Text>
            <TextInput
              style={[styles.textInput, errors.StartTime && styles.inputError]}
              placeholder="HH:MM"
              placeholderTextColor={Colors.textTertiary}
              value={startTime}
              onChangeText={(v) => {
                setStartTime(v);
                if (errors.StartTime)
                  setErrors((prev) => ({ ...prev, StartTime: undefined }));
              }}
              keyboardType="numbers-and-punctuation"
            />
            {errors.StartTime && (
              <Text style={styles.errorText}>{errors.StartTime}</Text>
            )}
          </View>
          <View style={styles.timeSeparator}>
            <Text style={styles.timeSeparatorText}>—</Text>
          </View>
          <View style={styles.timeField}>
            <Text style={styles.label}>Jam Selesai</Text>
            <TextInput
              style={[styles.textInput, errors.EndTime && styles.inputError]}
              placeholder="HH:MM"
              placeholderTextColor={Colors.textTertiary}
              value={endTime}
              onChangeText={(v) => {
                setEndTime(v);
                if (errors.EndTime)
                  setErrors((prev) => ({ ...prev, EndTime: undefined }));
              }}
              keyboardType="numbers-and-punctuation"
            />
            {errors.EndTime && (
              <Text style={styles.errorText}>{errors.EndTime}</Text>
            )}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tujuan Booking</Text>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              errors.Purpose && styles.inputError,
            ]}
            placeholder="Contoh: Diskusi kelompok mata kuliah..."
            placeholderTextColor={Colors.textTertiary}
            value={purpose}
            onChangeText={(v) => {
              setPurpose(v);
              if (errors.Purpose)
                setErrors((prev) => ({ ...prev, Purpose: undefined }));
            }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.Purpose && (
            <Text style={styles.errorText}>{errors.Purpose}</Text>
          )}
        </View>

        {initialValues && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Status Booking</Text>
            <View style={styles.statusChipsContainer}>
              {(["Pending", "Confirmed", "Cancelled"] as BookingStatus[]).map((st) => {
                const isSelected = status === st;
                const label =
                  st === "Pending"
                    ? "Menunggu"
                    : st === "Confirmed"
                    ? "Dikonfirmasi"
                    : "Dibatalkan";
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusChip,
                      isSelected && styles.statusChipSelected,
                      isSelected &&
                        st === "Pending" && {
                          borderColor: Colors.pending,
                          backgroundColor: Colors.pendingLight,
                        },
                      isSelected &&
                        st === "Confirmed" && {
                          borderColor: Colors.confirmed,
                          backgroundColor: Colors.confirmedLight,
                        },
                      isSelected &&
                        st === "Cancelled" && {
                          borderColor: Colors.cancelled,
                          backgroundColor: Colors.cancelledLight,
                        },
                    ]}
                    onPress={() => setStatus(st)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        isSelected && {
                          fontWeight: "700",
                          color:
                            st === "Pending"
                              ? Colors.pending
                              : st === "Confirmed"
                              ? Colors.confirmed
                              : Colors.cancelled,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Menyimpan..." : submitLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
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
    paddingVertical: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.lg,
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
    marginTop: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  pickerOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primaryLight + "18",
  },
  pickerOptionText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  timeField: {
    flex: 1,
  },
  timeSeparator: {
    paddingTop: 36,
    paddingHorizontal: Spacing.xs,
  },
  timeSeparatorText: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
  statusChipsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statusChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  statusChipSelected: {
    borderWidth: 1.5,
  },
  statusChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
