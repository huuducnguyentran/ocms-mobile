import {
  approvePlan,
  approvePlansBatch,
  getPlansByStatus,
  rejectPlan,
  rejectPlansBatch,
  TrainingPlan,
} from "@/service/planService";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Checkbox } from "react-native-paper";

export default function PlanStatusScreen() {
  const [status, setStatus] = useState<"Pending" | "Approved" | "Rejected">(
    "Pending"
  );
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const primary = "#3620AC";

  const loadPlans = async () => {
    setLoading(true);
    const res = await getPlansByStatus(status);
    if (res?.success && Array.isArray(res.data)) {
      setPlans(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
    setSelectedIds([]);
  }, [status]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const approveBatch = async () => {
    if (!selectedIds.length) return;
    const res = await approvePlansBatch(selectedIds);
    res?.success
      ? Alert.alert("Success", "Plans approved!")
      : Alert.alert("Error", "Approval failed.");
    loadPlans();
  };

  const rejectBatch = async () => {
    if (!selectedIds.length) return;
    const res = await rejectPlansBatch(selectedIds);
    res?.success
      ? Alert.alert("Success", "Plans rejected!")
      : Alert.alert("Error", "Rejection failed.");
    loadPlans();
  };

  const approveSingle = async (id: string) => {
    const res = await approvePlan(id);
    res?.success
      ? Alert.alert("Success", "Plan approved!")
      : Alert.alert("Error", "Failed.");
    loadPlans();
  };

  const rejectSingle = async (id: string) => {
    const res = await rejectPlan(id);
    res?.success
      ? Alert.alert("Success", "Plan rejected!")
      : Alert.alert("Error", "Failed.");
    loadPlans();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan Status</Text>

      {/* Status Selector */}
      <View style={styles.statusRow}>
        {["Pending", "Approved", "Rejected"].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatus(s as any)}
            style={[
              styles.statusPill,
              status === s && { backgroundColor: primary },
            ]}
          >
            <Text
              style={[styles.statusPillText, status === s && { color: "#fff" }]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Batch Actions */}
      {status === "Pending" && plans.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: primary }]}
            onPress={approveBatch}
          >
            <Text style={styles.actionBtnText}>Approve Selected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#D23636" }]}
            onPress={rejectBatch}
          >
            <Text style={styles.actionBtnText}>Reject Selected</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.planId}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Checkbox */}
              {status === "Pending" && (
                <Checkbox
                  status={
                    selectedIds.includes(item.planId) ? "checked" : "unchecked"
                  }
                  onPress={() => toggleSelect(item.planId)}
                  color={primary}
                />
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.planName}</Text>
                <Text style={styles.cardSubtitle}>ID: {item.planId}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <Text style={styles.cardDate}>
                  Created: {new Date(item.createdAt).toLocaleString()}
                </Text>

                {status === "Pending" && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: primary }]}
                      onPress={() => approveSingle(item.planId)}
                    >
                      <Text style={styles.smallBtnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: "#D23636" }]}
                      onPress={() => rejectSingle(item.planId)}
                    >
                      <Text style={styles.smallBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#F9F9FF",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#3620AC",
  },

  statusRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },

  statusPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ECEBFF",
  },

  statusPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3620AC",
  },

  divider: {
    height: 1,
    backgroundColor: "#DDD",
    marginVertical: 16,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },

  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
  },

  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  cardDesc: {
    fontSize: 14,
    color: "#444",
    marginTop: 6,
  },

  cardDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  smallBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
