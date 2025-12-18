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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { TextInput, Button, IconButton } from "react-native-paper";
import { profileService } from "@/service/profileService";

const PRIMARY = "#5A39F0";
const TEXT_PRIMARY = "#111827"; // Almost black
const TEXT_SECONDARY = "#374151"; // Dark gray
const BORDER_DARK = "#D1D5DB";

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tab, setTab] = useState<"info" | "password">("info");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    sex: "",
    citizenId: "",
  });

  const [pass, setPass] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* ================= LOAD PROFILE ================= */
  const fetchProfile = async () => {
    try {
      const res = await profileService.getProfile();
      setProfile(res.data);
      setForm({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phoneNumber: res.data.phoneNumber || "",
        sex: res.data.sex || "",
        citizenId: res.data.citizenId || "",
      });
    } catch {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= AVATAR ================= */
  const handleUploadAvatar = async () => {
    const picker = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (picker.canceled) return;

    const asset = picker.assets[0];
    const fileName = asset.uri.split("/").pop()!;
    const type = fileName.split(".").pop();

    const formData: any = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: fileName,
      type: `image/${type}`,
    });

    try {
      await profileService.uploadAvatar(formData);
      fetchProfile();
    } catch {
      Alert.alert("Error", "Avatar upload failed");
    }
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdateProfile = async () => {
    try {
      await profileService.updateProfile(form);
      Alert.alert("Success", "Profile updated");
      setEditMode(false);
      fetchProfile();
    } catch {
      Alert.alert("Error", "Update failed");
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = async () => {
    try {
      await profileService.changePassword(
        pass.currentPassword,
        pass.newPassword,
        pass.confirmPassword
      );
      Alert.alert("Success", "Password changed");
      setPass({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      Alert.alert("Error", e.response?.data || "Change failed");
    }
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
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* ================= AVATAR CARD ================= */}
      <View style={styles.avatarCard}>
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
        <Text style={styles.role}>{profile.role}</Text>
      </View>

      {/* ================= TABS ================= */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "info" && styles.tabActive]}
          onPress={() => setTab("info")}
        >
          <Text style={tab === "info" ? styles.tabTextActive : styles.tabText}>
            Profile Info
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "password" && styles.tabActive]}
          onPress={() => setTab("password")}
        >
          <Text
            style={tab === "password" ? styles.tabTextActive : styles.tabText}
          >
            Password
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= PROFILE INFO ================= */}
      {tab === "info" && (
        <View style={styles.section}>
          {!editMode && (
            <IconButton
              icon="pencil"
              size={22}
              style={{ alignSelf: "flex-end" }}
              onPress={() => setEditMode(true)}
            />
          )}

          <TextInput
            label="Full Name"
            value={form.fullName}
            mode="outlined"
            editable={editMode}
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
            onChangeText={(t) => setForm({ ...form, fullName: t })}
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={form.email}
            mode="outlined"
            disabled
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
            style={styles.input}
          />

          <TextInput
            label="Phone Number"
            value={form.phoneNumber}
            mode="outlined"
            editable={editMode}
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
            onChangeText={(t) => setForm({ ...form, phoneNumber: t })}
            style={styles.input}
          />

          <TextInput
            label="Sex"
            value={form.sex}
            mode="outlined"
            editable={editMode}
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
            onChangeText={(t) => setForm({ ...form, sex: t })}
            style={styles.input}
          />

          <TextInput
            label="Citizen ID"
            value={form.citizenId}
            mode="outlined"
            editable={editMode}
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
            onChangeText={(t) => setForm({ ...form, citizenId: t })}
            style={styles.input}
          />

          {editMode && (
            <Button mode="contained" onPress={handleUpdateProfile}>
              Save Changes
            </Button>
          )}
        </View>
      )}

      {/* ================= PASSWORD ================= */}
      {tab === "password" && (
        <View style={styles.section}>
          <TextInput
            label="Current Password"
            secureTextEntry
            mode="outlined"
            value={pass.currentPassword}
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
            onChangeText={(t) => setPass({ ...pass, currentPassword: t })}
            style={styles.input}
          />
          <TextInput
            label="New Password"
            secureTextEntry
            mode="outlined"
            value={pass.newPassword}
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
            onChangeText={(t) => setPass({ ...pass, newPassword: t })}
            style={styles.input}
          />
          <TextInput
            label="Confirm Password"
            secureTextEntry
            mode="outlined"
            value={pass.confirmPassword}
            textColor={TEXT_PRIMARY}
            activeOutlineColor={PRIMARY}
            outlineColor={BORDER_DARK}
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginLeft: 8,
  },

  avatarCard: {
    alignItems: "center",
    marginTop: -30,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "white",
    elevation: 4,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: PRIMARY,
  },

  name: { fontSize: 20, fontWeight: "800", marginTop: 10 },
  role: { fontSize: 13, color: "#64748b" },

  tabs: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "#E8E7FF",
    borderRadius: 14,
  },

  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { backgroundColor: PRIMARY, borderRadius: 14 },
  tabText: { color: "#333", fontWeight: "600" },
  tabTextActive: { color: "white", fontWeight: "700" },

  section: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 16,
    elevation: 2,
  },

  input: { marginBottom: 14, backgroundColor: "white" },
});
