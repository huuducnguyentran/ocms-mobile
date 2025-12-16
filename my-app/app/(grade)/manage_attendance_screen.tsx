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
import { Menu, Icon, Provider } from "react-native-paper";

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

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);

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
    if (res.success) setAttendanceList(res.data);
    else Alert.alert("Error", res.message);
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

  const handleStatusChange = async (record: any, status: string) => {
    if (!record.attendanceId) {
      const res = await addAttendance({
        traineeAssignationId: record.traineeAssignationId,
        slot,
        status,
      });
      if (!res.success) return Alert.alert("Error", res.message);
    } else {
      const res = await updateAttendance(record.attendanceId, { status });
      if (!res.success) return Alert.alert("Error", res.message);
    }
    loadAttendance();
  };

  const renderItem = (item: any) => (
    <View key={item.traineeAssignationId} style={styles.card}>
      <View style={styles.leftCol}>
        <Text style={styles.name}>{item.traineeName}</Text>
        <Text style={styles.subText}>ID: {item.traineeId || "--"}</Text>
      </View>

      <View style={styles.rightCol}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === STATUS.PRESENT ? SUCCESS : DANGER,
            },
          ]}
        >
          <Text style={styles.badgeText}>{item.status || "Absent"}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.greenBtn]}
            onPress={() => handleStatusChange(item, STATUS.PRESENT)}
          >
            <Icon source="check" size={22} color={SUCCESS} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.redBtn]}
            onPress={() => handleStatusChange(item, STATUS.ABSENT)}
          >
            <Icon source="close" size={22} color={DANGER} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const selectedClass = myClasses.find((c) => c.classId === classId);

  const renderSlots = () => {
    if (!selectedClass) return null;

    const totalSlots = selectedClass.slot;
    const slotArray = Array.from({ length: totalSlots }, (_, i) => i + 1);

    const isScrollable = totalSlots > 5;

    return (
      <ScrollView
        horizontal={isScrollable}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.slotBar,
          isScrollable && { paddingHorizontal: 10 },
        ]}
      >
        {slotArray.map((s) => (
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
        ))}
      </ScrollView>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Header */}
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
                  {classId
                    ? (() => {
                        const selected = myClasses.find(
                          (c) => c.classId === classId
                        );
                        return `${selected.classId} – ${selected.subjectId} – ${selected.subjectName}`;
                      })()
                    : "Select Class"}
                </Text>
                <Icon source="chevron-down" size={20} color={PRIMARY} />
              </TouchableOpacity>
            }
            contentStyle={{ maxHeight: 300 }} // 👈 FIX overflow on mobile
          >
            {myClasses.map((c) => (
              <Menu.Item
                key={c.classId}
                title={`${c.classId} – ${c.subjectId} – ${c.subjectName}`}
                onPress={() => {
                  setClassId(c.classId);
                  setMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        {/* Body */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.body}
        >
          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={PRIMARY} />
            </View>
          ) : attendanceList.length === 0 ? (
            <Text style={styles.emptyText}>No attendance found.</Text>
          ) : (
            attendanceList.map(renderItem)
          )}
        </ScrollView>

        {/* Slots */}
        <View style={styles.slotContainer}>{renderSlots()}</View>
      </View>
    </Provider>
  );
}

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
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "white",
    borderRadius: 12,
    width: "70%",
    justifyContent: "space-between",
  },

  classText: { fontSize: 15, fontWeight: "600", color: PRIMARY },

  body: { flex: 1, padding: 15 },

  loaderBox: { marginTop: 40, alignItems: "center" },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.6,
    fontSize: 16,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 1,
  },

  leftCol: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700", color: "#333" },
  subText: { fontSize: 13, opacity: 0.6, marginTop: 4 },

  rightCol: { alignItems: "flex-end" },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  badgeText: { color: "white", fontSize: 13, fontWeight: "700" },

  actionRow: { flexDirection: "row", marginTop: 10 },

  actionBtn: {
    padding: 10,
    borderRadius: 12,
    marginLeft: 8,
  },

  greenBtn: { backgroundColor: "#eafaf1" },
  redBtn: { backgroundColor: "#fdecea" },

  slotContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    paddingBottom: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  slotButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  slotActive: { backgroundColor: PRIMARY },
  slotInactive: { backgroundColor: LIGHT_PRIMARY },

  slotTextActive: { color: "white", fontWeight: "700" },
  slotTextInactive: { color: PRIMARY, fontWeight: "600" },
  slotBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8, // 👈 nicely spaces buttons when scrolling
  },
});
