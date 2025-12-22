import { Stack } from "expo-router";

export default function AuthenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="face-login-camera-screen" />
    </Stack>
  );
}

