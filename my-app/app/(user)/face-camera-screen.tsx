// app/(user)/face-camera-screen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { faceRecognitionService } from "@/service/faceRecognitionService";
import * as FileSystem from "expo-file-system/legacy";
// Note: TensorFlow.js face detection requires complex setup for React Native
// For now, we'll do basic validation and let backend handle detailed face detection

const PRIMARY = "#5A39F0";

export default function FaceCameraScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [isDetectingFace, setIsDetectingFace] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={PRIMARY} />
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.text}>
          We need access to your camera to register your face.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Basic image validation (backend will do actual face detection)
  const validateImage = async (imageUri: string): Promise<boolean> => {
    try {
      setIsDetectingFace(true);
      console.log("🔍 Validating image...");

      // Get image dimensions to ensure it's a valid image
      const { width, height } = await new Promise<{
        width: number;
        height: number;
      }>((resolve, reject) => {
        Image.getSize(
          imageUri,
          (w, h) => resolve({ width: w, height: h }),
          (err) => reject(err)
        );
      });

      // Basic validation: check if image has reasonable dimensions
      const isValid = width > 100 && height > 100;
      console.log(
        `✅ Image validation result: ${
          isValid ? "Image valid" : "Image too small"
        } (${width}x${height})`
      );

      setIsDetectingFace(false);
      return isValid;
    } catch (error: any) {
      console.error("❌ Image validation error:", error);
      setIsDetectingFace(false);
      // If validation fails, allow the user to proceed (backend will validate)
      return true;
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !userId) {
      Alert.alert("Error", "Camera or user ID not available.");
      return;
    }

    try {
      setIsCapturing(true);

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo || !photo.uri) {
        throw new Error("Failed to capture photo");
      }

      // Save image to cache directory (temporary storage, may be cleared by system)
      // Note: Assets folder is read-only, cannot save dynamic files there
      let saveDir = FileSystem.cacheDirectory;
      if (!saveDir) {
        // If cache directory is null, try document directory as fallback
        saveDir = FileSystem.documentDirectory;
        if (!saveDir) {
          // If both are null, use the original photo URI directly
          console.warn(
            "⚠️ Cache and document directories not available, using original photo URI"
          );
          const isValid = await validateImage(photo.uri);
          setFaceDetected(isValid);
          setCapturedImage(photo.uri);
          setIsCapturing(false);
          return;
        }
      }

      // Create face_images directory if it doesn't exist
      const faceImagesDir = `${saveDir}face_images/`;
      const dirInfo = await FileSystem.getInfoAsync(faceImagesDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(faceImagesDir, {
          intermediates: true,
        });
      }

      // Generate filename with timestamp
      const timestamp = Date.now();
      const savedFileName = `face_register_${userId}_${timestamp}.jpg`;
      const savedImagePath = `${faceImagesDir}${savedFileName}`;

      // Copy captured image to saved location
      await FileSystem.copyAsync({
        from: photo.uri,
        to: savedImagePath,
      });

      console.log("💾 Image saved to:", savedImagePath);
      console.log("💾 Full saved image URI:", savedImagePath);

      // Validate saved image
      const isValid = await validateImage(savedImagePath);
      setFaceDetected(isValid);

      // Use saved image path instead of original
      setCapturedImage(savedImagePath);
      setIsCapturing(false);

      // Show alert if image validation failed
      if (!isValid) {
        Alert.alert(
          "No Face Detected",
          "We couldn't detect a face in this image. Please make sure:\n\n• Your face is clearly visible\n• Good lighting\n• Face is centered\n\nYou can still try to proceed, but the backend will also validate.",
          [
            {
              text: "Retake",
              onPress: () => {
                setCapturedImage(null);
                setFaceDetected(null);
              },
            },
            {
              text: "Continue Anyway",
              style: "default",
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Failed to capture photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
      setIsCapturing(false);
      setFaceDetected(null);
    }
  };

  const handleConfirm = async () => {
    if (!capturedImage || !userId) {
      return;
    }

    try {
      setIsProcessing(true);

      // Get image info
      let imageUri = capturedImage;

      // Normalize URI format for both iOS and Android
      if (Platform.OS === "ios") {
        // iOS: Remove file:// prefix for FormData
        if (imageUri.startsWith("file://")) {
          imageUri = imageUri.replace("file://", "");
        }
      } else if (Platform.OS === "android") {
        // Android: Ensure proper URI format
        if (
          !imageUri.startsWith("file://") &&
          !imageUri.startsWith("content://")
        ) {
          // If it's a path without protocol, add file://
          imageUri = imageUri.startsWith("/")
            ? `file://${imageUri}`
            : `file:///${imageUri}`;
        }
      }

      // Get file name and ensure proper extension
      const uriParts = imageUri.split("/");
      let fileName = uriParts[uriParts.length - 1] || "face.jpg";

      // Remove query parameters if any (Android might add these)
      if (fileName.includes("?")) {
        fileName = fileName.split("?")[0];
      }

      // Ensure file has .jpg extension
      if (
        !fileName.toLowerCase().endsWith(".jpg") &&
        !fileName.toLowerCase().endsWith(".jpeg")
      ) {
        const baseName = fileName.split(".")[0] || "face";
        fileName = `${baseName}.jpg`;
      }

      // Ensure file type is image/jpeg (not image/jpg)
      const fileType = "image/jpeg";

      // Log image info for debugging
      try {
        const imageInfo = await FileSystem.getInfoAsync(capturedImage);
        console.log("💾 Debug: Image info:", {
          exists: imageInfo.exists,
          uri: capturedImage,
          isDirectory: imageInfo.isDirectory,
          platform: Platform.OS,
        });

        // Log full URI for debugging (user can check this path)
        console.log("💾 Debug: Full image URI:", capturedImage);
        console.log("💾 Debug: Normalized URI:", imageUri);
        console.log("💾 Debug: File name:", fileName);
        console.log("💾 Debug: File type:", fileType);
      } catch (debugError) {
        console.log("⚠️ Could not get image info:", debugError);
      }

      // Create FormData
      const formData = new FormData();

      // Append userId as string
      formData.append("userId", userId);

      // Prepare file URI for FormData based on platform
      let fileUri: string;
      if (Platform.OS === "ios") {
        // iOS: Use URI without file:// prefix
        fileUri = imageUri;
      } else {
        // Android: Use URI as-is (can be file:// or content://)
        fileUri = capturedImage; // Use original capturedImage URI for Android
        // If it doesn't have protocol, add file://
        if (
          !fileUri.startsWith("file://") &&
          !fileUri.startsWith("content://")
        ) {
          fileUri = fileUri.startsWith("/")
            ? `file://${fileUri}`
            : `file:///${fileUri}`;
        }
      }

      // Append imageFile - React Native FormData format
      formData.append("imageFile", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);

      // Log detailed info for debugging
      console.log("📤 Sending face registration:", {
        userId,
        fileName,
        fileType,
        platform: Platform.OS,
        originalUri: capturedImage.substring(0, 60) + "...",
        fileUri: fileUri.substring(0, 60) + "...",
        uriLength: fileUri.length,
      });

      // Log FormData contents (for debugging)
      console.log("📋 FormData contents:", {
        userId: userId,
        imageFile: {
          uri: fileUri.substring(0, 60) + "...",
          name: fileName,
          type: fileType,
        },
      });

      // Send to API - Backend will validate face detection
      const response = await faceRecognitionService.registerFace(
        userId,
        formData
      );

      if (response.success) {
        Alert.alert("Success", "Face registered successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message ||
            "Failed to register face. Please make sure your face is clearly visible."
        );
        setCapturedImage(null);
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("❌ Failed to register face:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      // Get detailed error message
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        error.message ||
        "Failed to register face. Please try again.";

      console.log("📋 Error message:", errorMessage);

      // Check if error is about face detection
      const errorLower = errorMessage.toLowerCase();
      if (
        errorLower.includes("face") ||
        errorLower.includes("detect") ||
        errorLower.includes("no face") ||
        errorLower.includes("không phát hiện") ||
        errorLower.includes("không tìm thấy") ||
        errorLower.includes("not found")
      ) {
        Alert.alert(
          "Face Not Detected",
          "No face was detected in the image. Please make sure:\n\n• Your face is clearly visible\n• Good lighting\n• Face is centered in frame\n• No obstructions (glasses, mask, etc.)\n\nPlease try again.",
          [
            {
              text: "Retake",
              onPress: () => {
                setCapturedImage(null);
                setIsProcessing(false);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          `Failed to register face:\n\n${errorMessage}\n\nPlease check:\n• Your face is clearly visible\n• Good lighting\n• Try again`,
          [
            {
              text: "Retake",
              onPress: () => {
                setCapturedImage(null);
                setIsProcessing(false);
              },
            },
          ]
        );
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsCapturing(false);
  };

  // Show preview if image is captured
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleRetake}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Photo</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <View style={styles.instructionCard}>
            <Ionicons
              name={
                faceDetected === true
                  ? "checkmark-circle"
                  : faceDetected === false
                  ? "close-circle"
                  : "information-circle"
              }
              size={24}
              color={
                faceDetected === true
                  ? "#4CAF50"
                  : faceDetected === false
                  ? "#D32F2F"
                  : "#fff"
              }
            />
            <Text style={styles.instructionText}>
              {isDetectingFace
                ? "Detecting face..."
                : faceDetected === true
                ? "Face detected! Please confirm this photo."
                : faceDetected === false
                ? "No face detected. Please retake or continue anyway (backend will validate)."
                : "Please confirm this photo. Make sure your face is clearly visible and centered."}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetake}
            disabled={isProcessing}
          >
            <Ionicons name="refresh" size={24} color={PRIMARY} />
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              faceDetected === false && styles.confirmButtonWarning,
            ]}
            onPress={handleConfirm}
            disabled={isProcessing || isDetectingFace}
          >
            {isProcessing || isDetectingFace ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register Face</Text>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
          >
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Face Guide Frame - Oval Shape */}
        <View style={styles.faceGuideContainer}>
          <View style={styles.faceGuideFrame}>
            {/* Face outline guide */}
            <View style={styles.faceOutline}>
              {/* Top curve (forehead) */}
              <View style={styles.faceCurveTop} />
              {/* Face center indicator */}
              <View style={styles.faceCenter}>
                <Ionicons name="person" size={32} color={PRIMARY} />
              </View>
              {/* Bottom curve (chin) */}
              <View style={styles.faceCurveBottom} />
            </View>
          </View>
          <Text style={styles.guideText}>Position your face in the frame</Text>
          <Text style={styles.guideSubtext}>
            Make sure your face is clearly visible and well-lit
          </Text>
        </View>

        {/* Capture Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  flipButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  faceGuideContainer: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    alignItems: "center",
    zIndex: 5,
  },
  faceGuideFrame: {
    width: 250,
    height: 320,
    borderWidth: 3,
    borderColor: PRIMARY,
    borderRadius: 160, // Make it oval/face-shaped
    borderStyle: "dashed",
    // Create oval shape by making it taller than wide
    aspectRatio: 0.78, // Face-like proportions
  },
  guideText: {
    marginTop: 20,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  guideSubtext: {
    marginTop: 8,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  faceOutline: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  faceCurveTop: {
    position: "absolute",
    top: 10,
    left: "20%",
    right: "20%",
    height: 60,
    borderTopWidth: 2,
    borderTopColor: PRIMARY,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    opacity: 0.6,
  },
  faceCenter: {
    position: "absolute",
    top: "45%",
    left: "50%",
    transform: [{ translateX: -16 }, { translateY: -16 }],
    opacity: 0.4,
  },
  faceCurveBottom: {
    position: "absolute",
    bottom: 10,
    left: "25%",
    right: "25%",
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    opacity: 0.6,
  },
  instructionContainer: {
    position: "absolute",
    top: "20%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    marginHorizontal: 20,
    gap: 12,
  },
  instructionText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    textAlign: "left",
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retakeButtonText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  confirmButtonWarning: {
    backgroundColor: "#FF9800",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
