import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import { storage } from "@/utils/storage";

function HomeScreenContent() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const userRole = await storage.getItem("role");
      setRole(userRole);
    } catch (error) {
      console.error("Failed to load role:", error);
    }
  };

  // Get cards based on role
  const getCardsForRole = () => {
    const baseCards = [
      {
        id: "notification",
        title: "Notification",
        icon: "notifications",
        color: "#FF6B35",
        onPress: () => router.push("/(tabs)/notification"),
      },
    ];

    if (role === "Trainee" || role === "Director") {
      return [
        ...baseCards,
        {
          id: "certificate",
          title: "Certificate",
          icon: "document-text",
          color: "#FF6B35",
          onPress: () => router.push("/(tabs)/certificate"),
        },
      ];
    } else if (role === "Instructor") {
      return [
        ...baseCards,
        {
          id: "grade",
          title: "Grade",
          icon: "school",
          color: "#FF6B35",
          onPress: () => router.push("/(tabs)/grade"),
        },
      ];
    }

    return baseCards;
  };

  const cards = getCardsForRole();

  // Don't wrap in ProtectedRoute here - tabs layout already handles auth
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <TopBar onMenuPress={() => setDrawerVisible(true)} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>VJ</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Welcome to VJ Academy!</Text>
          <Text style={styles.welcomeSubtitle}>
            Online Certificate Management System
          </Text>
        </View>

        {/* Notification and Application Status Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>
                Notification and Application status
              </Text>
              <View style={styles.underline} />
            </View>
          </View>
          <View style={styles.cardsRow}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.card}
                onPress={card.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: card.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={card.icon as any}
                    size={40}
                    color={card.color}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: card.color }]}>
                  {card.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Information Access Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Information Access</Text>
              <View style={styles.underline} />
            </View>
          </View>
          <View style={styles.cardsRow}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/(class)/class_screen")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FF6B3520" }]}
              >
                <Ionicons name="school-outline" size={40} color="#FF6B35" />
              </View>
              <Text style={[styles.cardTitle, { color: "#FF6B35" }]}>
                Class
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/(class)/attendance_list_screen")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FF6B3520" }]}
              >
                <Ionicons name="time-outline" size={40} color="#FF6B35" />
              </View>
              <Text style={[styles.cardTitle, { color: "#FF6B35" }]}>
                Attendance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reports Section (for Trainee) */}
        {role === "Trainee" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Reports</Text>
                <View style={styles.underline} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/(make-report)/make_report_screen")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FF6B3520" }]}
              >
                <Ionicons name="document" size={40} color="#FF6B35" />
              </View>
              <Text style={[styles.cardTitle, { color: "#FF6B35" }]}>
                Make Report
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <NavBar visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return <HomeScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for tab bar
    flexGrow: 1,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2B1989",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    position: "relative",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 4,
  },
  underline: {
    height: 3,
    width: 60,
    backgroundColor: "#0066CC",
    borderRadius: 2,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
    paddingHorizontal: 0,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    minHeight: 120,
    justifyContent: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: "#FF6B35",
  },
});
