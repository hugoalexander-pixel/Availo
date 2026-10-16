import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Booking, BookingFormData, BookingStatus } from '../types/Booking';
import { createBooking, updateBooking } from '../services/BookingStorage';

type Props = {
  booking?: Booking | null;
  initialFacilityName?: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

const FACILITY_OPTIONS = [
  'Ruang Diskusi 302',
  'Lab Komputer 201',
  'Ruang Kelas 405',
  'Auditorium Lantai 5',
  'Ruang Rapat Gedung B',
];

const STATUS_OPTIONS: { label: string; value: BookingStatus; color: string; bg: string }[] = [
  { label: 'Menunggu (Pending)', value: 'Pending', color: '#b45309', bg: '#fef3c7' },
  { label: 'Dikonfirmasi (Confirmed)', value: 'Confirmed', color: '#15803d', bg: '#dcfce7' },
  { label: 'Dibatalkan (Cancelled)', value: 'Cancelled', color: '#b91c1c', bg: '#fee2e2' },
];

function timeToMinutes(time: string): number {
  const parts = time.split(':');
  if (parts.length !== 2) return NaN;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}

export function BookingForm({ booking, initialFacilityName, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(booking);

  const [facilityName, setFacilityName] = useState(booking?.FacilityName ?? initialFacilityName ?? 'Ruang Diskusi 302');
  const [date, setDate] = useState(booking?.Date ?? new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(booking?.StartTime ?? '09:00');
  const [endTime, setEndTime] = useState(booking?.EndTime ?? '11:00');
  const [purpose, setPurpose] = useState(booking?.Purpose ?? '');
  const [status, setStatus] = useState<BookingStatus>(booking?.Status ?? 'Pending');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!facilityName.trim()) {
      nextErrors.facilityName = 'Fasilitas kampus wajib dipilih atau diisi.';
    }

    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      nextErrors.date = 'Tanggal wajib diisi dengan format YYYY-MM-DD.';
    }

    const startMinutes = timeToMinutes(startTime.trim());
    const endMinutes = timeToMinutes(endTime.trim());

    if (isNaN(startMinutes)) {
      nextErrors.startTime = 'Jam mulai wajib diisi dengan format HH:MM (contoh: 09:00).';
    }

    if (isNaN(endMinutes)) {
      nextErrors.endTime = 'Jam selesai wajib diisi dengan format HH:MM (contoh: 11:00).';
    } else if (!isNaN(startMinutes) && endMinutes <= startMinutes) {
      nextErrors.endTime = 'Jam selesai harus lebih akhir daripada jam mulai.';
    }

    if (!purpose.trim()) {
      nextErrors.purpose = 'Tujuan penggunaan fasilitas wajib diisi.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData: BookingFormData = {
        FacilityName: facilityName.trim(),
        Date: date.trim(),
        StartTime: startTime.trim(),
        EndTime: endTime.trim(),
        Purpose: purpose.trim(),
        Status: status,
      };

      if (isEditing && booking) {
        await updateBooking(booking.Id, formData);
        Alert.alert('Perubahan Tersimpan', 'Data booking berhasil diperbarui.');
      } else {
        await createBooking(formData);
        Alert.alert('Booking Berhasil', 'Data booking baru telah disimpan secara lokal.');
      }

      onSuccess();
    } catch (err) {
      Alert.alert('Gagal Menyimpan', err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.formTitle}>
        {isEditing ? '✏️ Edit Data Booking' : '➕ Tambah Booking Fasilitas'}
      </Text>
      <Text style={styles.formSubtitle}>
        {isEditing
          ? 'Perbarui informasi booking atau ubah status reservasi.'
          : 'Isi formulir untuk menyimpan reservasi fasilitas ke local storage.'}
      </Text>

      {/* Fasilitas */}
      <View style={styles.field}>
        <Text style={styles.label}>NAMA FASILITAS / RUANGAN *</Text>
        <TextInput
          value={facilityName}
          onChangeText={(v) => {
            setFacilityName(v);
            if (errors.facilityName) setErrors((e) => ({ ...e, facilityName: '' }));
          }}
          placeholder="Contoh: Ruang Diskusi 302"
          placeholderTextColor="#9ca3af"
          style={[styles.input, errors.facilityName ? styles.inputError : null]}
        />
        {errors.facilityName ? <Text style={styles.errorText}>{errors.facilityName}</Text> : null}

        {/* Suggestion Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {FACILITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                setFacilityName(opt);
                if (errors.facilityName) setErrors((e) => ({ ...e, facilityName: '' }));
              }}
              style={[styles.chip, facilityName === opt && styles.chipActive]}
            >
              <Text style={[styles.chipText, facilityName === opt && styles.chipTextActive]}>{opt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tanggal */}
      <View style={styles.field}>
        <Text style={styles.label}>TANGGAL (YYYY-MM-DD) *</Text>
        <TextInput
          value={date}
          onChangeText={(v) => {
            setDate(v);
            if (errors.date) setErrors((e) => ({ ...e, date: '' }));
          }}
          placeholder="2026-10-20"
          placeholderTextColor="#9ca3af"
          maxLength={10}
          style={[styles.input, errors.date ? styles.inputError : null]}
        />
        {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
      </View>

      {/* Jam Mulai & Selesai */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>JAM MULAI (HH:MM) *</Text>
          <TextInput
            value={startTime}
            onChangeText={(v) => {
              setStartTime(v);
              if (errors.startTime || errors.endTime) setErrors((e) => ({ ...e, startTime: '', endTime: '' }));
            }}
            placeholder="09:00"
            placeholderTextColor="#9ca3af"
            maxLength={5}
            style={[styles.input, errors.startTime ? styles.inputError : null]}
          />
          {errors.startTime ? <Text style={styles.errorText}>{errors.startTime}</Text> : null}
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>JAM SELESAI (HH:MM) *</Text>
          <TextInput
            value={endTime}
            onChangeText={(v) => {
              setEndTime(v);
              if (errors.endTime) setErrors((e) => ({ ...e, endTime: '' }));
            }}
            placeholder="11:00"
            placeholderTextColor="#9ca3af"
            maxLength={5}
            style={[styles.input, errors.endTime ? styles.inputError : null]}
          />
          {errors.endTime ? <Text style={styles.errorText}>{errors.endTime}</Text> : null}
        </View>
      </View>

      {/* Tujuan Penggunaan */}
      <View style={styles.field}>
        <Text style={styles.label}>TUJUAN PENGGUNAAN *</Text>
        <TextInput
          value={purpose}
          onChangeText={(v) => {
            setPurpose(v);
            if (errors.purpose) setErrors((e) => ({ ...e, purpose: '' }));
          }}
          placeholder="Contoh: Diskusi Proyek Akhir Basis Data"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea, errors.purpose ? styles.inputError : null]}
        />
        {errors.purpose ? <Text style={styles.errorText}>{errors.purpose}</Text> : null}
      </View>

      {/* Status Chip Selector (khususnya saat edit atau set manual) */}
      <View style={styles.field}>
        <Text style={styles.label}>STATUS RESERVASI</Text>
        <View style={styles.statusChipsContainer}>
          {STATUS_OPTIONS.map((item) => {
            const isSelected = status === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setStatus(item.value)}
                style={[
                  styles.statusChip,
                  { borderColor: isSelected ? item.color : '#e2e8f0', backgroundColor: isSelected ? item.bg : '#f8fafc' },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                <Text style={[styles.statusChipText, { color: isSelected ? item.color : '#64748b', fontWeight: isSelected ? '700' : '500' }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tombol Aksi */}
      <View style={styles.actionsRow}>
        {onCancel ? (
          <Pressable style={styles.cancelBtn} onPress={onCancel} disabled={isSubmitting}>
            <Text style={styles.cancelBtnText}>Batal</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? 'Simpan Perubahan' : 'Tambah Booking'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    gap: 14,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: -8,
    marginBottom: 4,
    lineHeight: 18,
  },
  field: {
    gap: 6,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  half: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 76,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 2,
  },
  chipsRow: {
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: '#28583f',
    backgroundColor: '#edf3e9',
  },
  chipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#28583f',
    fontWeight: '700',
  },
  statusChipsContainer: {
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#28583f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#28583f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnDisabled: {
    opacity: 0.65,
  },
});
