import * as FileSystem from 'expo-file-system/legacy';

const isWeb = typeof window !== 'undefined';

async function getItem(key: string): Promise<string | null> {
  try {
    if (isWeb) return localStorage.getItem(key);
    const path = `${FileSystem.documentDirectory}${key}.json`;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(path);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    const path = `${FileSystem.documentDirectory}${key}.json`;
    await FileSystem.writeAsStringAsync(path, value);
  } catch {
    // ignore
  }
}

export type FreePaywallFeature = 'scan' | 'quiz' | 'flashcard';

export async function shouldShowFreePaywallOffer(args: {
  feature: FreePaywallFeature;
  cooldownMs?: number;
}): Promise<boolean> {
  const { feature, cooldownMs = 6 * 60 * 60 * 1000 } = args;

  const key = `free_paywall_offer_last_shown_${feature}`;
  const raw = await getItem(key);
  if (!raw) return true;

  const last = Number(raw);
  if (!Number.isFinite(last) || last <= 0) return true;

  return Date.now() - last >= cooldownMs;
}

export async function markFreePaywallOfferShown(args: { feature: FreePaywallFeature }): Promise<void> {
  const { feature } = args;
  const key = `free_paywall_offer_last_shown_${feature}`;
  await setItem(key, String(Date.now()));
}
