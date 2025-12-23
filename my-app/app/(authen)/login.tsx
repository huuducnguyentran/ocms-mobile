// app/(authen)/login.tsx
import { loginService } from "@/service/loginServices";
import { BASE_URL } from "@/utils/environment";
import { storage } from "@/utils/storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter your username and password");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login with:", {
        username: username.trim(),
        baseUrl: BASE_URL,
      });
      const response = await loginService.login(username.trim(), password);
      console.log("Login response received:", {
        hasToken: !!response?.token,
        userId: response?.userId,
        roles: response?.roles,
        success: response?.success,
      });

      if (response && response.token) {
        // Check if user has allowed role (case-insensitive check)
        const allowedRoles = ["Trainee", "Director", "Instructor"];
        const userRole =
          response.roles && response.roles.length > 0
            ? response.roles[0]
            : null;

        // Normalize role for comparison (case-insensitive)
        const normalizedRole = userRole
          ? allowedRoles.find((r) => r.toLowerCase() === userRole.toLowerCase())
          : null;

        if (!normalizedRole) {
          const roleList = userRole
            ? `Your role: ${userRole}`
            : "No role assigned";
          Alert.alert(
            "Access Denied",
            `Only Trainee, Director, and Instructor roles are allowed to access this mobile app.\n\n${roleList}`
          );
          setLoading(false);
          return;
        }

        // Store authentication data (use normalized role to match NavItems)
        try {
          await storage.setItem("token", response.token);
          await storage.setItem("username", username.trim());
          await storage.setItem("userId", response.userId);
          await storage.setItem("role", normalizedRole);

          if (response.hubUrl) {
            await storage.setItem("hubUrl", response.hubUrl);
          }

          // Verify token was saved
          const savedToken = await storage.getItem("token");
          if (savedToken === response.token) {
            console.log("✅ Token saved successfully to AsyncStorage");
            console.log("✅ User data saved:", {
              userId: response.userId,
              role: normalizedRole,
              username: username.trim(),
            });
          } else {
            console.error("❌ Token save verification failed");
            Alert.alert(
              "Error",
              "Failed to save authentication data. Please try again."
            );
            setLoading(false);
            return;
          }
        } catch (storageError) {
          console.error("❌ Error saving to storage:", storageError);
          Alert.alert(
            "Error",
            "Failed to save authentication data. Please try again."
          );
          setLoading(false);
          return;
        }

        console.log("✅ Login successful, redirecting to home...");
        // Redirect to home after successful login and storage
        setLoading(false);
        router.replace("/(tabs)");
      } else {
        console.error("Invalid login response:", response);
        Alert.alert("Error", "Invalid login response from server.");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please check your credentials.";

      // Handle network errors
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage =
          `Cannot connect to server at ${BASE_URL}\n\n` +
          "Please check:\n" +
          "1. Backend API is running\n" +
          "2. BASE_URL is correct in app.json or .env\n" +
          "3. No firewall blocking the connection\n" +
          "4. Backend allows CORS from this origin";
      } else if (error.response) {
        // Server responded with error
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.title ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response
        errorMessage =
          "No response from server. Please check if backend API is running.";
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={require("@/assets/images/may-bay-2.jpeg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>VJ</Text>
              </View>
              <Text style={styles.title}>VJ ACADEMY</Text>
              <Text style={styles.subtitle}>
                ONLINE CERTIFICATE MANAGEMENT SYSTEM
              </Text>
            </View>

            {/* Member Login Title */}
            <Text style={styles.loginTitle}>Member Login</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Face Login Button */}
            <TouchableOpacity
              style={[
                styles.faceLoginButton,
                loading && styles.faceLoginButtonDisabled,
              ]}
              onPress={() => router.push("/(authen)/face-login-camera-screen" as any)}
              disabled={loading}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.faceLoginButtonText}>
                Đăng nhập bằng khuôn mặt
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push("/(authen)/forgot-password" as any)}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 40, 80, 0.15)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(25px)",
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 60,
    elevation: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#333",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "400",
    color: "#222",
    textAlign: "center",
    marginBottom: 35,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(0, 188, 212, 0.3)",
    padding: 14,
    fontSize: 15,
    color: "#333",
  },
  eyeButton: {
    position: "absolute",
    right: 15,
    top: 14,
    padding: 5,
  },
  eyeText: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: "#00bcd4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 25,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 188, 212, 0.3)",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  faceLoginButton: {
    backgroundColor: "#5A39F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 25,
    shadowColor: "#5A39F0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  faceLoginButtonDisabled: {
    opacity: 0.6,
  },
  faceLoginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  forgotPasswordButton: {
    alignItems: "center",
    padding: 10,
  },
  forgotPasswordText: {
    color: "#00bcd4",
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

