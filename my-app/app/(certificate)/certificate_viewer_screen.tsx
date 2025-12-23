import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";

// Try to import react-native-pdf, but handle if it's not available
let Pdf: any = null;
try {
  Pdf = require("react-native-pdf").default;
} catch (e) {
  console.warn(
    "[CertificateViewer] react-native-pdf not available, will use fallback"
  );
}
import { getCertificateHtml } from "@/service/certificateService";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";

const PRIMARY = "#3620AC";

type CertificateResponse = {
  success: boolean;
  data: ArrayBuffer;
  isPdf: boolean;
};

export default function CertificateViewerScreen() {
  const { certificateId: rawCertificateId } = useLocalSearchParams<{
    certificateId: string | string[];
  }>();
  const router = useRouter();

  // Fix: Handle array case from useLocalSearchParams
  const certificateId = Array.isArray(rawCertificateId)
    ? rawCertificateId[0]
    : rawCertificateId;

  const webViewRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) {
      loadCertificate(certificateId);
    }
  }, [certificateId]);

  /* ================= OPEN PDF WITH SYSTEM APP (FALLBACK) ================= */
  const openPdfWithSystemApp = async (fileUri: string) => {
    try {
      if (Platform.OS === "android") {
        // Android: Use IntentLauncher
        try {
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
              type: "application/pdf",
            }
          );
          console.log("[CertificateViewer] PDF opened with Android intent");
          setTimeout(() => {
            router.back();
          }, 500);
        } catch (intentError) {
          console.error(
            "[CertificateViewer] Intent error, trying sharing:",
            intentError
          );
          // Fallback to sharing
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: "application/pdf",
              dialogTitle: "Open Certificate PDF",
            });
            setTimeout(() => {
              router.back();
            }, 500);
          } else {
            throw new Error("Cannot open PDF on this device");
          }
        }
      } else {
        // iOS: Use Sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Open Certificate PDF",
          });
          console.log("[CertificateViewer] PDF shared on iOS");
          setTimeout(() => {
            router.back();
          }, 500);
        } else {
          throw new Error("Sharing not available on this device");
        }
      }
    } catch (error) {
      console.error("[CertificateViewer] Error opening PDF:", error);
      setError("Không thể mở PDF. Vui lòng thử lại.");
    }
  };

  /* ================= LOAD CERTIFICATE ================= */
  const loadCertificate = async (id: string) => {
    try {
      console.log("[CertificateViewer] Loading certificate:", id);
      setLoading(true);
      setError(null);
      setIsPdf(false);
      setHtmlContent(null);

      const res: CertificateResponse = await getCertificateHtml(id);

      console.log("[CertificateViewer] Response:", {
        success: res.success,
        isPdf: res.isPdf,
        dataSize: res.data ? res.data.byteLength : 0,
      });

      if (!res.success || !res.data) {
        console.error("[CertificateViewer] Invalid response:", res);
        throw new Error("Failed to load certificate");
      }

      // ================= WEB PLATFORM =================
      if (Platform.OS === "web") {
        const blob = new Blob([res.data], {
          type: res.isPdf ? "application/pdf" : "text/html",
        });

        const url = URL.createObjectURL(blob);

        if (res.isPdf) {
          window.open(url);
          setIsPdf(true);
        } else {
          const htmlText = await blob.text();
          setHtmlContent(htmlText);
        }

        setLoading(false);
        return;
      }

      // ================= PDF - MOBILE (iOS & Android) =================
      if (res.isPdf) {
        setIsPdf(true);

        console.log(
          "[CertificateViewer] PDF detected, size:",
          res.data.byteLength,
          "bytes"
        );

        try {
          // Convert ArrayBuffer to base64
          const uint8Array = new Uint8Array(res.data);
          const base64 = Buffer.from(uint8Array).toString("base64");

          // Save PDF to file system for react-native-pdf
          const fileName = `certificate_${id}_${Date.now()}.pdf`;
          const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

          console.log("[CertificateViewer] Saving PDF to file system...");

          // Write file using base64 encoding
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log("[CertificateViewer] PDF saved to:", fileUri);

          // Check if react-native-pdf is available
          if (Pdf) {
            // Use react-native-pdf component (requires Expo Dev Client)
            const finalUri =
              Platform.OS === "android"
                ? fileUri.startsWith("file://")
                  ? fileUri
                  : `file://${fileUri}`
                : fileUri;

            setPdfUri(finalUri);
            setLoading(false);
            return;
          } else {
            // Fallback: Open PDF with system app
            console.log(
              "[CertificateViewer] react-native-pdf not available, opening with system app"
            );
            // Show message to user
            Alert.alert(
              "Mở PDF",
              "PDF sẽ được mở bằng ứng dụng hệ thống. Bạn có muốn tiếp tục?",
              [
                {
                  text: "Hủy",
                  style: "cancel",
                  onPress: () => {
                    setLoading(false);
                    router.back();
                  },
                },
                {
                  text: "Mở",
                  onPress: async () => {
                    await openPdfWithSystemApp(fileUri);
                    setLoading(false);
                  },
                },
              ]
            );
            return;
          }
        } catch (fileError) {
          console.error("[CertificateViewer] Error saving PDF:", fileError);
          setError("Không thể tải PDF. Vui lòng thử lại.");
          setLoading(false);
          return;
        }
      }

      // ================= HTML =================
      // Convert ArrayBuffer to string for HTML content
      const uint8Array = new Uint8Array(res.data);
      const htmlDecoded = Buffer.from(uint8Array).toString("utf8");

      // Wrap HTML content in a mobile-friendly container
      // Fix for Android: Make HTML fit to screen without scrolling
      const screenWidth = Dimensions.get("window").width;
      const screenHeight = Dimensions.get("window").height;

      const wrappedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: fixed;
    }
    body {
      width: 100%;
      height: 100%;
      overflow: auto;
      background: #fff;
      -webkit-overflow-scrolling: touch;
      position: relative;
      padding: 0;
      margin: 0;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    /* Ensure content fits within viewport */
    body > * {
      max-width: 100%;
    }
    /* Scale content to fit if needed */
    @media screen and (max-width: ${screenWidth}px) {
      body {
        transform-origin: top left;
      }
    }
  </style>
</head>
<body>
  ${htmlDecoded}
</body>
</html>`;

      setHtmlContent(wrappedHtml);
      setIsPdf(false);
      console.log(
        "[CertificateViewer] HTML content set, length:",
        wrappedHtml.length
      );

      // Small delay to ensure state is set
      setTimeout(() => {
        setLoading(false);
      }, 100);
    } catch (err: any) {
      console.error("[CertificateViewer] Error:", err);
      const errorMessage =
        err?.message || "Unable to load certificate. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Certificate</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading certificate...</Text>
        </View>
      </View>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Certificate</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  /* ================= RENDER ================= */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificate</Text>
      </View>

      {/* PDF VIEWER - Using react-native-pdf (requires Expo Dev Client) */}
      {isPdf && pdfUri ? (
        <Pdf
          source={{ uri: pdfUri, cache: true }}
          style={styles.pdf}
          onLoadComplete={(numberOfPages: number) => {
            console.log(`[PDF] Loaded ${numberOfPages} pages`);
            setLoading(false);
          }}
          onPageChanged={(page: number, numberOfPages: number) => {
            console.log(`[PDF] Page ${page} of ${numberOfPages}`);
          }}
          onError={(error: any) => {
            console.error("[PDF] Error:", error);
            setError("Không thể tải PDF. Vui lòng thử lại.");
            setLoading(false);
          }}
          onLoadProgress={(percent: number) => {
            console.log(
              `[PDF] Loading progress: ${Math.round(percent * 100)}%`
            );
            if (percent > 0.9) {
              setLoading(false);
            }
          }}
          enablePaging={false}
          fitPolicy={0} // Fit width
          spacing={0}
          minScale={0.5}
          maxScale={3.0}
          scale={1.0}
        />
      ) : htmlContent ? (
        /* HTML VIEWER - Using WebView */
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={Platform.OS === "android"}
          showsVerticalScrollIndicator={!isPdf}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!isPdf}
          nestedScrollEnabled={!isPdf}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => {
            console.log("[WebView] Loading started");
          }}
          onLoadEnd={() => {
            console.log("[WebView] Loading completed");
            setLoading(false);
          }}
          onLoadProgress={({ nativeEvent }) => {
            const progress = nativeEvent.progress;
            console.log(
              "[WebView] Loading progress:",
              Math.round(progress * 100) + "%"
            );
            if (progress > 0.9) {
              setLoading(false);
            }
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("[WebView] Error:", nativeEvent);
            setError("Failed to load certificate content. Please try again.");
            setLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("[WebView] HTTP Error:", nativeEvent);
            setError("Network error. Please check your connection.");
            setLoading(false);
          }}
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={PRIMARY} />
              <Text style={styles.loadingText}>Loading certificate...</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Preparing certificate...</Text>
        </View>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  backIcon: {
    fontSize: 28,
    color: PRIMARY,
    fontWeight: "bold",
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: PRIMARY,
    fontSize: 14,
  },

  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
  },

  pdf: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },

  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
