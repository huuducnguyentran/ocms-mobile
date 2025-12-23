import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Checkbox } from "react-native-paper";
import {
  approvePlan,
  approvePlansBatch,
  getPlansByStatus,
  rejectPlan,
  rejectPlansBatch,
  TrainingPlan,
} from "@/service/planService";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/* ================= CONSTANTS ================= */
const PRIMARY = "#3620AC";
const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
type StatusType = "Pending" | "Approved" | "Rejected";

/* ================= SCREEN ================= */
export default function PlanStatusScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusType>("Pending");
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* search + pagination */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  /* ================= LOAD ================= */
  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlansByStatus(status);
      setPlans(res?.success && Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
    setSelectedIds([]);
    setPage(1);
  }, [status]);

  /* ================= SEARCH ================= */
  const filteredPlans = useMemo(() => {
    if (!search.trim()) return plans;
    const q = search.toLowerCase();
    return plans.filter(
      (p) =>
        p.planName.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [plans, search]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredPlans.length / pageSize);

  const pagedPlans = filteredPlans.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ================= SELECT ================= */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ================= ACTIONS ================= */
  const approveBatch = async () => {
    if (!selectedIds.length) return;
    await approvePlansBatch(selectedIds);
    loadPlans();
  };

  const rejectBatch = async () => {
    if (!selectedIds.length) return;
    await rejectPlansBatch(selectedIds);
    loadPlans();
  };

  const approveSingle = async (id: string) => {
    await approvePlan(id);
    loadPlans();
  };

  const rejectSingle = async (id: string) => {
    await rejectPlan(id);
    loadPlans();
  };

  const handleBack = () => {
    // Navigate back to home tab
    router.replace("/(tabs)" as any);
  };

  /* ================= RENDER ================= */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.title}>Training Plan Status</Text>
        </View>

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

        {/* ===== SEARCH ===== */}
        <TextInput
          placeholder="Search plan name or description..."
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setPage(1);
          }}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
        />

        {/* ===== BATCH ACTIONS ===== */}
        {status === "Pending" && selectedIds.length > 0 && (
          <View style={styles.batchRow}>
            <TouchableOpacity
              style={[styles.batchBtn, { backgroundColor: PRIMARY }]}
              onPress={approveBatch}
            >
              <Text style={styles.batchText}>Approve Selected</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.batchBtn, { backgroundColor: "#DC2626" }]}
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
            data={pagedPlans}
            keyExtractor={(item) => item.planId}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No plans found</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                {status === "Pending" && (
                  <Checkbox
                    status={
                      selectedIds.includes(item.planId)
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => toggleSelect(item.planId)}
                    color={PRIMARY}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.planName}</Text>
                  <Text style={styles.cardSubtitle}>ID: {item.planId}</Text>

                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <Text style={styles.cardDate}>
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </Text>

                  {status === "Pending" && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.smallBtn, { backgroundColor: PRIMARY }]}
                        onPress={() => approveSingle(item.planId)}
                      >
                        <Text style={styles.smallBtnText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.smallBtn,
                          { backgroundColor: "#DC2626" },
                        ]}
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

        {/* ===== PAGINATION ===== */}
        <View style={styles.paginationRow}>
          <Text style={styles.paginationText}>
            Page {page} / {totalPages || 1}
          </Text>

          <View style={styles.paginationBtns}>
            <TouchableOpacity
              disabled={page === 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Text style={[styles.pageBtn, page === 1 && styles.disabled]}>
                Prev
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={page === totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <Text
                style={[styles.pageBtn, page === totalPages && styles.disabled]}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
    flex: 1,
  },

  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#EFEAFE",
    padding: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
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

  searchInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#111827",
  },

  batchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  batchBtn: {
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
    flexDirection: "row",
    backgroundColor: "#FAFAFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY,
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
  cardDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  smallBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  paginationText: {
    color: "#4B5563",
    fontWeight: "600",
  },
  paginationBtns: {
    flexDirection: "row",
    gap: 16,
  },
  pageBtn: {
    color: PRIMARY,
    fontWeight: "700",
  },
  disabled: {
    color: "#9CA3AF",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
  },
});
