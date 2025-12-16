// app/make_report_screen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { getMyClasses, MyClass } from "@/service/classService";

const PRIMARY = "#3620AC";

export default function MakeReportScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<MyClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const res = await getMyClasses();
    if (res.success) setClasses(res.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Class Reports</Text>

      {classes.map((cls) => (
        <TouchableOpacity
          key={cls.classId}
          onPress={() =>
            router.push({
              pathname: "/make_report_detail_screen",
              params: { classId: String(cls.classId) },
            })
          }
        >
          <Card style={styles.card}>
            <Text style={styles.title}>{cls.subjectName}</Text>
            <Text style={styles.subtitle}>ID: {cls.subjectId}</Text>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Group</Text>
                <Text style={styles.value}>{cls.classGroupCode}</Text>
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>Instructor</Text>
                <Text style={styles.value}>{cls.instructorName}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
