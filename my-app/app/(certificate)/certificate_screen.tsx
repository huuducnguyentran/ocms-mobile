// app/certificates/certificate_screen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { Buffer } from "buffer";

import {
  getAllCertificates,
  getCertificateById,
  getCertificateHtml,
  signCertificate,
  updateCertificateStatus,
} from "../../service/certificateService";

export default function CertificateScreen() {
  const router = useRouter();
  const THEME_COLOR = "#3620AC";

  const [certificates, setCertificates] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // PDF Base64
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const userRole = "Director";
  const isDirector = userRole === "Director";

  // SORT
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

  // LOAD CERTIFICATES
  const loadData = async () => {
    setLoading(true);
    const res = await getAllCertificates();
    if (res.success && Array.isArray(res.data)) {
      const sorted = sortCertificates(res.data);
      setCertificates(sorted);
      setFiltered(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // FILTER
  useEffect(() => {
    let data = [...certificates];

    if (statusFilter !== "All") {
      data = data.filter(
        (d) => d.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchText.length > 0) {
      data = data.filter((d) =>
        d.certificateCode.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFiltered(sortCertificates(data));
  }, [statusFilter, searchText, certificates]);

  // OPEN VIEW MODAL
  const handleView = async (item: any) => {
    setViewModalVisible(true);
    setViewLoading(true);
    setPdfBase64(null);

    const res = await getCertificateById(item.certificateId);
    if (res.success) setSelectedCert(res.data);
    else Alert.alert("Error", "Failed to load certificate");

    setViewLoading(false);
  };

  // LOAD PDF
  const loadCertificatePdf = async (certificateId: string) => {
    setLoadingPdf(true);
    try {
      const res = await getCertificateHtml(certificateId);

      if (res.success && res.isPdf) {
        // 🔥 Correct Base64 conversion for React Native
        const base64Pdf = Buffer.from(res.data, "binary").toString("base64");
        setPdfBase64(base64Pdf);
      } else {
        Alert.alert("Error", "Certificate HTML mode not supported yet");
      }
    } catch (err) {
      console.log("PDF Load Error:", err);
      Alert.alert("Error", "Unable to load PDF");
    }
    setLoadingPdf(false);
  };

  // SIGN
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
          } else {
            Alert.alert("Error", res.message);
          }
        },
      },
    ]);
  };

  // UPDATE STATUS
  const confirmStatusUpdate = (item: any, newStatus: string) => {
    Alert.alert("Update Status", `Change status to ${newStatus}?`, [
      { text: "Cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          const res = await updateCertificateStatus(
            item.certificateId,
            newStatus,
            newStatus === "Revoked" ? "Revoked by Director" : ""
          );
          if (res.success) {
            Alert.alert("Success", res.message);
            loadData();
          } else {
            Alert.alert("Error", res.message);
          }
        },
      },
    ]);
  };

  // RENDER ITEM
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.certificateCode}</Text>
      <Text>Status: {item.status}</Text>
      <Text>User: {item.userId}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: THEME_COLOR }]}
          onPress={() => handleView(item)}
        >
          <Text style={styles.btnText}>View</Text>
        </TouchableOpacity>

        {isDirector && item.status === "Active" && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#B01D1D" }]}
            onPress={() => confirmStatusUpdate(item, "Revoked")}
          >
            <Text style={styles.btnText}>Revoke</Text>
          </TouchableOpacity>
        )}

        {isDirector && item.status === "Revoked" && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "green" }]}
            onPress={() => confirmStatusUpdate(item, "Active")}
          >
            <Text style={styles.btnText}>Activate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* SEARCH */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Search by code"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* FILTER */}
      <ScrollView horizontal style={styles.filterRow}>
        {["All", "Pending", "Active", "Expired", "Revoked"].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(s)}
            style={[
              styles.filterBtn,
              statusFilter === s && styles.filterActive,
            ]}
          >
            <Text
              style={{
                color: statusFilter === s ? "#fff" : "#333",
                fontWeight: "600",
              }}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* CERT LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={THEME_COLOR} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.certificateId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}

      {/* VIEW MODAL */}
      <Modal visible={viewModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <TouchableOpacity
            onPress={() => {
              setViewModalVisible(false);
              setPdfBase64(null);
            }}
            style={styles.closeBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>

          {viewLoading ? (
            <ActivityIndicator size="large" color={THEME_COLOR} />
          ) : selectedCert ? (
            <ScrollView style={{ padding: 14 }}>
              <Text style={styles.modalTitle}>
                {selectedCert.certificateCode}
              </Text>

              <Text>User ID: {selectedCert.userId}</Text>
              <Text>User Name: {selectedCert.userFullName}</Text>
              <Text>Status: {selectedCert.status}</Text>
              <Text>Issued By: {selectedCert.issuedByFullName}</Text>

              <Text>
                Issue Date:{" "}
                {selectedCert.issueDate
                  ? new Date(selectedCert.issueDate).toLocaleString()
                  : "N/A"}
              </Text>
              <Text>
                Sign Date:{" "}
                {selectedCert.signDate
                  ? new Date(selectedCert.signDate).toLocaleString()
                  : "N/A"}
              </Text>

              {/* PDF VIEW */}
              <TouchableOpacity
                style={[
                  styles.btn,
                  { marginTop: 20, backgroundColor: THEME_COLOR },
                ]}
                onPress={() => loadCertificatePdf(selectedCert.certificateId)}
              >
                <Text style={styles.btnText}>View Certificate PDF</Text>
              </TouchableOpacity>

              {loadingPdf ? (
                <ActivityIndicator
                  size="large"
                  color={THEME_COLOR}
                  style={{ marginTop: 20 }}
                />
              ) : pdfBase64 ? (
                <View
                  style={{
                    height: 600,
                    marginTop: 20,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                >
                  <WebView
                    originWhitelist={["*"]}
                    source={{
                      uri: `data:application/pdf;base64,${pdfBase64}`,
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              ) : null}

              {/* ACTION BUTTONS */}
              {isDirector && selectedCert.status === "Pending" && (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    { marginTop: 20, backgroundColor: THEME_COLOR },
                  ]}
                  onPress={() => handleSign(selectedCert.certificateId)}
                >
                  <Text style={styles.btnText}>Sign Certificate</Text>
                </TouchableOpacity>
              )}

              {isDirector && selectedCert.status === "Active" && (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    { marginTop: 10, backgroundColor: "#B01D1D" },
                  ]}
                  onPress={() => confirmStatusUpdate(selectedCert, "Revoked")}
                >
                  <Text style={styles.btnText}>Revoke</Text>
                </TouchableOpacity>
              )}

              {isDirector && selectedCert.status === "Revoked" && (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    { marginTop: 10, backgroundColor: "green" },
                  ]}
                  onPress={() => confirmStatusUpdate(selectedCert, "Active")}
                >
                  <Text style={styles.btnText}>Activate</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },

  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },

  searchWrapper: { padding: 12 },
  searchInput: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
  },

  filterRow: { paddingLeft: 12, marginBottom: 8 },
  filterBtn: {
    width: 90,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
    borderRadius: 20,
    marginRight: 8,
  },
  filterActive: { backgroundColor: "#3620AC" },

  closeBtn: {
    backgroundColor: "#3620AC",
    padding: 14,
    alignItems: "center",
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
});
