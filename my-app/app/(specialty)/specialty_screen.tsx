import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Divider,
  TextInput,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { getAllSpecialty, Specialty } from "@/service/specialtyService";

const BRAND = "#3620AC";

const SpecialtyScreen: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= LOAD ================= */
  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    setLoading(true);
    const res = await getAllSpecialty();
    if (res.success) {
      setSpecialties(res.data);
    }
    setLoading(false);
  };

  /* ================= FILTER ================= */
  const filteredSpecialties = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return specialties;

    return specialties.filter(
      (sp) =>
        sp.specialtyId.toLowerCase().includes(q) ||
        sp.specialtyName.toLowerCase().includes(q)
    );
  }, [search, specialties]);

  /* ================= RENDER ================= */
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Specialties</Text>
      <Text style={styles.subtitle}>Training & certification specialties</Text>

      {/* ===== SEARCH BAR ===== */}
      <TextInput
        mode="outlined"
        placeholder="Search by ID or name..."
        value={search}
        onChangeText={setSearch}
        left={
          <TextInput.Icon
            icon={() => <Ionicons name="search" size={18} color={BRAND} />}
          />
        }
        style={styles.searchInput}
        outlineColor={BRAND}
        activeOutlineColor={BRAND}
      />

      {loading && (
        <ActivityIndicator animating color={BRAND} style={{ marginTop: 24 }} />
      )}

      {!loading &&
        filteredSpecialties.map((sp) => (
          <Card key={sp.specialtyId} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="school-outline" size={22} color={BRAND} />
              <Text style={styles.cardTitle}>{sp.specialtyName}</Text>
            </View>

            <Divider style={{ marginVertical: 10 }} />

            <Text style={styles.code}>Code: {sp.specialtyId}</Text>

            <Text style={styles.description}>{sp.description}</Text>

            <Text style={styles.date}>
              Created at: {new Date(sp.createdAt).toLocaleDateString()}
            </Text>
          </Card>
        ))}

      {!loading && filteredSpecialties.length === 0 && (
        <Text style={styles.empty}>No specialties found</Text>
      )}
    </ScrollView>
  );
};

export default SpecialtyScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: BRAND,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 16,
  },

  /* ===== SEARCH ===== */
  searchInput: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },

  /* ===== CARD ===== */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },

  code: {
    fontSize: 13,
    fontWeight: "500",
    color: BRAND,
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
  },

  date: {
    fontSize: 12,
    color: "#64748b",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748b",
  },
});
