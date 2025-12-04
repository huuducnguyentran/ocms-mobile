import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function DecisionLayout() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <TopBar onMenuPress={() => setIsVisible(true)} />

      {/* Stack Screens */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Bottom Navigation Drawer */}
      <NavBar visible={isVisible} onClose={() => setIsVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
