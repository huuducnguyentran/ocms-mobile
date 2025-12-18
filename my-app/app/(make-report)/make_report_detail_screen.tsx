// app/make_report_detail_screen.tsx
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
import {
  getGradesByClassAndTrainee,
  TraineeGradeRecord,
} from "@/service/traineeAssignationService";

const PRIMARY = "#3620AC";

/* ================= HELPERS ================= */
const isPass = (status?: string) => status?.toLowerCase().includes("pass");

const isTotal = (kind?: string) =>
  kind?.toLowerCase().includes("total") ||
  kind?.toLowerCase().includes("final");

/* ================= SCREEN ================= */
export default function MakeReportDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const router = useRouter();

  const [classDetail, setClassDetail] = useState<MyClassDetail | null>(null);
  const [selectedTrainee, setSelectedTrainee] = useState<string | null>(null);
  const [grades, setGrades] = useState<TraineeGradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    if (classId) loadClassDetail();
  }, [classId]);

  const loadClassDetail = async () => {
    const res = await getMyClassById(Number(classId));
    if (res.success) setClassDetail(res.data);
    setLoading(false);
  };

  const loadGrades = async (traineeId: string) => {
    setSelectedTrainee(traineeId);
    setLoadingGrades(true);
    const res = await getGradesByClassAndTrainee(Number(classId), traineeId);
    if (res.success) setGrades(res.data);
    setLoadingGrades(false);
  };

  if (loading || !classDetail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Report</Text>
      </View>

      {/* ================= CLASS INFO ================= */}
      <Card style={styles.card}>
        <Text style={styles.title}>{classDetail.subjectName}</Text>
        <Text style={styles.subtitle}>{classDetail.subjectId}</Text>

        <Text style={styles.label}>Instructor</Text>
        <Text style={styles.value}>{classDetail.instructorName}</Text>

        <Text style={styles.label}>Group</Text>
        <Text style={styles.value}>{classDetail.classGroupCode}</Text>
      </Card>

      {/* ================= TRAINEES ================= */}
      <Card style={styles.card}>
        <Text style={styles.section}>Trainees</Text>

        {classDetail.traineeAssignations.map((t) => (
          <TouchableOpacity
            key={t.traineeAssignationId}
            onPress={() => loadGrades(t.traineeId)}
          >
            <View
              style={[
                styles.traineeRow,
                selectedTrainee === t.traineeId && styles.traineeSelected,
              ]}
            >
              <Text style={styles.traineeName}>{t.traineeName}</Text>
              <Text style={styles.traineeId}>{t.traineeId}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      {/* ================= GRADES (ALWAYS EXPANDED) ================= */}
      {selectedTrainee && (
        <Card style={styles.card}>
          <Text style={styles.section}>Grades</Text>

          {loadingGrades ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : grades.length === 0 ? (
            <Text style={styles.noGrade}>No grades recorded.</Text>
          ) : (
            grades.map((g) => (
              <View
                key={g.traineeAssignationGradeId}
                style={[
                  styles.gradeRow,
                  isTotal(g.gradeKind) && styles.totalRow,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.gradeKind}>{g.gradeKind}</Text>

                  {/* PASS / FAIL TAG */}
                  <View
                    style={[
                      styles.statusTag,
                      isPass(g.gradeStatus) ? styles.passTag : styles.failTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPass(g.gradeStatus)
                          ? styles.passText
                          : styles.failText,
                      ]}
                    >
                      {g.gradeStatus}
                    </Text>
                  </View>

                  {"weight" in g && g.weight !== undefined && (
                    <Text style={styles.weightText}>
                      Weight: {(g.weight * 100).toFixed(0)}%
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.gradeValue,
                    isTotal(g.gradeKind) && styles.totalValue,
                  ]}
                >
                  {g.grade}
                </Text>
              </View>
            ))
          )}
        </Card>
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9FF", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  back: { fontSize: 30, fontWeight: "700", color: PRIMARY, marginRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: PRIMARY },

  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "white",
    marginBottom: 18,
    elevation: 3,
  },

  title: { fontSize: 21, fontWeight: "700", color: PRIMARY },
  subtitle: { fontSize: 15, color: "#666", marginBottom: 12 },

  label: { fontWeight: "700", color: PRIMARY, marginTop: 8 },
  value: { fontSize: 16, color: "#333" },

  section: {
    fontSize: 19,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 12,
  },

  traineeRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  traineeSelected: { backgroundColor: "#EFEAFF", borderRadius: 10 },

  traineeName: { fontSize: 16, fontWeight: "600" },
  traineeId: { fontSize: 14, color: "#555" },

  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  gradeKind: { fontSize: 16, fontWeight: "700", color: PRIMARY },

  gradeValue: { fontSize: 20, fontWeight: "800", color: PRIMARY },

  /* STATUS TAG */
  statusTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  passTag: { backgroundColor: "#E8F7EF" },
  failTag: { backgroundColor: "#FDEAEA" },

  statusText: { fontSize: 12, fontWeight: "700" },
  passText: { color: "#1E8E5A" },
  failText: { color: "#C62828" },

  weightText: { fontSize: 13, color: "#444" },

  /* TOTAL SCORE */
  totalRow: {
    backgroundColor: "#F3F0FF",
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  totalValue: {
    fontSize: 30,
    fontWeight: "900",
    color: PRIMARY,
  },

  noGrade: { color: "#666", fontStyle: "italic" },
});
