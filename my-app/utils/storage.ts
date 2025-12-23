// utils/storage.ts - Storage utility for React Native using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error: any) {
      // On iOS, AsyncStorage.clear() sometimes tries to delete a directory that doesn't exist
      // This is a known issue and can be safely ignored
      if (
        error?.code === 4 ||
        error?.domain === "NSCocoaErrorDomain" ||
        error?.message?.includes("couldn't be removed")
      ) {
        // Silently ignore - this is a known iOS issue where the directory is already removed
        return;
      }
      // For other errors, log but don't throw - allow app to continue
      console.warn("Storage clear warning (can be ignored):", error);
    }
  },
};

