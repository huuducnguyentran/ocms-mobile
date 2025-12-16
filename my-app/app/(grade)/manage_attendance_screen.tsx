import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Menu, Icon, Provider, RadioButton, Button } from "react-native-paper";

import {
  addAttendance,
  getAttendanceByClassAndSlot,
  updateAttendance,
} from "@/service/attendanceService";
import { getMyClasses } from "@/service/classService";

const PRIMARY = "#3620AC";
const LIGHT_PRIMARY = "#ECE9FF";
const SUCCESS = "#27ae60";
const DANGER = "#c0392b";

const STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
};

export default function AttendancePage() {
  const [slot, setSlot] = useState(1);
  const [classId, setClassId] = useState<number | null>(null);

  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  /* ================= LOAD ================= */

  const loadMyClasses = async () => {
    const res = await getMyClasses();
    if (res.success) {
      setMyClasses(res.data);
      if (!classId && res.data.length > 0) {
        setClassId(res.data[0].classId);
      }
    }
  };

  const loadAttendance = async () => {
    if (!classId) return;
    setLoading(true);
    const res = await getAttendanceByClassAndSlot(classId, slot);
    if (res.success) {
      setAttendanceList(res.data);

      // init draft state
      const map: Record<string, string> = {};
      res.data.forEach((r: any) => {
        map[r.traineeAssignationId] = r.status || STATUS.ABSENT;
      });
      setDraftStatus(map);
    } else {
      Alert.alert("Error", res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMyClasses();
  }, []);

  useEffect(() => {
    if (classId) loadAttendance();
  }, [classId, slot]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendance();
    setRefreshing(false);
  };

  /* ================= SAVE ================= */

  const saveAttendance = async () => {
    try {
      for (const record of attendanceList) {
        const status = draftStatus[record.traineeAssignationId];

        if (!record.attendanceId) {
          await addAttendance({
            traineeAssignationId: record.traineeAssignationId,
            slot,
            status,
          });
        } else {
          await updateAttendance(record.attendanceId, { status });
        }
      }

      Alert.alert("Success", "Attendance saved successfully");
      loadAttendance();
    } catch (err) {
      Alert.alert("Error", "Failed to save attendance");
    }
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = (item: any) => (
    <View key={item.traineeAssignationId} style={styles.card}>
      <View style={styles.leftCol}>
        <Text style={styles.name}>
          {item.traineeName} ({item.traineeId})
        </Text>

        <View style={styles.radioRow}>
          <RadioButton
            value={STATUS.PRESENT}
            status={
              draftStatus[item.traineeAssignationId] === STATUS.PRESENT
                ? "checked"
                : "unchecked"
            }
            onPress={() =>
              setDraftStatus((p) => ({
                ...p,
                [item.traineeAssignationId]: STATUS.PRESENT,
              }))
            }
            color={PRIMARY}
          />
          <Text style={styles.radioText}>Present</Text>

          <RadioButton
            value={STATUS.ABSENT}
            status={
              draftStatus[item.traineeAssignationId] === STATUS.ABSENT
                ? "checked"
                : "unchecked"
            }
            onPress={() =>
              setDraftStatus((p) => ({
                ...p,
                [item.traineeAssignationId]: STATUS.ABSENT,
              }))
            }
            color={PRIMARY}
          />
          <Text style={styles.radioText}>Absent</Text>
        </View>
      </View>

      <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
    </View>
  );

  /* ================= SLOTS ================= */

  const selectedClass = myClasses.find((c) => c.classId === classId);

  const renderSlots = () => {
    if (!selectedClass) return null;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array.from({ length: selectedClass.slot }, (_, i) => i + 1).map(
          (s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.slotButton,
                slot === s ? styles.slotActive : styles.slotInactive,
              ]}
              onPress={() => setSlot(s)}
            >
              <Text
                style={
                  slot === s ? styles.slotTextActive : styles.slotTextInactive
                }
              >
                Slot {s}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    );
  };

  /* ================= UI ================= */

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Attendance</Text>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.classSelector}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={styles.classText}>
                  {selectedClass
                    ? `${selectedClass.classId} – ${selectedClass.subjectName}`
                    : "Select Class"}
                </Text>
                <Icon source="chevron-down" size={20} color={PRIMARY} />
              </TouchableOpacity>
            }
          >
            {myClasses.map((c) => (
              <Menu.Item
                key={c.classId}
                title={`${c.classId} – ${c.subjectName}`}
                onPress={() => {
                  setClassId(c.classId);
                  setMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.body}
        >
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY} />
          ) : (
            attendanceList.map(renderItem)
          )}
        </ScrollView>

        {/* ===== FOOTER ACTIONS ===== */}
        <View style={styles.footer}>
          <Button mode="outlined" onPress={onRefresh}>
            Refresh
          </Button>

          <Button
            mode="contained"
            onPress={saveAttendance}
            style={{ backgroundColor: PRIMARY }}
          >
            Save Attendance
          </Button>
        </View>

        <View style={styles.slotContainer}>{renderSlots()}</View>
      </View>
    </Provider>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 20,
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
  },

  classSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "space-between",
  },

  classText: { fontWeight: "600", color: PRIMARY },

  body: { flex: 1, padding: 16 },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
  },

  leftCol: { flex: 1 },

  name: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioText: {
    marginRight: 12,
    fontWeight: "500",
  },

  dateText: {
    position: "absolute",
    right: 16,
    top: 16,
    fontSize: 12,
    opacity: 0.6,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
  },

  slotContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
  },

  slotButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 8,
  },

  slotActive: { backgroundColor: PRIMARY },
  slotInactive: { backgroundColor: LIGHT_PRIMARY },

  slotTextActive: { color: "white", fontWeight: "700" },
  slotTextInactive: { color: PRIMARY, fontWeight: "600" },
});
