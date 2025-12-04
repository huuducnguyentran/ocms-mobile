import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { TextInput, Button, IconButton } from "react-native-paper";
import { profileService } from "@/service/profileService";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);

  // Tabs: "info" or "password"
  const [tab, setTab] = useState<"info" | "password">("info");

  // Editable fields
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    sex: "",
    citizenId: "",
  });

  // Change password fields
  const [pass, setPass] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --------------------------
  // Load User Profile
  // --------------------------
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      setProfile(res.data);

      setForm({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phoneNumber: res.data.phoneNumber || "",
        sex: res.data.sex || "",
        citizenId: res.data.citizenId || "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --------------------------
  // Upload Avatar
  // --------------------------
  const handleUploadAvatar = async () => {
    const picker = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (picker.canceled) return;

    const localUri = picker.assets[0].uri;
    const fileName = localUri.split("/").pop()!;
    const fileType = fileName.split(".").pop();

    const formData: any = new FormData();
    formData.append("file", {
      uri: localUri,
      name: fileName,
      type: `image/${fileType}`,
    } as any);

    try {
      const res = await profileService.uploadAvatar(formData);
      Alert.alert("Success", "Avatar updated!");

      fetchProfile();
    } catch (error) {
      Alert.alert("Error", "Failed to upload avatar");
    }
  };

  // --------------------------
  // Update Profile
  // --------------------------
  const handleUpdateProfile = () => {
    Alert.alert(
      "Confirm Update",
      "Are you sure you want to update your profile?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              await profileService.updateProfile(form);
              Alert.alert("Success", "Profile updated");
              setEditMode(false);
              fetchProfile();
            } catch (error) {
              Alert.alert("Error", "Update failed");
            }
          },
        },
      ]
    );
  };

  // --------------------------
  // Change Password
  // --------------------------
  const handleChangePassword = () => {
    Alert.alert(
      "Confirm Change",
      "Are you sure you want to change your password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          onPress: async () => {
            try {
              await profileService.changePassword(
                pass.currentPassword,
                pass.newPassword,
                pass.confirmPassword
              );

              Alert.alert("Success", "Password changed");
              setPass({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            } catch (error: any) {
              Alert.alert("Error", error.response?.data || "Change failed");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleUploadAvatar}>
          <Image
            source={{
              uri:
                profile.avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.name}>{profile.fullName}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabItem, tab === "info" && styles.tabActive]}
          onPress={() => setTab("info")}
        >
          <Text style={styles.tabText}>Profile Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, tab === "password" && styles.tabActive]}
          onPress={() => setTab("password")}
        >
          <Text style={styles.tabText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- PROFILE INFO TAB ---------------- */}
      {tab === "info" && (
        <View style={{ padding: 20 }}>
          {!editMode && (
            <IconButton
              icon="pencil"
              size={24}
              style={{ alignSelf: "flex-end" }}
              onPress={() => setEditMode(true)}
            />
          )}

          {/* Fields */}
          {Object.keys(form).map((key) => (
            <TextInput
              key={key}
              label={key}
              value={(form as any)[key]}
              mode="outlined"
              editable={editMode}
              style={styles.input}
              onChangeText={(text) => setForm({ ...form, [key]: text })}
            />
          ))}

          {editMode && (
            <Button
              mode="contained"
              style={{ marginTop: 10 }}
              onPress={handleUpdateProfile}
            >
              Save Changes
            </Button>
          )}
        </View>
      )}

      {/* ---------------- CHANGE PASSWORD TAB ---------------- */}
      {tab === "password" && (
        <View style={{ padding: 20 }}>
          <TextInput
            label="Current Password"
            secureTextEntry
            mode="outlined"
            value={pass.currentPassword}
            onChangeText={(t) => setPass({ ...pass, currentPassword: t })}
            style={styles.input}
          />
          <TextInput
            label="New Password"
            secureTextEntry
            mode="outlined"
            value={pass.newPassword}
            onChangeText={(t) => setPass({ ...pass, newPassword: t })}
            style={styles.input}
          />
          <TextInput
            label="Confirm Password"
            secureTextEntry
            mode="outlined"
            value={pass.confirmPassword}
            onChangeText={(t) => setPass({ ...pass, confirmPassword: t })}
            style={styles.input}
          />

          <Button mode="contained" onPress={handleChangePassword}>
            Change Password
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#5A39F0",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
    color: "#1C1C1E",
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E6E6EF",
  },

  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#5A39F0",
  },

  tabText: {
    color: "#1C1C1E",
    fontWeight: "600",
  },

  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
});
