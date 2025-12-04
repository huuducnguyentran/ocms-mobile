import {
  getAllDecisions,
  getDecisionHtml,
  signDecision,
  signDecisionBatch,
} from "@/service/decisionService";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Card,
  Text,
  Modal,
  Portal,
  Button,
  ActivityIndicator,
  Searchbar,
  Chip,
  Checkbox,
} from "react-native-paper";
import { Buffer } from "buffer";
import { WebView } from "react-native-webview";

const THEME_COLOR = "#3620AC";

const DecisionScreen: React.FC = () => {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);

  // Search + Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Batch selection
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const userRole = "Director"; // 🔥 Replace with your actual stored role
  const isDirector = userRole === "Director";

  const sortDecisions = (data: any[]) =>
    [...data].sort((a, b) => b.decisionCode.localeCompare(a.decisionCode));

  /* ============================================================
        Fetch Decisions
  ============================================================ */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllDecisions();

      if (res.success) {
        const sorted = sortDecisions(res.data || []);
        setDecisions(sorted);
        setFiltered(sorted);
      }
    } catch (err) {
      console.error("Error loading decisions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ============================================================
        Refresh (Pull to Refresh)
  ============================================================ */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  /* ============================================================
        Search + Filter
  ============================================================ */
  const applyFilters = (s = search, status = statusFilter) => {
    let data = [...decisions];

    if (s.trim()) {
      data = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(s.toLowerCase()) ||
          item.decisionStatus?.toLowerCase().includes(s.toLowerCase())
      );
    }

    if (status !== "All") {
      data = data.filter((item) => item.decisionStatus === status);
    }

    setFiltered(sortDecisions(data));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, statusFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(search, value);
  };

  /* ============================================================
        View HTML or PDF
  ============================================================ */
  const handleView = async (item: any) => {
    try {
      setModalLoading(true);
      setModalVisible(true);

      const res = await getDecisionHtml(item.decisionId);

      if (!res.success) {
        setModalLoading(false);
        return;
      }

      if (res.isPdf) {
        const base64 = `data:application/pdf;base64,${Buffer.from(
          res.data,
          "binary"
        ).toString("base64")}`;
        setPdfData(base64);
        setSelectedDecision(null);
      } else {
        setPdfData(null);
        const html = Buffer.from(res.data, "binary").toString();
        setSelectedDecision({
          title: item.title,
          content: html,
        });
      }
    } catch (err) {
      console.error("View error:", err);
    } finally {
      setModalLoading(false);
    }
  };

  /* ============================================================
        Sign Single
  ============================================================ */
  const handleSign = async (item: any) => {
    const res = await signDecision(item.decisionId);
    if (res.success) fetchData();
  };

  /* ============================================================
        Sign Batch
  ============================================================ */
  const handleBatch = async () => {
    if (!selectedKeys.length) return;

    await signDecisionBatch(selectedKeys);
    setSelectedKeys([]);
    fetchData();
  };

  /* ============================================================
        Render Decision Card
  ============================================================ */
  const renderItem = ({ item }: { item: any }) => {
    const checked = selectedKeys.includes(item.decisionId);

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Title
          title={item.decisionCode}
          subtitle={item.title}
          titleStyle={{ fontWeight: "bold" }}
        />

        <Card.Content>
          <Chip
            style={{ alignSelf: "flex-start", marginBottom: 6 }}
            textStyle={{ color: "#fff" }}
            selectedColor="#fff"
            selected
            theme={{
              colors: {
                primary: item.decisionStatus === "Draft" ? "orange" : "green",
              },
            }}
          >
            {item.decisionStatus}
          </Chip>
        </Card.Content>

        <Card.Actions style={{ justifyContent: "space-between" }}>
          {isDirector && item.decisionStatus === "Draft" && (
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() => {
                if (checked)
                  setSelectedKeys(
                    selectedKeys.filter((id) => id !== item.decisionId)
                  );
                else setSelectedKeys([...selectedKeys, item.decisionId]);
              }}
            />
          )}

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button mode="contained" onPress={() => handleView(item)}>
              HTML/PDF
            </Button>

            {isDirector && item.decisionStatus === "Draft" && (
              <Button
                mode="contained"
                buttonColor="#ff6600"
                onPress={() => handleSign(item)}
              >
                Sign
              </Button>
            )}
          </View>
        </Card.Actions>
      </Card>
    );
  };

  /* ============================================================
        Modal Viewer
  ============================================================ */
  const renderModalContent = () => {
    if (modalLoading) return <ActivityIndicator style={{ padding: 40 }} />;

    // PDF
    if (pdfData) {
      return (
        <WebView
          source={{ uri: pdfData }}
          style={{ height: "90%", borderRadius: 12 }}
        />
      );
    }

    // HTML
    if (selectedDecision) {
      return (
        <WebView
          originWhitelist={["*"]}
          source={{ html: selectedDecision.content }}
          style={{ height: "90%", borderRadius: 12 }}
        />
      );
    }

    return <Text>No content available.</Text>;
  };

  /* ============================================================
        UI
  ============================================================ */
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Search */}
      <Searchbar
        placeholder="Search decisions..."
        value={search}
        onChangeText={handleSearch}
        style={styles.search}
      />

      {/* Status Filter */}
      <View style={styles.filterRow}>
        {["All", "Draft", "Signed", "Revoked"].map((s) => (
          <Chip
            key={s}
            mode={statusFilter === s ? "flat" : "outlined"}
            selected={statusFilter === s}
            onPress={() => handleStatusFilter(s)}
            style={{ marginRight: 6 }}
          >
            {s}
          </Chip>
        ))}
      </View>

      {/* Batch Sign */}
      {isDirector && selectedKeys.length > 0 && (
        <Button mode="contained" buttonColor="#ff6600" onPress={handleBatch}>
          Sign Selected ({selectedKeys.length})
        </Button>
      )}

      {/* Table */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.decisionId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Button
            mode="outlined"
            onPress={() => setModalVisible(false)}
            style={{ marginBottom: 10 }}
          >
            Close
          </Button>

          {renderModalContent()}
        </Modal>
      </Portal>
    </View>
  );
};

export default DecisionScreen;

/* ============================================================
      STYLES
============================================================ */
const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  search: {
    marginBottom: 10,
    borderRadius: 12,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 16,
    borderRadius: 12,
    height: "90%",
  },
});
