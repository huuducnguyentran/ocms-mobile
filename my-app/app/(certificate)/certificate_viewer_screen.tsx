import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { getCertificateHtml } from "@/service/certificateService";
import { Buffer } from "buffer";

type CertificateResponse = {
  success: boolean;
  data: ArrayBuffer;
  isPdf: boolean;
};

export default function CertificateViewerScreen() {
  const { certificateId } = useLocalSearchParams<{ certificateId: string }>();

  const webViewRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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

      const res: CertificateResponse = await getCertificateHtml(id);

      if (!res.success || !res.data) {
        throw new Error("Failed to load certificate");
      }

      // Convert ArrayBuffer → Blob URL (WEB)
      if (Platform.OS === "web") {
        const blob = new Blob([res.data], {
          type: res.isPdf ? "application/pdf" : "text/html",
        });

        const url = URL.createObjectURL(blob);

        if (res.isPdf) {
          window.open(url);
          setPdfUrl(url);
        } else {
          const htmlText = await blob.text();
          setHtmlContent(htmlText);
        }

        setLoading(false);
        return;
      }

      // ================= PDF =================
      if (res.isPdf) {
        const base64 = Buffer.from(res.data).toString("base64");
        const rawPdfUrl = `data:application/pdf;base64,${base64}`;

        // ANDROID → Google PDF Viewer (stable)
        if (Platform.OS === "android") {
          const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
            rawPdfUrl
          )}`;
          setPdfUrl(googleViewerUrl);
        } else {
          // iOS
          setPdfUrl(rawPdfUrl);
        }

        setLoading(false);
        return;
      }

      // ================= HTML =================
      const htmlDecoded = Buffer.from(res.data).toString("utf8");
      setHtmlContent(htmlDecoded);
      setLoading(false);
    } catch (err) {
      console.error("[CertificateViewer] Error:", err);
      setError("Unable to load certificate");
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3620AC" />
        <Text style={styles.loadingText}>Loading certificate...</Text>
      </View>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  /* ================= RENDER ================= */
  return (
    <View style={styles.container}>
      {pdfUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: pdfUrl }}
          style={{ flex: 1 }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
        />
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent! }}
          style={{ flex: 1 }}
        />
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#3620AC",
    fontSize: 14,
  },

  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
  },
});
