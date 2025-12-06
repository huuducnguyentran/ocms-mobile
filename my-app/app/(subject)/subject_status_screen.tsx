import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import subjectService from "@/service/subjectService";
import { Checkbox } from "react-native-paper";

type Subject = {
  subjectId: string;
  subjectName: string;
  description: string;
  slot: number;
  minTotalScore: number;
  isCertificated: boolean;
  status: string;
};

export default function SubjectStatusScreen() {
  const [status, setStatus] = useState<"Pending" | "Approved" | "Rejected">(
    "Pending"
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const color = "#3620AC";

  const loadSubjects = async () => {
    const res = await subjectService.getSubjectsByStatus(status);
    if (res?.success && Array.isArray(res.data)) {
      setSubjects(res.data);
    }
  };

  useEffect(() => {
    loadSubjects();
    setSelectedIds([]);
  }, [status]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color }]}>Subject Status</Text>

      {/* Status Tabs */}
      <View style={styles.tabsWrapper}>
        {["Pending", "Approved", "Rejected"].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatus(s as any)}
            style={[
              styles.tabButton,
              status === s && { backgroundColor: color },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                status === s && { color: "#fff", fontWeight: "bold" },
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Batch Buttons */}
      {status === "Pending" && subjects.length > 0 && (
        <View style={styles.batchWrapper}>
          <TouchableOpacity
            style={[styles.batchButton, { backgroundColor: color }]}
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

      {/* List */}
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.subjectId}
        contentContainerStyle={{ paddingTop: 10 }}
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
                  style={[styles.actionBtn, { backgroundColor: color }]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
  },

  /* Tabs */
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#EFEFEF",
    padding: 6,
    borderRadius: 8,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  tabText: {
    color: "#444",
    fontSize: 15,
  },

  /* Batch buttons */
  batchWrapper: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },
  batchButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  batchText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  /* Cards */
  card: {
    backgroundColor: "#FAFAFA",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#777",
  },

  cardDesc: {
    fontSize: 14,
    color: "#555",
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
    borderRadius: 6,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
