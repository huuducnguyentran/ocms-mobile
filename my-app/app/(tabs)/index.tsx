import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";

function HomeScreenContent() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <TopBar onMenuPress={() => setDrawerVisible(true)} />
        <ScrollView style={styles.content}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to VJ Academy!</Text>
            <Text style={styles.welcomeSubtitle}>
              Online Certificate Management System
            </Text>
          </View>
          {/* Add your dashboard content here */}
        </ScrollView>
        <NavBar
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
      </SafeAreaView>
    </ProtectedRoute>
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
  welcomeContainer: {
    padding: 20,
    alignItems: "center",
    marginTop: 20,
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
});
