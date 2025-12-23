// app/make_report_detail_screen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { storage } from "@/utils/storage";

import {
  getMyClassById,
  MyClassDetail,
  getMyClasses,
  MyClass,
} from "@/service/classService";
import {
  getGradesByClassAndTrainee,
  TraineeGradeRecord,
} from "@/service/traineeAssignationService";

const PRIMARY = "#3620AC";

/* ================= HELPERS ================= */
const isPass = (status?: string) => status?.toLowerCase().includes("pass");

const isTotal = (kind?: string) => {
  if (!kind) return false;
  const lowerKind = kind.toLowerCase();
  return (
    lowerKind === "totalscore" ||
    lowerKind.includes("totalscore") ||
    (lowerKind.includes("total") && !lowerKind.includes("test"))
  );
};

/* ================= SCREEN ================= */
export default function MakeReportDetailScreen() {
  const { classId: paramClassId } = useLocalSearchParams<{
    classId?: string;
  }>();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [classes, setClasses] = useState<MyClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    paramClassId ? Number(paramClassId) : null
  );
  const [classDetails, setClassDetails] = useState<
    Record<number, MyClassDetail>
  >({});
  const [grades, setGrades] = useState<TraineeGradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadAllData();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedClassId && userId) {
      if (!classDetails[selectedClassId]) {
        loadClassData(selectedClassId);
      } else {
        // If class data already loaded, just load grades
        const classDetail = classDetails[selectedClassId];
        const traineeAssignation = classDetail.traineeAssignations.find(
          (t) => t.traineeId === userId
        );
        if (traineeAssignation) {
          loadGrades(selectedClassId, traineeAssignation.traineeId);
        }
      }
    }
  }, [selectedClassId, userId]);

  const loadUserId = async () => {
    const id = await storage.getItem("userId");
    setUserId(id);
  };

  const loadAllData = async () => {
    if (!userId) return;
    setLoading(true);
    const res = await getMyClasses();
    if (res.success) {
      setClasses(res.data);
      if (res.data.length > 0) {
        const firstClassId = res.data[0].classId;
        const targetClassId = paramClassId
          ? Number(paramClassId)
          : firstClassId;
        setSelectedClassId(targetClassId);
        await loadClassData(targetClassId);
      }
    }
    setLoading(false);
  };

  const loadClassData = async (classId: number) => {
    const classRes = await getMyClassById(classId);
    if (classRes.success) {
      setClassDetails((prev) => ({ ...prev, [classId]: classRes.data }));

      // Auto-load trainee grades
      const classDetail = classRes.data;
      const traineeAssignation = classDetail.traineeAssignations.find(
        (t) => t.traineeId === userId
      );
      if (traineeAssignation && userId) {
        await loadGrades(classId, traineeAssignation.traineeId);
      }
    }
  };

  const loadGrades = async (classId: number, traineeId: string) => {
    setLoadingGrades(true);
    const res = await getGradesByClassAndTrainee(classId, traineeId);
    if (res.success) setGrades(res.data);
    setLoadingGrades(false);
  };

  const selectedClass = classes.find((c) => c.classId === selectedClassId);
  const classDetail = selectedClassId ? classDetails[selectedClassId] : null;

  // Get current trainee info
  const currentTrainee = classDetail?.traineeAssignations.find(
    (t) => t.traineeId === userId
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Report</Text>
      </View>

      {/* CLASS SELECTOR - HORIZONTAL SCROLL */}
      {classes.length > 0 && (
        <View style={styles.classSelectorContainer}>
          <FlatList
            horizontal
            data={classes}
            keyExtractor={(item) => item.classId.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classList}
            renderItem={({ item }) => {
              const isSelected = selectedClassId === item.classId;
              const detail = classDetails[item.classId];
              const traineeTotalGrade = detail?.traineeAssignations
                .find((t) => t.traineeId === userId)
                ?.grades.find((g) => g.gradeKind === "TotalScore");

              return (
                <TouchableOpacity
                  style={[
                    styles.classCard,
                    isSelected && styles.classCardSelected,
                  ]}
                  onPress={async () => {
                    setSelectedClassId(item.classId);
                    setGrades([]);
                    if (!classDetails[item.classId]) {
                      await loadClassData(item.classId);
                    } else {
                      // If class data already loaded, just load grades
                      const detail = classDetails[item.classId];
                      const traineeAssignation =
                        detail.traineeAssignations.find(
                          (t) => t.traineeId === userId
                        );
                      if (traineeAssignation && userId) {
                        await loadGrades(
                          item.classId,
                          traineeAssignation.traineeId
                        );
                      }
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.classCardTitle,
                      isSelected && styles.classCardTitleSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {item.subjectName}
                  </Text>
                  <Text
                    style={[
                      styles.classCardSubtitle,
                      isSelected && styles.classCardSubtitleSelected,
                    ]}
                  >
                    {item.classGroupCode}
                  </Text>
                  {traineeTotalGrade && (
                    <View style={styles.statusBadgeContainer}>
                      <Text
                        style={[
                          styles.statusBadge,
                          isPass(traineeTotalGrade.gradeStatus)
                            ? styles.passBadge
                            : styles.failBadge,
                        ]}
                      >
                        {traineeTotalGrade.gradeStatus}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* CLASS INFO */}
      {classDetail && currentTrainee && (
        <>
          {/* MINIMUM SCORE REQUIREMENTS */}
          <Card style={styles.card}>
            <Text style={styles.section}>Minimum Score Requirements</Text>
            <View style={styles.requirementRow}>
              <Text style={styles.requirementLabel}>Progress Test</Text>
              <Text style={styles.requirementValue}>
                ≥ {classDetail.minProgressTest}
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Text style={styles.requirementLabel}>Practice Exam</Text>
              <Text style={styles.requirementValue}>
                ≥ {classDetail.minPracticeExamScore}
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Text style={styles.requirementLabel}>Final Exam</Text>
              <Text style={styles.requirementValue}>
                ≥ {classDetail.minFinalExamScore}
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Text style={styles.requirementLabel}>Total Score</Text>
              <Text style={styles.requirementValue}>
                ≥ {classDetail.minTotalScore}
              </Text>
            </View>
          </Card>
          {/* GRADE REPORT TABLE */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colCategory]}>
                GRADE CATEGORY
              </Text>
              <Text style={[styles.headerCell, styles.colItem]}>
                GRADE ITEM
              </Text>
              <Text style={[styles.headerCell, styles.colWeight]}>WEIGHT</Text>
              <Text style={[styles.headerCell, styles.colValue]}>VALUE</Text>
              <Text style={[styles.headerCell, styles.colStatus]}>STATUS</Text>
            </View>

            {loadingGrades ? (
              <View style={styles.emptyRow}>
                <ActivityIndicator size="small" color={PRIMARY} />
              </View>
            ) : grades.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No grades recorded.</Text>
              </View>
            ) : (
              <>
                {/* GROUP GRADES BY CATEGORY */}
                {(() => {
                  const grouped: Record<string, TraineeGradeRecord[]> = {};
                  const categoryOrder = [
                    "Practice Exam",
                    "Progress Tests",
                    "Final Exam",
                    "Final Exam Resit",
                  ];

                  // Helper function to map gradeKind to category
                  const getCategory = (gradeKind: string): string | null => {
                    const kind = gradeKind.toLowerCase();

                    if (kind.includes("total") || kind.includes("totalscore")) {
                      return null; // Skip total scores
                    }

                    // PracticeExamScore -> Practice Exam
                    if (
                      kind.includes("practiceexamscore") ||
                      kind.includes("practicalexamscore")
                    ) {
                      return "Practice Exam";
                    }

                    // ProgressTest -> Progress Tests
                    if (
                      kind.includes("progresstest") ||
                      kind.includes("progress")
                    ) {
                      return "Progress Tests";
                    }

                    // FinalExamScore -> Final Exam
                    if (kind.includes("finalexam") && !kind.includes("resit")) {
                      return "Final Exam";
                    }

                    if (kind.includes("finalexam") && kind.includes("resit")) {
                      return "Final Exam Resit";
                    }

                    return "Other";
                  };

                  // Helper function to format grade item name
                  const getGradeItemName = (gradeKind: string): string => {
                    const kind = gradeKind.toLowerCase();

                    // PracticeExamScore -> Practice Exam Score
                    if (
                      kind.includes("practiceexamscore") ||
                      kind.includes("practicalexamscore")
                    ) {
                      return "Practice Exam Score";
                    }

                    // ProgressTest -> Progress Test
                    if (kind.includes("progresstest")) {
                      return "Progress Test";
                    }

                    // FinalExamScore -> Final Exam
                    if (kind.includes("finalexam") && !kind.includes("resit")) {
                      return "Final Exam";
                    }

                    if (kind.includes("finalexam") && kind.includes("resit")) {
                      return "Final Exam Resit";
                    }

                    // Default: format with spaces
                    return gradeKind.replace(/([A-Z])/g, " $1").trim();
                  };

                  // Group grades by category
                  grades.forEach((g) => {
                    const category = getCategory(g.gradeKind);
                    if (category) {
                      if (!grouped[category]) grouped[category] = [];
                      grouped[category].push(g);
                    }
                  });

                  // Sort categories by predefined order
                  const sortedCategories = categoryOrder.filter(
                    (cat) => grouped[cat] && grouped[cat].length > 0
                  );

                  return sortedCategories.map((category) => {
                    const categoryGrades = grouped[category];
                    const categoryWeight = categoryGrades.reduce(
                      (sum, g) => sum + (g.weight || 0),
                      0
                    );
                    // Calculate weighted average for category
                    const categoryValue =
                      categoryWeight > 0
                        ? categoryGrades.reduce(
                            (sum, g) => sum + g.grade * (g.weight || 0),
                            0
                          ) / categoryWeight
                        : 0;

                    return (
                      <React.Fragment key={category}>
                        {categoryGrades.map((g, idx) => {
                          const gradeItemName = getGradeItemName(g.gradeKind);

                          return (
                            <View
                              key={g.traineeAssignationGradeId}
                              style={styles.tableRow}
                            >
                              <Text
                                style={[
                                  styles.cell,
                                  styles.colCategory,
                                  idx === 0 && styles.categoryCell,
                                ]}
                              >
                                {idx === 0 ? category : ""}
                              </Text>
                              <Text style={[styles.cell, styles.colItem]}>
                                {gradeItemName}
                              </Text>
                              <Text style={[styles.cell, styles.colWeight]}>
                                {g.weight
                                  ? (g.weight * 100).toFixed(1) + " %"
                                  : "-"}
                              </Text>
                              <Text style={[styles.cell, styles.colValue]}>
                                {g.grade !== undefined && g.grade !== null
                                  ? g.grade.toString()
                                  : "-"}
                              </Text>
                              <Text
                                style={[
                                  styles.cell,
                                  styles.colStatus,
                                  isPass(g.gradeStatus)
                                    ? styles.passStatus
                                    : styles.failStatus,
                                ]}
                              >
                                {g.gradeStatus || "-"}
                              </Text>
                            </View>
                          );
                        })}
                        {/* TOTAL ROW FOR CATEGORY */}
                        {categoryGrades.length > 0 && (
                          <View
                            style={[styles.tableRow, styles.categoryTotalRow]}
                          >
                            <Text style={[styles.cell, styles.colCategory]}>
                              Total
                            </Text>
                            <Text style={[styles.cell, styles.colItem]}></Text>
                            <Text style={[styles.cell, styles.colWeight]}>
                              {categoryWeight > 0
                                ? (categoryWeight * 100).toFixed(1) + " %"
                                : "-"}
                            </Text>
                            <Text style={[styles.cell, styles.colValue]}>
                              {categoryValue > 0
                                ? categoryValue.toFixed(1)
                                : "-"}
                            </Text>
                            <Text
                              style={[styles.cell, styles.colStatus]}
                            ></Text>
                          </View>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}

                {/* COURSE TOTAL SUMMARY */}
                {/* {grades.length > 0 && (
                  <View style={styles.courseTotalRow}>
                    <Text
                      style={[
                        styles.cell,
                        styles.colCategory,
                        styles.courseTotalLabel,
                      ]}
                    >
                      COURSE TOTAL
                    </Text>
                    <Text style={[styles.cell, styles.colItem]}></Text>
                    <Text style={[styles.cell, styles.colWeight]}></Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.colValue,
                        styles.courseTotalValue,
                      ]}
                    >
                      {(() => {
                        const totalGrade = grades.find((g) =>
                          isTotal(g.gradeKind)
                        );
                        return totalGrade ? totalGrade.grade.toFixed(1) : "-";
                      })()}
                    </Text>
                    <Text style={[styles.cell, styles.colStatus]}></Text>
                  </View>
                )} */}
                {grades.length > 0 && (
                  <View style={styles.courseTotalRow}>
                    <Text style={[styles.cell, styles.colCategory]}>
                      AVERAGE
                    </Text>
                    <Text style={[styles.cell, styles.colItem]}></Text>
                    <Text style={[styles.cell, styles.colWeight]}></Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.colValue,
                        styles.courseTotalValue,
                      ]}
                    >
                      {(() => {
                        const totalGrade = grades.find((g) =>
                          isTotal(g.gradeKind)
                        );
                        return totalGrade ? totalGrade.grade.toFixed(1) : "-";
                      })()}
                    </Text>
                    <Text style={[styles.cell, styles.colStatus]}></Text>
                  </View>
                )}
                {grades.length > 0 && (
                  <View style={styles.courseTotalRow}>
                    <Text style={[styles.cell, styles.colCategory]}>
                      STATUS
                    </Text>
                    <Text style={[styles.cell, styles.colItem]}></Text>
                    <Text style={[styles.cell, styles.colWeight]}></Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.colValue,
                        isPass(
                          grades.find((g) => isTotal(g.gradeKind))?.gradeStatus
                        )
                          ? styles.passStatus
                          : styles.failStatus,
                        styles.courseTotalStatus,
                      ]}
                    >
                      {grades.find((g) => isTotal(g.gradeKind))?.gradeStatus ||
                        "N/A"}
                    </Text>
                    <Text style={[styles.cell, styles.colStatus]}></Text>
                  </View>
                )}
              </>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9FF",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 0,
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
  classSelectorContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  classList: {
    paddingHorizontal: 4,
    gap: 12,
  },
  classCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    minWidth: 140,
    marginRight: 12,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  classCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: "#F3F0FF",
  },
  classCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY,
    marginBottom: 4,
  },
  classCardTitleSelected: {
    fontWeight: "700",
  },
  classCardSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  classCardSubtitleSelected: {
    color: PRIMARY,
  },
  statusBadgeContainer: {
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  passBadge: {
    color: "#4CAF50",
    backgroundColor: "#E8F7EF",
  },
  failBadge: {
    color: "#D32F2F",
    backgroundColor: "#FDEAEA",
  },
  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "white",
    marginBottom: 18,
    elevation: 3,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 16,
  },
  infoColumn: {
    width: "48%",
  },
  label: {
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 6,
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  traineeInfoSection: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  traineeName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  traineeId: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    fontSize: 19,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  requirementLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: PRIMARY,
  },
  requirementValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  tableContainer: {
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 2,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: "white",
    fontWeight: "700",
    fontSize: 11,
    textAlign: "center",
  },
  colCategory: {
    flex: 1.2,
  },
  colItem: {
    flex: 1.5,
  },
  colWeight: {
    width: 70,
  },
  colValue: {
    width: 60,
  },
  colStatus: {
    width: 70,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "white",
  },
  categoryTotalRow: {
    backgroundColor: "#F9F9F9",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  courseTotalRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "#F3F0FF",
  },
  cell: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  categoryCell: {
    fontWeight: "600",
    color: PRIMARY,
  },
  courseTotalLabel: {
    fontWeight: "700",
    color: PRIMARY,
    fontSize: 13,
  },
  courseTotalValue: {
    fontWeight: "700",
    color: PRIMARY,
    fontSize: 13,
  },
  courseTotalStatus: {
    fontWeight: "700",
    fontSize: 13,
  },
  passStatus: {
    color: "#4CAF50",
  },
  failStatus: {
    color: "#D32F2F",
  },
  emptyRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },
});
