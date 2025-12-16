import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher"; // ✅ Android open file
import * as Sharing from "expo-sharing"; // ✅ iOS fallback
import { Buffer } from "buffer";
import { getCertificateHtml } from "@/service/certificateService";

export default function CertificateViewerScreen() {
  const { certificateId, isPdf } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) loadCertificate(String(certificateId));
  }, []);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    return Buffer.from(buffer).toString("base64");
  };

  // ----------------------------------------------
  // ✅ NEW: Auto-open PDF
  // ----------------------------------------------
  const openPdfFile = async (uri: string) => {
    if (Platform.OS === "android") {
      try {
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: uri,
          flags: 1,
          type: "application/pdf",
        });
      } catch (e) {
        console.log("Android open PDF error:", e);
      }
      return;
    }

    // iOS – must use sharing UI (auto-open is blocked)
    if (Platform.OS === "ios") {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
      return;
    }
  };

  const loadCertificate = async (id: string) => {
    try {
      const res = await getCertificateHtml(id);

      if (!res.success || !res.data) {
        alert("Failed to load certificate");
        return;
      }

      const isPdfFile = res.isPdf;
      const buffer: ArrayBuffer = res.data;

      // ---------------------------
      // 🔹 WEB
      // ---------------------------
      if (Platform.OS === "web") {
        const blob = new Blob([buffer], {
          type: isPdfFile ? "application/pdf" : "text/html",
        });

        const url = URL.createObjectURL(blob);

        if (isPdfFile) {
          window.open(url); // Auto-download/open
          setPdfUri(url);
        } else {
          const htmlText = await blob.text();
          setHtmlContent(htmlText);
        }

        setLoading(false);
        return;
      }

      // ---------------------------
      // 🔹 MOBILE (Android/iOS)
      // ---------------------------
      const base64 = arrayBufferToBase64(buffer);
      const fileName = isPdfFile
        ? `certificate_${id}.pdf`
        : `certificate_${id}.html`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (isPdfFile) {
        setPdfUri(fileUri);

        // ⭐ AUTO-OPEN THE PDF
        openPdfFile(fileUri);
      } else {
        const htmlDecoded = Buffer.from(base64, "base64").toString("utf8");
        setHtmlContent(htmlDecoded);
      }

      setLoading(false);
    } catch (err) {
      console.log("Error loading certificate", err);
      alert("Error loading certificate");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
  }

  // PDF will auto-download & auto-open, but we keep WebView fallback
  return (
    <View style={{ flex: 1 }}>
      {isPdf === "true" ? (
        <WebView source={{ uri: pdfUri! }} style={{ flex: 1 }} />
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
