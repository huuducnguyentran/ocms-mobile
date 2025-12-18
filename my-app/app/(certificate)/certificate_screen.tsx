// app/certificates/certificate_screen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Modal,
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
import { WebView } from "react-native-webview";
import { Buffer } from "buffer";

import {
  getAllCertificates,
  getCertificateById,
  getCertificateHtml,
  signCertificate,
  updateCertificateStatus,
} from "../../service/certificateService";

const PRIMARY = "#3620AC";

const STATUS_OPTIONS = ["All", "Pending", "Active", "Expired", "Revoked"];
const PAGE_SIZE_OPTIONS = [10, 20, 30];

export default function CertificateScreen() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [pageSizeMenuVisible, setPageSizeMenuVisible] = useState(false);

  // ===== VIEW / PDF =====
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const userRole = "Director";
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
    loadData();
  }, [page, pageSize]);

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
    setViewModalVisible(true);
    setViewLoading(true);
    setPdfBase64(null);

    const res = await getCertificateById(item.certificateId);
    if (res.success) setSelectedCert(res.data);
    else Alert.alert("Error", "Failed to load certificate");

    setViewLoading(false);
  };

  /* ================= PDF ================= */
  const loadCertificatePdf = async (id: string) => {
    setLoadingPdf(true);
    const res = await getCertificateHtml(id);
    if (res.success && res.isPdf) {
      const base64Pdf = Buffer.from(res.data, "binary").toString("base64");
      setPdfBase64(base64Pdf);
    }
    setLoadingPdf(false);
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
      default:
        return styles.pendingTag;
    }
  };

  /* ================= RENDER ================= */
  const renderItem = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.certificateCode}
        subtitle={`User: ${item.userId}`}
        titleStyle={styles.cardTitle}
        subtitleStyle={styles.cardSubtitle}
      />

      <Card.Content>
        <View style={styles.footerRow}>
          <View style={[styles.statusTag, getStatusTagStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>

          <Button
            mode="outlined"
            textColor={PRIMARY}
            onPress={() => handleView(item)}
          >
            View
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Certificates" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        {/* SEARCH */}
        <TextInput
          mode="outlined"
          placeholder="Search certificates..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          outlineColor={PRIMARY}
          activeOutlineColor={PRIMARY}
        />

        {/* STATUS FILTER */}
        <View style={styles.filterRow}>
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
            >
              {s}
            </Button>
          ))}
        </View>

        {/* TAKE DROPDOWN */}
        <View style={styles.pageSizeRow}>
          <Text style={styles.pageSizeLabel}>Rows per page</Text>
          <Menu
            visible={pageSizeMenuVisible}
            onDismiss={() => setPageSizeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="chevron-down"
                onPress={() => setPageSizeMenuVisible(true)}
                textColor={PRIMARY}
                style={styles.pageSizeDropdown}
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

/* ================= STYLES (MATCH COURSE PAGE) ================= */

const styles = StyleSheet.create({
  appbar: { backgroundColor: "white", elevation: 2 },
  appbarTitle: { color: PRIMARY, fontWeight: "800" },

  container: { flex: 1, padding: 16, backgroundColor: "#F4F3FF" },

  search: { marginBottom: 12, backgroundColor: "white" },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: { borderRadius: 20 },

  pageSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  pageSizeLabel: { fontWeight: "700", color: "#2D2A6E" },
  pageSizeDropdown: { borderRadius: 12, borderColor: PRIMARY },

  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "white",
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY,
  },
  cardTitle: { fontWeight: "700", color: "#1E1B4B" },
  cardSubtitle: { color: "#4B5563" },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "white", fontSize: 12, fontWeight: "700" },

  pendingTag: { backgroundColor: "#F1C40F" },
  activeTag: { backgroundColor: "#2ECC71" },
  expiredTag: { backgroundColor: "#95A5A6" },
  revokedTag: { backgroundColor: "#E74C3C" },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  pageText: { fontWeight: "800", color: "#2D2A6E" },
});
