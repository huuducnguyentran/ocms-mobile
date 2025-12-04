// app/profile.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import { profileService, ProfileData } from "@/service/profileService";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    fullName: "",
    email: "",
    phoneNumber: "",
    sex: "",
    dateOfBirth: "",
    citizenId: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileService.getProfile();
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || "",
        email: response.data.email || "",
        phoneNumber: response.data.phoneNumber || "",
        sex: response.data.sex || "",
        dateOfBirth: response.data.dateOfBirth || "",
        citizenId: response.data.citizenId || "",
      });
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await profileService.updateProfile(formData);
      await loadProfile();
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        sex: profile.sex || "",
        dateOfBirth: profile.dateOfBirth || "",
        citizenId: profile.citizenId || "",
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos."
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();
        
        // Create file object for FormData
        const fileUri = asset.uri;
        const fileName = fileUri.split("/").pop() || "avatar.jpg";
        const fileType = `image/${fileName.split(".").pop()}`;

        formData.append("file", {
          uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
          name: fileName,
          type: fileType,
        } as any);

        setIsSaving(true);
        await profileService.uploadAvatar(formData);
        await loadProfile();
        Alert.alert("Success", "Avatar updated successfully!");
      }
    } catch (error: any) {
      console.error("Failed to upload avatar:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to upload avatar. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <TopBar onMenuPress={() => setDrawerVisible(true)} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2B1989" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <TopBar onMenuPress={() => setDrawerVisible(true)} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={handleAvatarUpload}
              style={styles.avatarContainer}
              disabled={isSaving}
            >
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getInitials(profile?.fullName)}
                  </Text>
                </View>
              )}
              <View style={styles.avatarEditIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>
              {profile?.fullName || "User"}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email || ""}</Text>
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              {!isEditing ? (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={20} color="#2B1989" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.cancelButton}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  placeholder="Enter full name"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.fullName || "Not set"}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.email || "Not set"}
                </Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.phoneNumber || "Not set"}
                </Text>
              )}
            </View>

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
              {isEditing ? (
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      formData.sex === "Male" && styles.radioOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, sex: "Male" })}
                    disabled={isSaving}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        formData.sex === "Male" && styles.radioTextSelected,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      formData.sex === "Female" && styles.radioOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, sex: "Female" })}
                    disabled={isSaving}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        formData.sex === "Female" && styles.radioTextSelected,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.sex || "Not set"}
                </Text>
              )}
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                  placeholder="YYYY-MM-DD"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.dateOfBirth || "Not set"}
                </Text>
              )}
            </View>

            {/* Citizen ID */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Citizen ID</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.citizenId}
                  onChangeText={(text) => setFormData({ ...formData, citizenId: text })}
                  placeholder="Enter citizen ID"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile?.citizenId || "Not set"}
                </Text>
              )}
            </View>

            {/* User ID (Read-only) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>User ID</Text>
              <Text style={[styles.fieldValue, styles.readOnlyValue]}>
                {profile?.userId || "N/A"}
              </Text>
            </View>
          </View>

          {/* Change Password Section */}
          <View style={styles.passwordSection}>
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={() => router.push("/change-password" as any)}
            >
              <Ionicons name="lock-closed" size={20} color="#fff" />
              <Text style={styles.changePasswordText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <NavBar
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2B1989",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#2B1989",
  },
  avatarText: {
    color: "#2B1989",
    fontSize: 36,
    fontWeight: "bold",
  },
  avatarEditIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2B1989",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2B1989",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
  },
  infoSection: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2B1989",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  editButtonText: {
    marginLeft: 5,
    color: "#2B1989",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#2B1989",
    minWidth: 80,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  readOnlyValue: {
    color: "#999",
    fontStyle: "italic",
  },
  input: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2B1989",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 10,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  radioOptionSelected: {
    backgroundColor: "#2B1989",
    borderColor: "#2B1989",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  radioTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  passwordSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2B1989",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  changePasswordText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

