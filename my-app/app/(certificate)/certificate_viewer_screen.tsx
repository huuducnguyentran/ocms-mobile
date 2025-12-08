import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getCertificateHtml } from "@/service/certificateService";

export default function CertificateViewerScreen() {
  const { certificateId, isPdf } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) loadCertificate(String(certificateId));
  }, []);

  const loadCertificate = async (id: string) => {
    try {
      const res = await getCertificateHtml(id);

      if (!res.success) {
        alert("Failed to load certificate");
        return;
      }

      const fileName = res.isPdf ? "certificate.pdf" : "certificate.html";
      const cacheDir = FileSystem["cacheDirectory"] as string;
      const fileUri = cacheDir + fileName;

      // Convert ArrayBuffer -> base64 safely in React Native
      const base64 = await FileSystem.encodeBase64Async(res.data);

      const EncodingType: any = FileSystem["EncodingType"];

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: EncodingType.Base64,
      });

      if (res.isPdf) {
        setPdfUri(fileUri);
      } else {
        // Convert base64 → UTF8 string
        const htmlString = atob(base64);
        setHtmlContent(htmlString);
      }

      setLoading(false);
    } catch (err) {
      console.log("Error loading certificate", err);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
  }

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
