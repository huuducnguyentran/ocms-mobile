import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getMyClassById, MyClassDetail } from "@/service/classService";

const PRIMARY = "#3620AC";

export default function ClassInfoScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const router = useRouter();

  const [classDetail, setClassDetail] = useState<MyClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      loadDetail();
    }
  }, [classId]);

  const loadDetail = async () => {
    const res = await getMyClassById(Number(classId));
    if (res.success) setClassDetail(res.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!classDetail) {
    return (
      <View style={styles.center}>
        <Text style={{ color: PRIMARY, fontSize: 18 }}>Class not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* MAIN CARD */}
      <Card style={styles.card}>
        <Text style={styles.title}>{classDetail.subjectName}</Text>
        <Text style={styles.subtitle}>{classDetail.subjectId}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Instructor</Text>
          <Text style={styles.value}>{classDetail.instructorName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Group</Text>
          <Text style={styles.value}>{classDetail.classGroupCode}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Slot</Text>
          <Text style={styles.value}>{classDetail.slot}</Text>
        </View>
      </Card>

      {/* TRAINEE LIST */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Trainees</Text>

        {classDetail.traineeAssignations.map((t) => (
          <View key={t.traineeAssignationId} style={styles.studentRow}>
            <Text style={styles.studentName}>{t.traineeName}</Text>
            <Text style={styles.studentId}>{t.traineeId}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9FF",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: PRIMARY,
    fontWeight: "bold",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "white",
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 12,
  },
  studentRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
  },
  studentId: {
    fontSize: 14,
    color: "#555",
  },
});
