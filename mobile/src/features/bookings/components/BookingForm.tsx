import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Room } from '../../rooms/data';
import { getThemeColors } from '../../../theme';
import { usePrototypeStore } from '../../../state/PrototypeStore';
import { BookingFormValues, BookingFieldErrors, validateBookingForm } from '../domain/validateBookingForm';
import { useBooking } from '../state/BookingProvider';
import { createBooking } from '../../../services/BookingStorage';

type Props = {
  room: Room;
  userId: string;
  initialValues: BookingFormValues;
  onSuccess: () => void;
};

export function BookingForm({ room, userId, initialValues, onSuccess }: Props) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const { state, submit, reset } = useBooking();
  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  const isSubmitting = state.submitStatus === 'submitting';

  const updateValue = (field: keyof BookingFormValues, value: string) => {
    if (!isSubmitting) reset();
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const validation = validateBookingForm(values, room.capacity);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    const startsAt = new Date(`${values.date}T${values.startTime}:00`).toISOString();
    const endsAt = new Date(`${values.date}T${values.endTime}:00`).toISOString();
    const success = await submit({ userId, roomId: room.id, startsAt, endsAt, people: Number(values.people) });
    if (success) {
      try {
        await createBooking({
          FacilityName: room.name,
          Date: values.date,
          StartTime: values.startTime,
          EndTime: values.endTime,
          Purpose: `Reservasi ${room.type} (${values.people} orang)`,
          Status: 'Confirmed',
        });
      } catch {
        // Local persistence fallback
      }
      onSuccess();
    }
  };

  const renderField = (label: string, field: keyof BookingFormValues, placeholder: string, props: { keyboardType?: 'default' | 'numeric'; maxLength?: number } = {}) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.subtle }]}>{label}</Text>
      <TextInput
        value={values[field]}
        editable={!isSubmitting}
        onChangeText={(value) => updateValue(field, value)}
        placeholder={placeholder}
        placeholderTextColor={theme.subtle}
        keyboardType={props.keyboardType}
        maxLength={props.maxLength}
        autoCapitalize="none"
        style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: errors[field] ? '#c65f55' : theme.border }]}
        accessibilityLabel={label}
      />
      {errors[field] && <Text style={styles.fieldError}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Pesan {room.name}</Text>
      <Text style={[styles.roomMeta, { color: theme.muted }]}>{room.building} · Kapasitas {room.capacity} orang</Text>

      {renderField('TANGGAL (YYYY-MM-DD)', 'date', '2026-10-08', { maxLength: 10 })}
      <View style={styles.row}>
        <View style={styles.half}>{renderField('MULAI (HH:MM)', 'startTime', '10:00', { maxLength: 5 })}</View>
        <View style={styles.half}>{renderField('SELESAI (HH:MM)', 'endTime', '12:00', { maxLength: 5 })}</View>
      </View>
      {renderField('JUMLAH ORANG', 'people', '4', { keyboardType: 'numeric', maxLength: 2 })}

      {state.submitStatus === 'error' && (
        <View style={[styles.errorBox, { backgroundColor: isDark ? '#482b28' : '#fff0ed' }]}>
          <Text style={styles.submitError}>{state.error}</Text>
        </View>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Konfirmasi booking"
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
        style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
      >
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Konfirmasi booking</Text>}
      </Pressable>
      {isSubmitting && <Text style={[styles.loadingText, { color: theme.muted }]}>Menyimpan reservasi...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 12 },
  heading: { fontSize: 19, fontWeight: '800', marginRight: 36, letterSpacing: -0.3 },
  roomMeta: { fontSize: 12, fontWeight: '500', marginTop: 2, marginBottom: 4 },
  field: { width: '100%', gap: 6 },
  row: { flexDirection: 'row', gap: 12, width: '100%' },
  half: { flex: 1 },
  label: { fontSize: 11, letterSpacing: 0.6, fontWeight: '700', textTransform: 'uppercase' },
  input: {
    minHeight: 46,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 14,
    fontWeight: '500',
  },
  fieldError: { color: '#c65f55', fontSize: 11, fontWeight: '500', marginTop: 2 },
  errorBox: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#f1bcb6' },
  submitError: { color: '#c65f55', fontSize: 12, lineHeight: 17, fontWeight: '500' },
  submitButton: {
    minHeight: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#28583f',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  loadingText: { textAlign: 'center', fontSize: 11, fontWeight: '500', marginTop: 2 },
});
