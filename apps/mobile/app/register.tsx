import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { apiClient, ApiError, NetworkError } from "../src/services/ApiClient";
import { saveAuthSession } from "../src/services/AuthStorage";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/constants/Theme";
import { Role, User } from "../src/types/Models";

interface RegisterResponse {
  Data: {
    Token: string;
    User: User;
  };
  Message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("MAHASISWA");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi.";
    }

    const emailTrim = email.trim();
    if (!emailTrim) {
      newErrors.email = "Email kampus wajib diisi.";
    } else if (!emailTrim.includes("@") || !emailTrim.includes(".")) {
      newErrors.email = "Format email tidak valid.";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi.";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const res = await apiClient.post<RegisterResponse>("/auth/register", {
        Name: name.trim(),
        Email: email.trim(),
        Password: password,
        Role: role,
      });

      await saveAuthSession(res.Data.Token, res.Data.User);
      Alert.alert("Registrasi Berhasil", "Akun berhasil dibuat. Selamat datang di Availo!", [
        { text: "Lanjut", onPress: () => router.replace("/") },
      ]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrors({ general: err.message });
      } else if (err instanceof NetworkError) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "Terjadi kesalahan saat pendaftaran. Silakan coba lagi." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "Daftar Akun Baru",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Buat Akun Availo</Text>
          <Text style={styles.cardSubtitle}>
            Daftar untuk reservasi fasilitas kampus dengan mudah dan cepat.
          </Text>

          {errors.general && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Contoh: Budi Santoso"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              editable={!loading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Kampus *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="nama@kampus.ac.id"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password * (Min. 8 karakter)</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Minimal 8 karakter"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Konfirmasi Password *</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Ulangi password"
              placeholderTextColor={Colors.textTertiary}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                if (errors.confirmPassword)
                  setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Peran Pengguna (Role)</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === "MAHASISWA" && styles.roleOptionSelected,
                ]}
                onPress={() => setRole("MAHASISWA")}
                disabled={loading}
              >
                <Text style={styles.roleIcon}>🎓</Text>
                <Text
                  style={[
                    styles.roleText,
                    role === "MAHASISWA" && styles.roleTextSelected,
                  ]}
                >
                  Mahasiswa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === "PENGELOLA" && styles.roleOptionSelected,
                ]}
                onPress={() => setRole("PENGELOLA")}
                disabled={loading}
              >
                <Text style={styles.roleIcon}>🏢</Text>
                <Text
                  style={[
                    styles.roleText,
                    role === "PENGELOLA" && styles.roleTextSelected,
                  ]}
                >
                  Pengelola
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Daftar Sekarang</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Sudah memiliki akun?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
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
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + "40",
  },
  errorBoxText: {
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  roleContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  roleOptionSelected: {
    backgroundColor: Colors.primaryLight + "20",
    borderColor: Colors.primary,
  },
  roleIcon: {
    fontSize: FontSize.lg,
  },
  roleText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  roleTextSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  loginPromptText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "700",
  },
});
