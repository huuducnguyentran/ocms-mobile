import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { storage } from "@/utils/storage";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const userRole = await storage.getItem("role");
      console.log("[TabLayout] Loaded role:", userRole);
      setRole(userRole);
    } catch (error) {
      console.error("[TabLayout] Failed to load role:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine tabs based on role
  const getTabsForRole = () => {
    // Show default tabs while loading
    if (loading) {
      return [
        { name: "index", title: "Home", icon: "home" },
        {
          name: "notification",
          title: "Notification",
          icon: "notifications",
        },
      ];
    }

    switch (role) {
      case "Trainee":
      case "Director":
        return [
          { name: "index", title: "Home", icon: "home" },
          {
            name: "notification",
            title: "Notification",
            icon: "notifications",
          },
          { name: "certificate", title: "Certificate", icon: "document-text" },
        ];
      case "Instructor":
        return [
          { name: "index", title: "Home", icon: "home" },
          {
            name: "notification",
            title: "Notification",
            icon: "notifications",
          },
          { name: "grade", title: "Grade", icon: "school" },
        ];
      default:
        return [
          { name: "index", title: "Home", icon: "home" },
          {
            name: "notification",
            title: "Notification",
            icon: "notifications",
          },
        ];
    }
  };

  const tabs = getTabsForRole();

  console.log(
    "[TabLayout] Rendering tabs:",
    tabs.length,
    "tabs for role:",
    role
  );

  // Calculate safe bottom padding for Android to avoid system navigation bar
  // Android typically has 16-24px system navigation bar, we add extra padding
  const bottomPadding =
    Platform.OS === "android"
      ? Math.max(insets.bottom, 8) + 8 // At least 8px + safe area, plus 8px extra
      : insets.bottom || 0;

  const tabBarHeight = Platform.OS === "android" ? 70 : 75;

  // Ensure we always have at least the home tab
  if (tabs.length === 0) {
    console.warn("[TabLayout] No tabs found, using default tabs");
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF6B35",
          tabBarInactiveTintColor: "#999",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 3,
            borderTopColor: "#FF6B35",
            height: tabBarHeight + bottomPadding,
            paddingBottom: bottomPadding + 8, // Safe area + extra padding
            paddingTop: 12,
            // Strong shadow for iOS to make it stand out
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            // High elevation for Android to make it stand out
            elevation: 15,
            // Add subtle background gradient effect with border
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6B35", // Orange color
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 3,
          borderTopColor: "#FF6B35",
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding + 8, // Safe area + extra padding
          paddingTop: 12,
          // Strong shadow for iOS to make it stand out
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          // High elevation for Android to make it stand out
          elevation: 15,
          // Add subtle background gradient effect with border
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? (tab.icon as any) : `${tab.icon}-outline`}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
      {/* Hide explore tab if it exists */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide this tab
        }}
      />
    </Tabs>
  );
}
