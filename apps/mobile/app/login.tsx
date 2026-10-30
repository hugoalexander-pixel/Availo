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
import { User } from "../src/types/Models";

interface LoginResponse {
  Data: {
    Token: string;
    User: User;
  };
  Message: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("budi@kampus.ac.id");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", {
        Email: cleanEmail,
        Password: password,
      });

      await saveAuthSession(res.Data.Token, res.Data.User);
      router.replace("/");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof NetworkError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan saat masuk. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  function fillDemoAccount(type: "mahasiswa" | "pengelola") {
    if (type === "mahasiswa") {
      setEmail("budi@kampus.ac.id");
      setPassword("password123");
    } else {
      setEmail("pengelola@kampus.ac.id");
      setPassword("adminpass123");
    }
    setErrorMessage(null);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Masuk ke Availo", headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logoIcon}>🏛️</Text>
          <Text style={styles.appName}>Availo</Text>
          <Text style={styles.tagline}>
            Sistem Reservasi & Ketersediaan Ruang Kampus Real-Time
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masuk Akun</Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Kampus</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@kampus.ac.id"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErrorMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimal 8 karakter"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrorMessage(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Akun Cepat untuk Demo:</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemoAccount("mahasiswa")}
              >
                <Text style={styles.demoChipText}>🎓 Mahasiswa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemoAccount("pengelola")}
              >
                <Text style={styles.demoChipText}>🏢 Pengelola</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>Belum punya akun?</Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  logoIcon: {
    fontSize: 52,
    marginBottom: Spacing.xs,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
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
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + "40",
  },
  errorText: {
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
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.sm,
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
  demoSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "center",
  },
  demoTitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  demoChip: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  registerPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  registerPromptText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "700",
  },
});
