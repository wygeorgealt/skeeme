import { useColorScheme as useRNColorScheme, Appearance, Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';

/**
 * Returns the effective color scheme ('light' | 'dark'), respecting the user's
 * in-app theme preference stored in authStore ('light' | 'dark' | 'system').
 *
 * When set to 'system', it dynamically respects the device's actual OS theme.
 */
export function useColorScheme(): 'light' | 'dark' {
  const storeTheme = useAuthStore((state) => state.theme);
  const rnScheme = useRNColorScheme();

  if (storeTheme === 'dark') return 'dark';
  if (storeTheme === 'light') return 'light';
  return rnScheme === 'dark' ? 'dark' : 'light';
}

