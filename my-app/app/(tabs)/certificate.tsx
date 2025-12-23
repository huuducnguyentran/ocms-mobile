import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { storage } from "@/utils/storage";

export default function CertificateTabScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoleAndNavigate();
  }, []);

  const loadRoleAndNavigate = async () => {
    try {
      const userRole = await storage.getItem("role");
      setRole(userRole);

      // Route based on role
      if (userRole === "Director") {
        // Director sees all certificates they signed
        router.replace("/(certificate)/certificate_screen" as any);
      } else {
        // Trainee sees their own certificates
        router.replace("/(certificate)/my_certificate_screen" as any);
      }
    } catch (error) {
      console.error("Failed to load role:", error);
      // Default to trainee screen if error
      router.replace("/(certificate)/my_certificate_screen" as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
