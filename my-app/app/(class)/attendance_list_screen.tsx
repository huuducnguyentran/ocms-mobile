import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getAttendanceByClassId,
  AttendanceRecord,
} from "@/service/attendanceService";
import {
  getMyClassById,
  MyClassDetail,
  getMyClasses,
  MyClass,
} from "@/service/classService";

const PRIMARY = "#3620AC";

export default function AttendanceListScreen() {
  const { classId: paramClassId } = useLocalSearchParams<{
    classId?: string;
  }>();
  const router = useRouter();

  const [classes, setClasses] = useState<MyClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    paramClassId ? Number(paramClassId) : null
  );
  const [classDetails, setClassDetails] = useState<
    Record<number, MyClassDetail>
  >({});
  const [attendances, setAttendances] = useState<
    Record<number, AttendanceRecord[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedClassId && !classDetails[selectedClassId]) {
      loadClassData(selectedClassId);
    }
  }, [selectedClassId]);

  const loadAllData = async () => {
    setLoading(true);
    const res = await getMyClasses();
    if (res.success) {
      setClasses(res.data);
      if (res.data.length > 0) {
        const firstClassId = res.data[0].classId;
        setSelectedClassId(firstClassId);
        // Load first class data
        await loadClassData(firstClassId);
      }
    }
    setLoading(false);
  };

  const loadClassData = async (classId: number) => {
    const classRes = await getMyClassById(classId);
    if (classRes.success) {
      setClassDetails((prev) => ({ ...prev, [classId]: classRes.data }));
    }

    const attRes = await getAttendanceByClassId(classId);
    if (attRes.success) {
      setAttendances((prev) => ({ ...prev, [classId]: attRes.data }));
    }
  };

  const selectedClass = classes.find((c) => c.classId === selectedClassId);
  const classDetail = selectedClassId ? classDetails[selectedClassId] : null;
  const attendance = selectedClassId ? attendances[selectedClassId] || [] : [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  // Calculate attendance stats
  const totalSessions = attendance.length;
  const presentCount = attendance.filter(
    (a) => a.statusDisplay === "Present"
  ).length;
  const absentCount = totalSessions - presentCount;
  const absentPercentage =
    totalSessions > 0 ? (absentCount / totalSessions) * 100 : 0;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Status</Text>
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
              return (
                <TouchableOpacity
                  style={[
                    styles.classCard,
                    isSelected && styles.classCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedClassId(item.classId);
                    if (!classDetails[item.classId]) {
                      loadClassData(item.classId);
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
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* ATTENDANCE TABLE */}
      <View style={styles.tableContainer}>
        {/* TABLE HEADER */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colNo]}>NO.</Text>
          <Text style={[styles.headerCell, styles.colDate]}>DATE</Text>
          <Text style={[styles.headerCell, styles.colSlot]}>SLOT</Text>
          {classDetail && (
            <>
              <Text style={[styles.headerCell, styles.colLecturer]}>
                LECTURER
              </Text>
              {/* <Text style={[styles.headerCell, styles.colGroup]}>
                GROUP NAME
              </Text> */}
            </>
          )}
          <Text style={[styles.headerCell, styles.colStatus]}>STATUS</Text>
        </View>

        {/* TABLE ROWS */}
        {attendance.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No attendance recorded yet.</Text>
          </View>
        ) : (
          attendance.map((a, index) => {
            const statusColor =
              a.statusDisplay === "Present"
                ? "#4CAF50"
                : a.statusDisplay === "Absent"
                ? "#D32F2F"
                : "#F57C00";

            return (
              <View key={a.attendanceId} style={styles.tableRow}>
                <Text style={[styles.cell, styles.colNo]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.colDate]}>
                  {new Date(a.date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
                <Text style={[styles.cell, styles.colSlot]}>{a.slot}</Text>
                {classDetail && (
                  <>
                    <Text style={[styles.cell, styles.colLecturer]}>
                      {classDetail.instructorName}
                    </Text>
                    {/* <Text style={[styles.cell, styles.colGroup]}>
                      {classDetail.classGroupCode}
                    </Text> */}
                  </>
                )}
                <Text
                  style={[
                    styles.cell,
                    styles.colStatus,
                    { color: statusColor, fontWeight: "600" },
                  ]}
                >
                  {a.statusDisplay}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* SUMMARY */}
      {totalSessions > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            ABSENT: {absentPercentage.toFixed(0)}% ABSENT SO FAR ({absentCount}{" "}
            ABSENT ON {totalSessions} TOTAL).
          </Text>
        </View>
      )}
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
  classSelectorContainer: {
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
  },
  classCardSubtitleSelected: {
    color: PRIMARY,
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: 12,
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
    fontSize: 12,
    textAlign: "center",
  },
  colNo: {
    width: 40,
  },
  colDate: {
    flex: 1.2,
  },
  colSlot: {
    width: 50,
  },
  colLecturer: {
    flex: 1,
  },
  colGroup: {
    flex: 1,
  },
  colStatus: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "white",
  },
  cell: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  emptyRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },
  summary: {
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
});
