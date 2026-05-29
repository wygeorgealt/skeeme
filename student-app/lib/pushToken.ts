import { api } from '@/lib/api';

let tokenSynced = false;

export async function syncPushTokenIfNeeded(token?: string | null, authToken?: string | null) {
    if (!token) return false;
    if (tokenSynced) return true;

    if (!authToken) {
        // Can't sync until user is authenticated
        return false;
    }

    try {
        await api.post('device-token', { expo_push_token: token }, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        tokenSynced = true;
        if (__DEV__) console.log('Successfully synced push token to backend (guarded):', token);
        return true;
    } catch (e) {
        if (__DEV__) console.error('Push Token sync failed (guarded):', e);
        return false;
    }
}

export function resetPushTokenGuard() {
    tokenSynced = false;
}
