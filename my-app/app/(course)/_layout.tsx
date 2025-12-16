import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function CourseLayout() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <TopBar onMenuPress={() => setIsVisible(true)} />

      {/* Main Content (Stack Navigator for screens inside course_screen/) */}
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
