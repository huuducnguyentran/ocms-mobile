import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Checkbox,
  Text,
  TextInput,
  Menu,
} from "react-native-paper";
import { router } from "expo-router";
import courseService from "@/service/courseService";

interface Course {
  courseId: string;
  courseName: string;
  description: string;
  status: string;
}
const PRIMARY = "#3620AC";

export default function CoursePage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [statusFilter, search, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();

      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (err) {
      console.log("Error loading courses:", err);
    } finally {
      setLoading(false);
      setSelected([]);
    }
  };

  const filterCourses = () => {
    let data = courses;

    // Filter by status
    if (statusFilter) {
      data = data.filter((c) => c.status === statusFilter);
    }

    // Search filter
    if (search) {
      data = data.filter((c) =>
        `${c.courseId} ${c.courseName} ${c.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    setFilteredCourses(data);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApprove = async (id: string) => {
    try {
      await courseService.approveCourse(id);
      loadCourses();
    } catch (err) {
      console.log("Approve error:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await courseService.rejectCourse(id);
      loadCourses();
    } catch (err) {
      console.log("Reject error:", err);
    }
  };

  const handleApproveBatch = async () => {
    try {
      await courseService.approveCourseBatch(selected);
      loadCourses();
    } catch (e) {
      console.log("Batch approve error:", e);
    }
  };

  const handleRejectBatch = async () => {
    try {
      await courseService.rejectCourseBatch(selected);
      loadCourses();
    } catch (e) {
      console.log("Batch reject error:", e);
    }
  };

  // Status style FIX (text supporting backgroundColor)
  const getStatusStyle = (status: string): TextStyle => ({
    backgroundColor:
      status === "Approved"
        ? "#2ecc71"
        : status === "Rejected"
        ? "#e74c3c"
        : "#f1c40f",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    color: "white",
    fontWeight: "700" as TextStyle["fontWeight"],
    overflow: "hidden",
  });

  const renderCourse = ({ item }: { item: Course }) => (
    <Card style={styles.card}>
      <TouchableOpacity
      // onPress={() =>
      //   router.push({
      //     pathname: "/course_detail",
      //     params: { id: item.courseId },
      //   })
      // }
      >
        <Card.Title
          title={item.courseName}
          subtitle={`ID: ${item.courseId}`}
          right={() =>
            statusFilter === "Pending" ? (
              <Checkbox
                status={
                  selected.includes(item.courseId) ? "checked" : "unchecked"
                }
                onPress={() => toggleSelect(item.courseId)}
              />
            ) : null
          }
        />

        <Card.Content>
          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>

          <View style={styles.row}>
            <Text style={getStatusStyle(item.status)}>{item.status}</Text>
          </View>

          {statusFilter === "Pending" && (
            <View style={styles.actionRow}>
              <Button
                mode="contained"
                style={styles.approveBtn}
                onPress={() => handleApprove(item.courseId)}
              >
                Approve
              </Button>

              <Button
                mode="outlined"
                style={styles.rejectBtn}
                onPress={() => handleReject(item.courseId)}
              >
                Reject
              </Button>
            </View>
          )}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Courses" />

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="filter-variant"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => setStatusFilter("")} title="All Status" />
          <Menu.Item
            onPress={() => setStatusFilter("Pending")}
            title="Pending"
          />
          <Menu.Item
            onPress={() => setStatusFilter("Approved")}
            title="Approved"
          />
          <Menu.Item
            onPress={() => setStatusFilter("Rejected")}
            title="Rejected"
          />
        </Menu>
      </Appbar.Header>

      <View style={styles.container}>
        <TextInput
          mode="outlined"
          placeholder="Search courses..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {statusFilter === "Pending" && selected.length > 0 && (
          <View style={styles.batchActions}>
            <Button mode="contained" onPress={handleApproveBatch}>
              Approve Selected ({selected.length})
            </Button>

            <Button mode="outlined" onPress={handleRejectBatch}>
              Reject Selected ({selected.length})
            </Button>
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.courseId}
            renderItem={renderCourse}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadCourses} />
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F7FF", // Light background to match the purple palette
  },

  search: {
    marginBottom: 10,
  },

  card: {
    marginBottom: 12,
    borderRadius: 14,
    elevation: 3,
    backgroundColor: "white",
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY, // Purple accent
  },

  description: {
    marginTop: 4,
    opacity: 0.7,
  },

  row: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },

  approveBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: PRIMARY, // Purple approve button
  },

  rejectBtn: {
    flex: 1,
    marginLeft: 8,
    borderColor: PRIMARY,
  },

  batchActions: {
    marginBottom: 10,
    gap: 8,
  },
});
