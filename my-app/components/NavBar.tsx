// components/NavBar.tsx - Mobile Navigation Bar with Drawer
import navItems from "@/data/NavItems";
import { profileService } from "@/service/profileService";
import { storage } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NavBarProps {
  visible: boolean;
  onClose: () => void;
}

export default function NavBar({ visible, onClose }: NavBarProps) {
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userRole = await storage.getItem("role");
      setRole(userRole);

      // Fetch profile for avatar and name
      try {
        const response = await profileService.getProfile();
        setProfile(response.data);
        if (response.data.fullName) {
          await storage.setItem("fullName", response.data.fullName);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🚪 Logging out...");

            // Close drawer first
            onClose();

            // Remove all authentication-related items explicitly
            const itemsToRemove = [
              "token",
              "username",
              "userId",
              "role",
              "hubUrl",
              "fullName",
              "fullname",
            ];

            for (const key of itemsToRemove) {
              try {
                await storage.removeItem(key);
                console.log(`✅ Removed ${key} from storage`);
              } catch (error) {
                console.error(`❌ Error removing ${key}:`, error);
              }
            }

            // Also clear all storage as backup
            try {
              await storage.clear();
              console.log("✅ All storage cleared");
            } catch (clearError) {
              console.error("❌ Error clearing all storage:", clearError);
            }

            // Verify token is removed
            const tokenAfterLogout = await storage.getItem("token");
            if (tokenAfterLogout) {
              console.warn(
                "⚠️ Token still exists after logout, forcing clear..."
              );
              await storage.clear();
            } else {
              console.log("✅ Token successfully removed");
            }

            // Small delay to ensure storage is fully cleared and state updates
            await new Promise((resolve) => setTimeout(resolve, 100));

            console.log("✅ Logout successful, redirecting to login...");

            // Redirect to login - _layout.tsx will detect no token and keep us on login
            router.replace("/(authen)/login" as any);
          } catch (error) {
            console.error("❌ Error during logout:", error);
            // Still redirect even if clear fails
            router.replace("/(authen)/login" as any);
          }
        },
      },
    ]);
  };

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      onClose();
      router.push(path as any);
    }
  };

  const getIcon = (iconName?: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      home: "home",
      book: "book",
      appstore: "apps",
      read: "library",
      "file-protect": "document-text",
      trophy: "trophy",
      "bar-chart": "bar-chart",
      form: "document-text",
      "safety-certificate": "shield-checkmark",
      audit: "checkmark-circle",
      "user-switch": "people",
      solution: "people-circle",
      "usergroup-add": "person-add",
      idcard: "card",
      apartment: "business",
      "pie-chart": "pie-chart",
      calendar: "calendar",
      cluster: "layers",
    };
    return iconName ? iconMap[iconName] || "ellipse" : "ellipse";
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || !role) return true;
    return item.roles.includes(role);
  });

  const renderNavItem = (item: (typeof navItems)[0], level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.key);
    const filteredChildren = hasChildren
      ? item.children!.filter((child) => {
          if (!child.roles || !role) return true;
          return child.roles.includes(role);
        })
      : [];

    if (hasChildren && filteredChildren.length === 0) {
      return null;
    }

    return (
      <View key={item.key}>
        <TouchableOpacity
          style={[
            styles.navItem,
            level > 0 && styles.navItemChild,
            { paddingLeft: 16 + level * 20 },
          ]}
          onPress={() => {
            if (hasChildren) {
              toggleExpand(item.key);
            } else {
              handleNavigate(item.path);
            }
          }}
        >
          <Ionicons
            name={getIcon(item.icon)}
            size={20}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.navItemText}>{item.label}</Text>
          {hasChildren && (
            <Ionicons
              name={isExpanded ? "chevron-down" : "chevron-forward"}
              size={16}
              color="#fff"
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>

        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {filteredChildren.map((child) => renderNavItem(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.drawer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>VJ Academy</Text>
              <View style={styles.headerDivider} />
            </View>
          </View>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getInitials(profile?.fullName)}
                </Text>
              </View>
            )}
            <Text style={styles.profileName}>
              {profile?.fullName || "User"}
            </Text>
            <Text style={styles.profileRole}>{role || "No Role"}</Text>
          </View>

          {/* Navigation Menu */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredNavItems.map((item) => renderNavItem(item))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Powered by <Text style={styles.footerBold}>VJ Academy</Text> ©
              2025
            </Text>
          </View>
        </View>

        {/* Overlay to close drawer */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawer: {
    width: 280,
    backgroundColor: "#6C63FF",
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  header: {
    backgroundColor: "#2B1989",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerDivider: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: 8,
  },
  profileSection: {
    backgroundColor: "#2B1989",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#2B1989",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileRole: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textTransform: "capitalize",
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "#6C63FF",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  navItemChild: {
    backgroundColor: "rgba(43, 25, 137, 0.3)",
  },
  icon: {
    marginRight: 12,
  },
  navItemText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  chevron: {
    marginLeft: "auto",
  },
  childrenContainer: {
    backgroundColor: "rgba(43, 25, 137, 0.2)",
  },
  footer: {
    backgroundColor: "#2B1989",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    textAlign: "center",
  },
  footerBold: {
    fontWeight: "bold",
  },
});
