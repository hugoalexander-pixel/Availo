import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize } from "../constants/Theme";

interface LoadingViewProps {
  message?: string;
}

export default function LoadingView({ message = "Memuat data..." }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  text: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});
