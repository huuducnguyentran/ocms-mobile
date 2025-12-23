import {
  getAllDecisions,
  getDecisionHtml,
  signDecision,
  signDecisionBatch,
} from "@/service/decisionService";

import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
  Checkbox,
  Modal,
  Snackbar,
} from "react-native-paper";
import { Buffer } from "buffer";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

const PRIMARY = "#3620AC";

const STATUS_OPTIONS = ["All", "Draft", "Signed", "Revoked"];
const PAGE_SIZE_OPTIONS = [10, 20, 30];

const DecisionScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [decisions, setDecisions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [pageSizeMenuVisible, setPageSizeMenuVisible] = useState(false);

  // ===== MODAL =====
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  // ===== MESSAGE =====
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // ===== ACTION LOADING =====
  const [actionLoading, setActionLoading] = useState(false);

  // ===== BATCH =====
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const userRole = "Director";
  const isDirector = userRole === "Director";

  /* ================= SORT ================= */
  const sortDecisions = (data: any[]) => {
    const priority: any = { Draft: 1, Signed: 2, Revoked: 3 };
    return [...data].sort((a, b) => {
      const diff =
        (priority[a.decisionStatus] || 99) - (priority[b.decisionStatus] || 99);
      if (diff) return diff;
      return b.decisionCode.localeCompare(a.decisionCode);
    });
  };

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * pageSize;

      const res = await getAllDecisions(skip, pageSize);

      if (res.success) {
        const sorted = sortDecisions(res.data.data);
        setDecisions(sorted);
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
    let data = decisions;

    if (statusFilter !== "All") {
      data = data.filter((d) => d.decisionStatus === statusFilter);
    }

    if (search) {
      data = data.filter((d) =>
        `${d.decisionCode} ${d.title}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [search, statusFilter, decisions]);

  /* ================= VIEW ================= */
  const handleView = async (item: any) => {
    setModalVisible(true);
    setModalLoading(true);
    setPdfData(null);
    setHtmlContent(null);

    const res = await getDecisionHtml(item.decisionId);

    if (res.success) {
      if (res.isPdf) {
        const base64 = `data:application/pdf;base64,${Buffer.from(
          res.data,
          "binary"
        ).toString("base64")}`;
        setPdfData(base64);
      } else {
        const html = Buffer.from(res.data, "binary").toString();
        setHtmlContent(html);
      }
    }

    setModalLoading(false);
  };

  /* ================= ACTIONS ================= */
  const handleSign = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await signDecision(id);

      if (res.success) {
        setMessage("Decision signed successfully");
        setMessageType("success");
        loadData();
      } else {
        setMessage(res.message || "Failed to sign decision");
        setMessageType("error");
      }
    } catch {
      setMessage("Something went wrong");
      setMessageType("error");
    } finally {
      setSnackbarVisible(true);
      setActionLoading(false);
    }
  };

  const handleBatch = async () => {
    if (!selectedKeys.length) return;

    try {
      setActionLoading(true);
      const res = await signDecisionBatch(selectedKeys);

      if (res.success) {
        setMessage(`Signed ${selectedKeys.length} decisions successfully`);
        setMessageType("success");
        setSelectedKeys([]);
        loadData();
      } else {
        setMessage(res.message || "Batch sign failed");
        setMessageType("error");
      }
    } catch {
      setMessage("Something went wrong");
      setMessageType("error");
    } finally {
      setSnackbarVisible(true);
      setActionLoading(false);
    }
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }: any) => {
    const checked = selectedKeys.includes(item.decisionId);

    return (
      <Card style={styles.card}>
        <Card.Title
          title={item.decisionCode}
          subtitle={item.title}
          titleStyle={styles.cardTitle}
          subtitleStyle={styles.cardSubtitle}
        />

        <Card.Content>
          <View style={styles.footerRow}>
            <View
              style={[
                styles.statusTag,
                item.decisionStatus === "Signed"
                  ? styles.activeTag
                  : item.decisionStatus === "Revoked"
                  ? styles.revokedTag
                  : styles.pendingTag,
              ]}
            >
              <Text style={styles.statusText}>{item.decisionStatus}</Text>
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

        {isDirector && item.decisionStatus === "Draft" && (
          <Card.Actions>
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() =>
                checked
                  ? setSelectedKeys(
                      selectedKeys.filter((i) => i !== item.decisionId)
                    )
                  : setSelectedKeys([...selectedKeys, item.decisionId])
              }
            />
            <Button
              mode="contained"
              disabled={actionLoading}
              loading={actionLoading}
              onPress={() => handleSign(item.decisionId)}
            >
              Sign
            </Button>
          </Card.Actions>
        )}
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
        <Appbar.Content title="Decisions" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        {/* SEARCH */}
        <TextInput
          mode="outlined"
          placeholder="Search decisions..."
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

        {/* PAGE SIZE */}
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
        <Button
          mode="contained"
          disabled={actionLoading}
          loading={actionLoading}
          onPress={handleBatch}
        >
          Sign Selected ({selectedKeys.length})
        </Button>

        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY} />
        ) : (
          <>
            <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(i) => i.decisionId}
              refreshControl={
                <RefreshControl refreshing={loading} onRefresh={loadData} />
              }
            />

            {/* PAGINATION */}
            <View style={styles.pagination}>
              <Button
                disabled={page === 1}
                onPress={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>

              <Text style={styles.pageText}>
                Page {page} / {totalPages}
              </Text>

              <Button
                disabled={page === totalPages}
                onPress={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </View>
          </>
        )}
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        {modalLoading ? (
          <ActivityIndicator style={{ padding: 40 }} />
        ) : pdfData ? (
          <WebView source={{ uri: pdfData }} style={{ height: "90%" }} />
        ) : (
          <WebView source={{ html: htmlContent || "" }} />
        )}
      </Modal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: messageType === "success" ? "#2ECC71" : "#E74C3C",
        }}
      >
        {message}
      </Snackbar>
    </>
  );
};

export default DecisionScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  appbar: { backgroundColor: "white" },
  appbarTitle: { color: PRIMARY, fontWeight: "800" },

  container: { flex: 1, padding: 16, backgroundColor: "#F4F3FF" },
  search: { marginBottom: 12, backgroundColor: "white" },

  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterBtn: { borderRadius: 20 },

  pageSizeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pageSizeLabel: { fontWeight: "700", color: "#2D2A6E" },

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
  statusText: { color: "white", fontWeight: "700", fontSize: 12 },

  pendingTag: { backgroundColor: "#F1C40F" },
  activeTag: { backgroundColor: "#2ECC71" },
  revokedTag: { backgroundColor: "#E74C3C" },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  pageText: { fontWeight: "800", color: "#2D2A6E" },
});
