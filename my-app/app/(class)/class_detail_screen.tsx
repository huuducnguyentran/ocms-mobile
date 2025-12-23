import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getMyClassById, MyClassDetail } from "@/service/classService";
import {
  getAttendanceByClassId,
  AttendanceRecord,
} from "@/service/attendanceService";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY = "#3620AC";

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const router = useRouter();

  const [classDetail, setClassDetail] = useState<MyClassDetail | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    const res = await getMyClassById(Number(classId));
    if (res.success) setClassDetail(res.data);

    const att = await getAttendanceByClassId(Number(classId));
    if (att.success) setAttendance(att.data);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Class Detail</Text>
        </View>

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

        {/* SCORE RULES */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Minimum Score Requirements</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Progress Test</Text>
            <Text style={styles.value}>{classDetail.minProgressTest}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Practice Exam</Text>
            <Text style={styles.value}>{classDetail.minPracticeExamScore}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Final Exam</Text>
            <Text style={styles.value}>{classDetail.minFinalExamScore}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Total Score</Text>
            <Text style={styles.value}>{classDetail.minTotalScore}</Text>
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

        {/* ATTENDANCE LIST */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Attendance</Text>

          {attendance.length === 0 && (
            <Text style={{ color: "#666", fontStyle: "italic" }}>
              No attendance recorded yet.
            </Text>
          )}

          {attendance.map((a) => {
            const statusColor =
              a.statusDisplay === "Present"
                ? "#4CAF50"
                : a.statusDisplay === "Absent"
                ? "#D32F2F"
                : "#F57C00";

            return (
              <View key={a.attendanceId} style={styles.attendanceItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.attendanceSlot}>Slot {a.slot}</Text>
                  <Text style={styles.attendanceDate}>
                    {new Date(a.date).toLocaleDateString()}
                  </Text>
                </View>

                <View
                  style={[styles.statusPill, { backgroundColor: statusColor }]}
                >
                  <Text style={styles.statusPillText}>{a.statusDisplay}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF9FF",
  },
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
    paddingTop: 8,
  },

  backButton: {
    marginRight: 12,
    padding: 4,
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

  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F4F3FF",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E4E0FB",
  },

  attendanceSlot: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
  },

  attendanceDate: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },

  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "center",
  },

  statusPillText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
  },
});
