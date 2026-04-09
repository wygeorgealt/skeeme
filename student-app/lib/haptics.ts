import * as ExpoHaptics from 'expo-haptics';
import { useAuthStore } from '@/store/authStore';

/**
 * A wrapper for ExpoHaptics that respects the user's 'hapticsEnabled' preference.
 */
export const haptics = {
    /**
     * Trigger a notification haptic feedback (Success, Warning, Error)
     */
    notificationAsync: async (type: ExpoHaptics.NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType.Success) => {
        if (useAuthStore.getState().hapticsEnabled) {
            await ExpoHaptics.notificationAsync(type);
        }
    },

    /**
     * Trigger an impact haptic feedback (Light, Medium, Heavy)
     */
    impactAsync: async (style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Medium) => {
        if (useAuthStore.getState().hapticsEnabled) {
            await ExpoHaptics.impactAsync(style);
        }
    },

    /**
     * Trigger a selection haptic feedback
     */
    selectionAsync: async () => {
        if (useAuthStore.getState().hapticsEnabled) {
            await ExpoHaptics.selectionAsync();
        }
    },
};
