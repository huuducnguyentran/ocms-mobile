// app/certificates/certificate_screen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import { useRouter } from "expo-router";

import {
  getAllCertificates,
  signCertificate,
  updateCertificateStatus,
} from "../../service/certificateService";
import { storage } from "@/utils/storage";

const PRIMARY = "#3620AC";

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Active",
  "Expired",
  "Revoked",
  "ChangeInformation",
];
const PAGE_SIZE_OPTIONS = [10, 20, 30];

export default function CertificateScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [pageSizeMenuVisible, setPageSizeMenuVisible] = useState(false);

  const isDirector = userRole === "Director";

  /* ================= SORT ================= */
  const sortCertificates = (data: any[]) => {
    const priority: any = { Pending: 1, Active: 2, Expired: 3, Revoked: 4 };
    return [...data].sort((a, b) => {
      const diff = (priority[a.status] || 99) - (priority[b.status] || 99);
      if (diff) return diff;
      const aDate = new Date(a.signDate || a.issueDate || 0);
      const bDate = new Date(b.signDate || b.issueDate || 0);
      return bDate.getTime() - aDate.getTime();
    });
  };

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * pageSize;
      const res = await getAllCertificates(skip, pageSize);

      if (res.success) {
        const sorted = sortCertificates(res.data.data);
        setCertificates(sorted);
        setTotalPages(res.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      loadData();
    }
  }, [page, pageSize, userRole]);

  const loadUserRole = async () => {
    try {
      const role = await storage.getItem("role");
      setUserRole(role);
    } catch (error) {
      console.error("Failed to load user role:", error);
    }
  };

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = certificates;

    if (statusFilter !== "All") {
      data = data.filter((c) => c.status === statusFilter);
    }

    if (search) {
      data = data.filter((c) =>
        `${c.certificateCode} ${c.userId}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [search, statusFilter, certificates]);

  /* ================= VIEW ================= */
  const handleView = async (item: any) => {
    try {
      // Navigate to certificate viewer screen
      router.push({
        pathname: "/(certificate)/certificate_viewer_screen",
        params: {
          certificateId: item.certificateId,
        },
      });
    } catch (error) {
      console.error("[CertificateScreen] Error navigating:", error);
      Alert.alert("Error", "Failed to open certificate viewer");
    }
  };

  /* ================= ACTIONS ================= */
  const handleSign = (id: string) => {
    Alert.alert("Confirm", "Sign this certificate?", [
      { text: "Cancel" },
      {
        text: "Sign",
        onPress: async () => {
          const res = await signCertificate(id);
          if (res.success) {
            Alert.alert("Success", res.message);
            loadData();
          }
        },
      },
    ]);
  };

  const confirmStatusUpdate = (item: any, status: string) => {
    Alert.alert("Update Status", `Change status to ${status}?`, [
      { text: "Cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          const res = await updateCertificateStatus(
            item.certificateId,
            status,
            status === "Revoked" ? "Revoked by Director" : ""
          );
          if (res.success) {
            Alert.alert("Success", res.message);
            loadData();
          }
        },
      },
    ]);
  };

  /* ================= STATUS TAG ================= */
  const getStatusTagStyle = (status: string) => {
    switch (status) {
      case "Active":
        return styles.activeTag;
      case "Expired":
        return styles.expiredTag;
      case "Revoked":
        return styles.revokedTag;
      case "ChangeInformation":
        return styles.changeInfoTag;
      default:
        return styles.pendingTag;
    }
  };

  /* ================= RENDER ================= */
  const renderItem = ({ item }: any) => {
    const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    };

    return (
      <Card style={styles.card} mode="outlined">
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text
                style={styles.cardTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.certificateCode || item.certificateId}
              </Text>
              <Text
                style={styles.cardSubtitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.userId}
                {item.issuedByUserId && ` • ${item.issuedByUserId}`}
              </Text>
            </View>
            <View style={[styles.statusTag, getStatusTagStyle(item.status)]}>
              <Text style={styles.statusText} numberOfLines={1}>
                {item.status}
              </Text>
            </View>
          </View>

          {(item.issueDate || item.signDate || item.expirationDate) && (
            <View style={styles.infoRow}>
              {item.issueDate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel} numberOfLines={1}>
                    Issue:
                  </Text>
                  <Text
                    style={styles.infoValue}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatDate(item.issueDate)}
                  </Text>
                </View>
              )}
              {item.signDate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel} numberOfLines={1}>
                    Signed:
                  </Text>
                  <Text
                    style={styles.infoValue}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatDate(item.signDate)}
                  </Text>
                </View>
              )}
              {item.expirationDate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel} numberOfLines={1}>
                    Expires:
                  </Text>
                  <Text
                    style={styles.infoValue}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatDate(item.expirationDate)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.footerRow}>
            <View style={styles.actionButtons}>
              {isDirector && item.status === "Pending" && (
                <Button
                  mode="contained"
                  buttonColor={PRIMARY}
                  onPress={() => handleSign(item.certificateId)}
                  style={styles.actionBtn}
                  labelStyle={styles.actionBtnLabel}
                  contentStyle={styles.actionBtnContent}
                >
                  Sign
                </Button>
              )}
              <Button
                mode="outlined"
                textColor={PRIMARY}
                onPress={() => handleView(item)}
                style={styles.actionBtn}
                labelStyle={styles.actionBtnLabel}
                contentStyle={styles.actionBtnContent}
              >
                View
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const handleBack = () => {
    // Navigate back to home tab
    router.replace("/(tabs)" as any);
  };

  return (
    <>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={handleBack} color={PRIMARY} />
        <Appbar.Content title="Certificates" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        {/* SEARCH & FILTERS */}
        <View style={styles.topSection}>
          <TextInput
            mode="outlined"
            placeholder="Search certificates..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.search}
            contentStyle={styles.searchContent}
            outlineColor={PRIMARY}
            activeOutlineColor={PRIMARY}
            textColor="#1F2937"
            dense
            left={<TextInput.Icon icon="magnify" />}
          />

          <View style={styles.controlsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterRow}
            >
              {STATUS_OPTIONS.map((s) => (
                <Button
                  key={s}
                  mode={statusFilter === s ? "contained" : "outlined"}
                  onPress={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  buttonColor={statusFilter === s ? PRIMARY : undefined}
                  textColor={statusFilter === s ? "white" : PRIMARY}
                  style={styles.filterBtn}
                  labelStyle={styles.filterLabel}
                  contentStyle={styles.filterBtnContent}
                >
                  {s}
                </Button>
              ))}
            </ScrollView>

            <Menu
              visible={pageSizeMenuVisible}
              onDismiss={() => setPageSizeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  icon="chevron-down"
                  onPress={() => setPageSizeMenuVisible(true)}
                  textColor={PRIMARY}
                  style={styles.pageSizeBtn}
                  labelStyle={styles.pageSizeLabel}
                  contentStyle={styles.pageSizeBtnContent}
                >
                  {pageSize}
                </Button>
              }
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <Menu.Item
                  key={s}
                  title={`${s}`}
                  onPress={() => {
                    setPageSize(s);
                    setPage(1);
                    setPageSizeMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
          </View>
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY} />
        ) : (
          <>
            <FlatList
              data={filtered}
              keyExtractor={(i) => i.certificateId}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={loadData}
                  colors={[PRIMARY]}
                />
              }
            />

            {/* PAGINATION */}
            <View style={styles.pagination}>
              <Button
                mode="outlined"
                disabled={page === 1}
                onPress={() => setPage((p) => p - 1)}
                textColor={PRIMARY}
                style={styles.paginationBtn}
                labelStyle={styles.paginationLabel}
                contentStyle={styles.paginationBtnContent}
              >
                Prev
              </Button>

              <Text style={styles.pageText}>
                {page} / {totalPages}
              </Text>

              <Button
                mode="outlined"
                disabled={page === totalPages}
                onPress={() => setPage((p) => p + 1)}
                textColor={PRIMARY}
                style={styles.paginationBtn}
                labelStyle={styles.paginationLabel}
                contentStyle={styles.paginationBtnContent}
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
    elevation: 1,
    shadowOpacity: 0.1,
  },
  appbarTitle: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 18,
  },

  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  topSection: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  search: {
    marginBottom: 8,
    backgroundColor: "white",
    height: 44,
  },

  searchContent: {
    fontSize: 15,
    color: "#1F2937",
    paddingVertical: 0,
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  filterScroll: {
    flex: 1,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    paddingVertical: 4,
  },

  filterBtn: {
    borderRadius: 20,
    marginRight: 8,
    minWidth: 80,
  },

  filterBtnContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: "auto",
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 0,
  },

  pageSizeBtn: {
    borderRadius: 20,
    minWidth: 70,
    borderColor: PRIMARY,
    marginLeft: 8,
  },

  pageSizeBtnContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: "auto",
  },

  pageSizeLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 0,
  },

  card: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  cardContent: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },

  cardHeaderLeft: {
    flex: 1,
    minWidth: 0, // Important for text truncation
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1B4B",
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    flexShrink: 0, // Prevent status tag from shrinking
  },

  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  pendingTag: { backgroundColor: "#F1C40F" },
  activeTag: { backgroundColor: "#2ECC71" },
  expiredTag: { backgroundColor: "#95A5A6" },
  revokedTag: { backgroundColor: "#E74C3C" },
  changeInfoTag: { backgroundColor: "#9B59B6" },

  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },

  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    flexShrink: 0,
  },

  infoValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "600",
    flexShrink: 1,
    minWidth: 0,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },

  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },

  actionBtn: {
    minWidth: 80,
    marginHorizontal: 4,
  },

  actionBtnContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: "auto",
  },

  actionBtnLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 0,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  paginationBtn: {
    minWidth: 80,
    marginHorizontal: 4,
  },

  paginationBtnContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: "auto",
  },

  paginationLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 0,
  },

  pageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
});
