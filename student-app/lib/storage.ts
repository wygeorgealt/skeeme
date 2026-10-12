import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

function getFilePath(key: string) {
  // Replace slashes or colons in keys so they form valid file names
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${FileSystem.documentDirectory}${safeKey}.json`;
}

export const appStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      }
      const path = getFilePath(key);
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) return null;
      return await FileSystem.readAsStringAsync(path);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      const path = getFilePath(key);
      await FileSystem.writeAsStringAsync(path, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return;
      }
      const path = getFilePath(key);
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
    } catch {
      // ignore
    }
  },
};
