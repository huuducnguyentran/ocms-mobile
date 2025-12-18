// app/course.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Checkbox,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import courseService, { Course } from "@/service/courseService";

const PRIMARY = "#3620AC";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"];
const PAGE_SIZE_OPTIONS = [10, 20, 30];

export default function CoursePage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);

  const [pageSizeMenuVisible, setPageSizeMenuVisible] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [page, pageSize]);

  useEffect(() => {
    applyFilter();
  }, [search, statusFilter, courses]);

  /* ================= LOAD ================= */
  const loadCourses = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * pageSize;
      const res = await courseService.getAllCourses(skip, pageSize);

      if (res.success) {
        setCourses(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } finally {
      setLoading(false);
      setSelected([]);
    }
  };

  /* ================= FILTER ================= */
  const applyFilter = () => {
    let data = courses;

    if (statusFilter !== "All") {
      data = data.filter((c) => c.status === statusFilter);
    }

    if (search) {
      data = data.filter((c) =>
        `${c.courseName} ${c.courseId} ${c.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    setFilteredCourses(data);
  };

  /* ================= SELECT ================= */
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ================= STATUS TAG ================= */
  const getStatusTagStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return styles.approvedTag;
      case "Rejected":
        return styles.rejectedTag;
      default:
        return styles.pendingTag;
    }
  };

  /* ================= RENDER ================= */
  const renderCourse = ({ item }: { item: Course }) => {
    const isPending = item.status === "Pending";

    return (
      <Card style={styles.card}>
        <Card.Title
          title={item.courseName}
          subtitle={`ID: ${item.courseId}`}
          titleStyle={styles.cardTitle}
          subtitleStyle={styles.cardSubtitle}
          right={() => (
            <Checkbox
              status={
                selected.includes(item.courseId) ? "checked" : "unchecked"
              }
              disabled={!isPending}
              onPress={() => toggleSelect(item.courseId)}
            />
          )}
        />

        <Card.Content>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.footerRow}>
            <View style={[styles.statusTag, getStatusTagStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Courses" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        {/* ================= SEARCH ================= */}
        <TextInput
          mode="outlined"
          placeholder="Search courses..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          outlineColor={PRIMARY}
          activeOutlineColor={PRIMARY}
        />

        {/* ================= STATUS FILTER ================= */}
        <View style={styles.filterRow}>
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              mode={statusFilter === status ? "contained" : "outlined"}
              onPress={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              style={styles.filterBtn}
              buttonColor={statusFilter === status ? PRIMARY : undefined}
              textColor={statusFilter === status ? "white" : PRIMARY}
            >
              {status}
            </Button>
          ))}
        </View>

        {/* ================= PAGE SIZE DROPDOWN ================= */}
        <View style={styles.pageSizeRow}>
          <Text style={styles.pageSizeLabel}>Rows per page</Text>

          <Menu
            visible={pageSizeMenuVisible}
            onDismiss={() => setPageSizeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setPageSizeMenuVisible(true)}
                icon="chevron-down"
                textColor={PRIMARY}
                style={styles.pageSizeDropdown}
              >
                {pageSize}
              </Button>
            }
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <Menu.Item
                key={size}
                title={`${size}`}
                onPress={() => {
                  setPageSize(size);
                  setPage(1);
                  setPageSizeMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        {/* ================= LIST ================= */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={PRIMARY}
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            <FlatList
              data={filteredCourses}
              keyExtractor={(item) => item.courseId}
              renderItem={renderCourse}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={loadCourses}
                  colors={[PRIMARY]}
                />
              }
            />

            {/* ================= PAGINATION ================= */}
            <View style={styles.pagination}>
              <Button
                mode="outlined"
                disabled={page === 1}
                onPress={() => setPage((p) => p - 1)}
                textColor={PRIMARY}
              >
                Previous
              </Button>

              <Text style={styles.pageText}>
                Page {page} / {totalPages}
              </Text>

              <Button
                mode="outlined"
                disabled={page === totalPages}
                onPress={() => setPage((p) => p + 1)}
                textColor={PRIMARY}
              >
                Next
              </Button>
            </View>
          </>
        )}
      </View>
    </>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  appbar: {
    backgroundColor: "white",
    elevation: 2,
  },
  appbarTitle: {
    color: PRIMARY,
    fontWeight: "800",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F3FF",
  },
  search: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    borderRadius: 20,
  },

  /* ===== PAGE SIZE ===== */
  pageSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  pageSizeLabel: {
    fontWeight: "700",
    color: "#2D2A6E",
  },
  pageSizeBtn: {
    borderRadius: 16,
  },

  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "white",
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY,
  },
  cardTitle: {
    fontWeight: "700",
    color: "#1E1B4B", // darker purple/ink
  },

  cardSubtitle: {
    color: "#4B5563", // slate-600
  },

  description: {
    color: "#374151", // slate-700 (much darker than opacity)
    marginBottom: 8,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* ===== STATUS TAG ===== */
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  pendingTag: {
    backgroundColor: "#F1C40F",
  },
  approvedTag: {
    backgroundColor: "#2ECC71",
  },
  rejectedTag: {
    backgroundColor: "#E74C3C",
  },

  /* ===== PAGINATION ===== */
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  pageText: {
    fontWeight: "800",
    color: "#2D2A6E",
  },

  pageSizeDropdown: {
    borderRadius: 12,
    borderColor: PRIMARY,
  },
});
