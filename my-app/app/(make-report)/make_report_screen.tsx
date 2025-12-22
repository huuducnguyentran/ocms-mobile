// app/make_report_screen.tsx
// This screen now redirects directly to the detail screen
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const PRIMARY = "#3620AC";

export default function MakeReportScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to detail screen
    router.replace("/(make-report)/make_report_detail_screen");
  }, []);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FAF9FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 20,
  },

  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "white",
    marginBottom: 16,
    elevation: 3,
  },

  title: { fontSize: 20, fontWeight: "700", color: PRIMARY },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 12 },

  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { width: "48%" },

  label: { fontWeight: "600", color: PRIMARY, marginBottom: 4 },
  value: { fontSize: 16, color: "#333" },
});
