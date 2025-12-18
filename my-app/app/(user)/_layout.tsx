// app/subject_screen/_layout.tsx
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function SubjectLayout() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
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
