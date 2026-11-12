import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getThemeColors } from '../../theme';

interface ProfileFormProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  onNameChange: (name: string) => void;
  email: string;
  isDark: boolean;
  onSave: () => void;
  error?: string | null;
}

export function ProfileForm({
  visible,
  onClose,
  name,
  onNameChange,
  email,
  isDark,
  onSave,
  error,
}: ProfileFormProps) {
  const theme = getThemeColors(isDark);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Edit profil</Text>
          <Text style={[styles.modalSubtitle, { color: theme.muted }]}>
            Perbarui nama kamu. Email kampus terikat ke akun dan tidak bisa diubah di sini.
          </Text>

          <Text style={[styles.label, { color: theme.subtle }]}>NAMA LENGKAP</Text>
          <TextInput
            value={name}
            onChangeText={onNameChange}
            placeholder="Nama lengkap"
            placeholderTextColor="#a2aaa1"
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.input, borderColor: theme.border },
              error ? { borderColor: theme.danger } : {},
            ]}
            autoCapitalize="words"
            returnKeyType="done"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>EMAIL MAHASISWA · BACA SAJA</Text>
          <View
            style={[
              styles.input,
              styles.readOnlyInput,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.readOnlyText, { color: theme.muted }]}>{email}</Text>
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: theme.surfaceSecondary }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: theme.muted }]}>Batal</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveText}>Simpan perubahan</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 25, 18, 0.65)',
  },
  modalCard: { width: '100%', maxWidth: 420, padding: 24, borderRadius: 18 },
  modalTitle: { color: '#253329', fontSize: 20, fontWeight: '700' },
  modalSubtitle: {
    color: '#858f85',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 18,
  },
  label: {
    color: '#7d897c',
    fontSize: 11,
    letterSpacing: 0.7,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: '#e4e9e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#26342a',
    backgroundColor: '#fff',
    fontSize: 14,
    marginBottom: 14,
  },
  readOnlyInput: { justifyContent: 'center', backgroundColor: '#f3f5f1' },
  readOnlyText: { color: '#7d897c', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#f1f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#647064', fontSize: 13, fontWeight: '700' },
  saveButton: {
    flex: 1.5,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#28583f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  errorText: { color: '#ad544a', fontSize: 11, marginTop: -10, marginBottom: 10 },
});
