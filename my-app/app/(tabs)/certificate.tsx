import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function CertificateTabScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Navigate to my_certificate_screen
    router.push("/(certificate)/my_certificate_screen" as any);
  }, []);

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

