// app/(authen)/forgot-password.tsx
import { loginService } from "@/service/loginServices";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function ForgotPasswordScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async () => {
    if (!emailOrUsername.trim()) {
      Alert.alert("Error", "Please enter your email or username");
      return;
    }

    setLoading(true);
    try {
      await loginService.forgotPassword(emailOrUsername.trim());
      setSuccess(true);
      Alert.alert("Success", "Password reset instructions sent to your email!");

      // Auto redirect to login after 5 seconds
      setTimeout(() => {
        router.replace("/(authen)/login" as any);
      }, 5000);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      let errorMessage = "Failed to send reset email. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage =
          errorData.message ||
          errorData.title ||
          errorData.error ||
          (typeof errorData === "string" ? errorData : errorMessage);

        if (errorData.errors && typeof errorData.errors === "object") {
          const validationErrors = Object.values(errorData.errors).flat();
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join(", ");
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoText}>VJ</Text>
                </View>
                <Text style={styles.title}>VJ ACADEMY</Text>
                <Text style={styles.subtitle}>
                  ONLINE CERTIFICATE MANAGEMENT SYSTEM
                </Text>
              </View>

              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent password reset instructions to your email. Please
                check your inbox and follow the link to reset your password.
              </Text>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/(authen)/login" as any)}
              >
                <Text style={styles.backButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }

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

            {/* Forgot Password Title */}
            <Text style={styles.loginTitle}>Forgot Password?</Text>

            {/* Email/Username Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
                placeholderTextColor="#999"
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>← Back to Login</Text>
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
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4caf50",
    textAlign: "center",
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
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
  backButton: {
    backgroundColor: "#00bcd4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 17,
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

