import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCertificateHtml } from "@/service/certificateService";
import { Buffer } from "buffer";

const PRIMARY = "#3620AC";

type CertificateResponse = {
  success: boolean;
  data: ArrayBuffer;
  isPdf: boolean;
};

export default function CertificateViewerScreen() {
  const { certificateId } = useLocalSearchParams<{ certificateId: string }>();
  const router = useRouter();

  const webViewRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    if (certificateId) {
      loadCertificate(certificateId);
    }
  }, [certificateId]);

  /* ================= LOAD CERTIFICATE ================= */
  const loadCertificate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsPdf(false);
      setHtmlContent(null);

      const res: CertificateResponse = await getCertificateHtml(id);

      if (!res.success || !res.data) {
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

        // Convert ArrayBuffer to base64
        const base64 = Buffer.from(res.data).toString("base64");

        console.log(
          "[CertificateViewer] PDF detected, size:",
          res.data.byteLength,
          "bytes (base64:",
          base64.length,
          "chars)"
        );

        // Create HTML with embedded PDF using base64
        // Use object/embed tags for better mobile support
        const pdfHtml = `
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
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #fff;
    }
    .pdf-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    object, embed, iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    .fallback {
      display: none;
      padding: 20px;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="pdf-container">
    <object data="data:application/pdf;base64,${base64}" type="application/pdf" width="100%" height="100%">
      <embed src="data:application/pdf;base64,${base64}" type="application/pdf" width="100%" height="100%" />
      <iframe src="data:application/pdf;base64,${base64}" width="100%" height="100%">
        <div class="fallback">
          <p>PDF không thể hiển thị. Vui lòng tải về để xem.</p>
        </div>
      </iframe>
    </object>
  </div>
</body>
</html>`;

        setHtmlContent(pdfHtml);
        console.log(
          "[CertificateViewer] PDF embedded in HTML (works in Expo Go)"
        );

        setLoading(false);
        return;
      }

      // ================= HTML =================
      const htmlDecoded = Buffer.from(res.data).toString("utf8");
      setHtmlContent(htmlDecoded);
      setIsPdf(false);
      setLoading(false);
    } catch (err) {
      console.error("[CertificateViewer] Error:", err);
      setError("Unable to load certificate. Please try again.");
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

      {/* WEBVIEW */}
      {htmlContent ? (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("[WebView] HTML Error:", nativeEvent);
            setError("Failed to load certificate content.");
          }}
        />
      ) : null}
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
