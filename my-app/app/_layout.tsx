import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { storage } from "@/utils/storage";
import { PaperProvider } from "react-native-paper";

// Remove default anchor to prevent auto-navigation to tabs
// Authentication check will handle routing
export const unstable_settings = {
  // anchor: "(tabs)", // Removed to prevent auto-navigation before auth check
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasRedirected = useRef(false);

  // Check authentication function
  const checkAuth = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Auth check timeout")), 3000);
      });

      const checkPromise = (async () => {
        const token = await storage.getItem("token");
        const hasToken = !!token && token.trim() !== "";
        console.log("🔐 Auth check - Token exists:", hasToken);
        return hasToken;
      })();

      const hasToken = (await Promise.race([
        checkPromise,
        timeoutPromise,
      ])) as boolean;

      return hasToken;
    } catch (error) {
      console.error("❌ Error checking authentication:", error);
      // On error or timeout, assume not authenticated
      return false;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    let isMounted = true;

    const performCheck = async () => {
      const hasToken = await checkAuth();
      if (!isMounted) return;
      setIsAuthenticated(hasToken);
      setIsLoading(false);
    };

    performCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for route changes and re-check auth state (especially after logout)
  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] as string | undefined;
    const isAuthenGroup = currentSegment === "(authen)";
    const isLoginPage = isAuthenGroup;

    // When on login page, always re-check token to catch logout
    if (isLoginPage) {
      const recheckAuth = async () => {
        const hasToken = await checkAuth();
        if (hasToken !== isAuthenticated) {
          setIsAuthenticated(hasToken);
          hasRedirected.current = false;
        }
      };
      recheckAuth();
    }
  }, [segments, isLoading, isAuthenticated, checkAuth]);

  // Handle routing - Simple redirect logic with guard
  useEffect(() => {
    if (isLoading) return;

    const handleRouting = async () => {
      const currentSegment = segments[0] as string | undefined;
      const isProtectedRoute = currentSegment === "(tabs)";
      const isAuthenGroup = currentSegment === "(authen)";
      const isLoginPage = isAuthenGroup;

      // If trying to access protected route but not authenticated, re-check auth first
      // This handles the case where token was just saved after login
      if (isProtectedRoute && !isAuthenticated) {
        const hasToken = await checkAuth();
        if (hasToken) {
          setIsAuthenticated(true);
          // Don't redirect, let the auth state update trigger re-render
          return;
        }
      }

      // Check if we're already on the correct page - if so, reset flag and return early
      const isOnCorrectPage =
        (isAuthenticated && isProtectedRoute) ||
        (!isAuthenticated && isLoginPage);

      if (isOnCorrectPage) {
        // We're on the correct page, reset flag for future redirects
        hasRedirected.current = false;
        return;
      }

      // If not authenticated and not on login page, go to login (only once)
      if (!isAuthenticated && !isLoginPage && !hasRedirected.current) {
        console.log("🚫 Not authenticated, going to login...");
        hasRedirected.current = true;
        router.replace("/(authen)/login" as any);
        return;
      }

      // If authenticated and on login page, go to home (only once)
      if (isAuthenticated && isLoginPage && !hasRedirected.current) {
        console.log("✅ Authenticated, going to home...");
        hasRedirected.current = true;
        router.replace("/(tabs)" as any);
        return;
      }
    };

    handleRouting();
  }, [isAuthenticated, isLoading, segments, router, checkAuth]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bcd4" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(authen)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(certificate)" options={{ headerShown: false }} />
          <Stack.Screen name="(decision)" options={{ headerShown: false }} />
          <Stack.Screen name="(course)" options={{ headerShown: false }} />
          <Stack.Screen name="(subject)" options={{ headerShown: false }} />
          <Stack.Screen name="(plan)" options={{ headerShown: false }} />
          <Stack.Screen name="(curriculum)" options={{ headerShown: false }} />
          <Stack.Screen name="(class)" options={{ headerShown: false }} />
          <Stack.Screen name="(make-report)" options={{ headerShown: false }} />
          <Stack.Screen name="(grade)" options={{ headerShown: false }} />
          <Stack.Screen name="(specialty)" options={{ headerShown: false }} />
          <Stack.Screen
            name="change-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
