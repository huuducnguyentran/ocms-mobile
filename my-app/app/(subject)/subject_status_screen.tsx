import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import subjectService from "@/service/subjectService";
import { Checkbox } from "react-native-paper";

/* ================= TYPES ================= */
type StatusType = "Pending" | "Approved" | "Rejected";

type Subject = {
  subjectId: string;
  subjectName: string;
  description: string;
  slot: number;
  minTotalScore: number;
  isCertificated: boolean;
  status: StatusType;
};

const PRIMARY = "#3620AC";

/* ================= SCREEN ================= */
export default function SubjectStatusScreen() {
  const [status, setStatus] = useState<StatusType>("Pending");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */
  const loadSubjects = async () => {
    try {
      setLoading(true);

      // 🔥 IMPORTANT FIX: TRIM STATUS
      const cleanStatus = status.trim();

      const res = await subjectService.getSubjectsByStatus(cleanStatus);

      if (res?.success && Array.isArray(res.data)) {
        setSubjects(res.data);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error("Load subjects failed:", err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
    setSelectedIds([]);
  }, [status]);

  /* ================= SELECT ================= */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ================= ACTIONS ================= */
  const approveBatch = async () => {
    if (!selectedIds.length) return;
    await subjectService.approveSubjectBatch(selectedIds);
    loadSubjects();
  };

  const rejectBatch = async () => {
    if (!selectedIds.length) return;
    await subjectService.rejectSubjectBatch(selectedIds);
    loadSubjects();
  };

  const approveSingle = async (id: string) => {
    await subjectService.approveSubject(id);
    loadSubjects();
  };

  const rejectSingle = async (id: string) => {
    await subjectService.rejectSubject(id);
    loadSubjects();
  };

  /* ================= RENDER ================= */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject Status</Text>

      {/* ===== STATUS TABS ===== */}
      <View style={styles.tabsWrapper}>
        {(["Pending", "Approved", "Rejected"] as StatusType[]).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatus(s)}
            style={[
              styles.tabButton,
              status === s && { backgroundColor: PRIMARY },
            ]}
          >
            <Text
              style={[styles.tabText, status === s && styles.tabTextActive]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== BATCH ACTIONS ===== */}
      {status === "Pending" && subjects.length > 0 && (
        <View style={styles.batchWrapper}>
          <TouchableOpacity
            style={[styles.batchButton, { backgroundColor: PRIMARY }]}
            onPress={approveBatch}
          >
            <Text style={styles.batchText}>Approve Selected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.batchButton, { backgroundColor: "#E53935" }]}
            onPress={rejectBatch}
          >
            <Text style={styles.batchText}>Reject Selected</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== LIST ===== */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={PRIMARY}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.subjectId}
          contentContainerStyle={{ paddingTop: 10 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No subjects found</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {status === "Pending" && (
                  <Checkbox
                    status={
                      selectedIds.includes(item.subjectId)
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => toggleSelect(item.subjectId)}
                  />
                )}

                <View>
                  <Text style={styles.cardTitle}>{item.subjectName}</Text>
                  <Text style={styles.cardSubtitle}>{item.subjectId}</Text>
                </View>
              </View>

              <Text style={styles.cardDesc}>{item.description}</Text>

              {status === "Pending" && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: PRIMARY }]}
                    onPress={() => approveSingle(item.subjectId)}
                  >
                    <Text style={styles.actionText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#E53935" }]}
                    onPress={() => rejectSingle(item.subjectId)}
                  >
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 12,
  },

  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#EFEAFE",
    padding: 6,
    borderRadius: 10,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  batchWrapper: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },
  batchButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  batchText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#FAFAFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  cardDesc: {
    fontSize: 14,
    color: "#374151",
    marginTop: 6,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
  },
});
