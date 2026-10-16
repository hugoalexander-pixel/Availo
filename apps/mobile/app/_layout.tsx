import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../src/constants/Theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ title: "Availo" }} />
        <Stack.Screen name="create" options={{ title: "Tambah Booking" }} />
        <Stack.Screen name="edit/[id]" options={{ title: "Edit Booking" }} />
      </Stack>
    </>
  );
}
