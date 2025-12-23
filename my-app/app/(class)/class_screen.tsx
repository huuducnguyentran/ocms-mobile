import { getMyClasses, MyClass } from "@/service/classService";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Card, Searchbar, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY = "#3620AC";

export default function MyClassScreen() {
  const router = useRouter();

  const [classes, setClasses] = useState<MyClass[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const res = await getMyClasses();
    if (res.success) {
      setClasses(res.data);
      setFiltered(res.data);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);

    if (text.trim() === "") {
      setFiltered(classes);
      return;
    }

    const lower = text.toLowerCase();
    const results = classes.filter(
      (c) =>
        c.subjectName.toLowerCase().includes(lower) ||
        c.subjectId.toLowerCase().includes(lower) ||
        c.classGroupCode.toLowerCase().includes(lower)
    );
    setFiltered(results);
  };

  const renderClass = ({ item }: { item: MyClass }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(class)/class_info_screen",
          params: { classId: String(item.classId) },
        })
      }
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subjectName}>{item.subjectName}</Text>
            <Text style={styles.subjectId}>{item.subjectId}</Text>
            <Text style={styles.instructor}>
              Instructor: {item.instructorName}
            </Text>

            <Chip style={styles.groupChip} textStyle={{ color: "white" }}>
              Group: {item.classGroupCode}
            </Chip>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.slotLabel}>Slot</Text>
            <Text style={styles.slotNumber}>{item.slot}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Classes</Text>
        </View>

        <Searchbar
          placeholder="Search class..."
          value={search}
          onChangeText={handleSearch}
          style={styles.searchBar}
        />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.classId.toString()}
        renderItem={renderClass}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF9FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF9FF",
    padding: 14,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY,
    flex: 1,
  },
  searchBar: {
    marginBottom: 14,
    borderRadius: 12,
    elevation: 2,
  },
  card: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E7F3",
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY,
  },
  subjectId: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginTop: 2,
  },
  instructor: {
    fontSize: 14,
    marginTop: 8,
    color: "#444",
  },
  groupChip: {
    backgroundColor: PRIMARY,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777",
  },
  slotNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY,
    marginTop: 2,
  },
});
