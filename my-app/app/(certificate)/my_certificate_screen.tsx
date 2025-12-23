import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  getMyCertificates,
  getCertificateHtml,
} from "@/service/certificateService";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type MyCertificate = {
  certificateId: string;
  certificateCode: string;
  userId: string;
  issueDate: string;
  signDate: string;
  expirationDate: string;
  status: string;
  certificateTemplateId: string;
  issuedByUserId: string;
};

export default function MyCertificateScreen() {
  const [certificates, setCertificates] = useState<MyCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const color = "#3620AC";

  const loadCertificates = async () => {
    setLoading(true);
    const res = await getMyCertificates();
    if (res.success && Array.isArray(res.data)) {
      setCertificates(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  // When clicking "View Certificate"
  const viewCertificate = async (id: string) => {
    try {
      // Navigate first, then load in the viewer screen
      router.push({
        pathname: "/(certificate)/certificate_viewer_screen",
        params: {
          certificateId: id,
        },
      });
    } catch (error) {
      console.error("[MyCertificate] Error navigating:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#3620AC" />
          </TouchableOpacity>
          <Text style={styles.title}>My Certificates</Text>
        </View>

        {loading && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}

        {!loading && certificates.length === 0 && (
          <Text style={styles.empty}>You have no certificates.</Text>
        )}

        <FlatList
          data={certificates}
          keyExtractor={(item) => item.certificateId}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Certificate Code: {item.certificateCode}
              </Text>
              <Text style={styles.cardSubtitle}>Status: {item.status}</Text>

              <Text style={styles.cardDesc}>
                Issue Date: {new Date(item.issueDate).toLocaleDateString()}
              </Text>
              <Text style={styles.cardDesc}>
                Expiration: {new Date(item.expirationDate).toLocaleDateString()}
              </Text>

              <TouchableOpacity
                style={[styles.viewBtn, { backgroundColor: color }]}
                onPress={() => viewCertificate(item.certificateId)}
              >
                <Text style={styles.btnText}>View Certificate</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3620AC",
    flex: 1,
  },
  empty: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
  card: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  },
  viewBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
