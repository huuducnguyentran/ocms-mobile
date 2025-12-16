import {
  approvePlansBatch,
  getEnrollmentsByStatus,
  rejectPlansBatch,
} from "@/service/planService";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";

const PRIMARY = "#3620AC";
const LIGHT_BG = "#F3F1FF";
const BORDER = "#D6D2FF";

export default function PlanEnrollmentScreen() {
  const [status, setStatus] = useState(1); // default to On Going if needed
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [status]);

  const loadData = async () => {
    setLoading(true);
    const res = await getEnrollmentsByStatus(status);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApproveBatch = async () => {
    if (status !== 1) return; // prevent manual call
    if (selected.length === 0) return alert("No items selected");
    const res = await approvePlansBatch(selected);
    alert(res.success ? "Approved successfully" : res.message);
    loadData();
  };

  const handleRejectBatch = async () => {
    if (status !== 1) return;
    if (selected.length === 0) return alert("No items selected");
    const res = await rejectPlansBatch(selected);
    alert(res.success ? "Rejected successfully" : res.message);
    loadData();
  };

  const STATUS_MAP: any = {
    NotYet: { label: "Not Yet", color: "#808080" },
    Ongoing: { label: "On Going", color: "#3620AC" },
    Finished: { label: "Complete", color: "#0A7D00" },
    Certificated: { label: "Certificated", color: "#C18302" },
  };

  const filtered = data.filter(
    (item) =>
      item.traineeName.toLowerCase().includes(search.toLowerCase()) ||
      item.planName.toLowerCase().includes(search.toLowerCase()) ||
      item.planCode?.toLowerCase().includes(search.toLowerCase())
  );

  const StatusButton = ({ label, value }: { label: string; value: number }) => (
    <TouchableOpacity
      onPress={() => setStatus(value)}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: status === value ? PRIMARY : "#E3E0FA",
        marginRight: 10,
      }}
    >
      <Text
        style={{
          color: status === value ? "white" : PRIMARY,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: LIGHT_BG }}>
      {/* Title */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 16,
          color: PRIMARY,
        }}
      >
        Plan Enrollment
      </Text>

      {/* Status Filter */}
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <StatusButton label="Not Yet" value={0} />
        <StatusButton label="On Going" value={1} />
        <StatusButton label="Complete" value={2} />
        <StatusButton label="Certificated" value={3} />
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search trainee, plan or code..."
        value={search}
        onChangeText={setSearch}
        style={{
          padding: 12,
          backgroundColor: "white",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: BORDER,
          marginBottom: 18,
          fontSize: 16,
        }}
      />

      {/* Batch Actions - only visible when status = 1 */}
      {status === 1 && (
        <View style={{ flexDirection: "row", marginBottom: 18 }}>
          <TouchableOpacity
            onPress={handleApproveBatch}
            style={{
              flex: 1,
              backgroundColor: PRIMARY,
              padding: 12,
              borderRadius: 12,
              marginRight: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Approve Selected
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRejectBatch}
            style={{
              flex: 1,
              backgroundColor: "#D72638",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Reject Selected
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.traineePlanEnrollmentId}
          renderItem={({ item }) => {
            const badge = STATUS_MAP[item.status] || {
              label: "Unknown",
              color: "#999",
            };

            return (
              <TouchableOpacity
                onPress={() => toggleSelect(item.traineePlanEnrollmentId)}
                style={{
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 16,
                  backgroundColor: "white",
                  borderWidth: 2,
                  borderColor: selected.includes(item.traineePlanEnrollmentId)
                    ? PRIMARY
                    : BORDER,
                }}
              >
                <Text style={{ fontSize: 14, marginTop: 4, color: "#444" }}>
                  Code: {item.traineeId}
                </Text>

                {/* Name */}
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 16,
                    color: PRIMARY,
                  }}
                >
                  {item.traineeName}
                </Text>

                {/* Plan name */}
                <Text style={{ fontSize: 15, marginTop: 2 }}>
                  {item.planName}
                </Text>

                {/* Status badge */}
                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: badge.color,
                    alignSelf: "flex-start",
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 13 }}>
                    {badge.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
