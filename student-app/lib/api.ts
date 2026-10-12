import axios from 'axios';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export const api = axios.create({
    baseURL: API_URL,
    // A stopped backend should move the app into its graceful offline state soon,
    // rather than leaving a spinner on screen for a full minute.
    timeout: 12000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
});

// Retry configuration
const MAX_RETRIES = 1;
const RETRY_DELAY = 1000; // 1s

// P0: Cache network state with a listener instead of fetching per-request.
// NetInfo.fetch() is a native bridge call (~100-300ms). Calling it on every API
// request blocks the JS thread and compounds during streaming bursts.
let cachedNetInfo: NetInfoState | null = null;
let serviceFailureNotified = false;
NetInfo.addEventListener((state) => {
    cachedNetInfo = state;
    if (state.isConnected === false || state.isInternetReachable === false) {
        useAuthStore.getState().setConnectionState('offline');
    } else if (state.isConnected === true && useAuthStore.getState().connectionState === 'offline') {
        // Network transport returned; wait for the health probe before enabling
        // generation actions again.
        useAuthStore.getState().setConnectionState('serverDown');
    }
});

function notifyServiceFailure(message: string) {
    if (serviceFailureNotified) return;
    serviceFailureNotified = true;
    useAuthStore.getState().setGlobalError(message);
}

// Single request interceptor: attach auth token and network metadata
api.interceptors.request.use(
    (config) => {
        // Attach network quality headers using cached state (zero bridge overhead)
        if (cachedNetInfo) {
            config.headers['X-Network-Type'] = cachedNetInfo.type;
            if (cachedNetInfo.type === 'cellular') {
                config.headers['X-Network-Generation'] = (cachedNetInfo.details as any)?.cellularGeneration || 'unknown';
            }
        }

        if (__DEV__ && config.method?.toUpperCase() !== 'GET') {
            const fullUrl = `${config.baseURL}${config.url}`;
            console.log(`[API] ${config.method?.toUpperCase()} ${fullUrl}`);
        }
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and Retries
api.interceptors.response.use(
    (response) => {
        // A successful response marks the current outage as recovered, allowing a
        // later, genuinely new outage to be surfaced once.
        serviceFailureNotified = false;
        useAuthStore.getState().setConnectionState('online');
        if (__DEV__ && response.config.method?.toUpperCase() !== 'GET') {
            console.log(`[API] ✅ ${response.status} from ${response.config.url}`);
        }
        // Consistent data extraction helper:
        // Returns response.data.data if it exists, otherwise response.data
        return response;
    },
    async (error) => {
        const { config, response } = error;
        const url = config?.url;
        const { user, logout } = useAuthStore.getState();

        // 1. Handle 401 Unauthorized
        if (response?.status === 401) {
            if (user && !url?.includes('logout')) {
                if (__DEV__) console.warn(`[API] 401 Unauthorized on ${url} - triggering logout`);
                logout();
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 402) {
            useAuthStore.getState().toggleCreditsModal(true);
            return Promise.reject(error);
        }

        if (error.response?.status === 429) {
            const aiRoutes = ['generate', 'stream', 'flashcards/decks', 'solve'];
            if (aiRoutes.some(r => url?.includes(r))) {
                useAuthStore.getState().toggleCooldownModal(true);
            }
            return Promise.reject(error);
        }

        // 2. Handle Network Retries (Beginner mistake: no retries)
        config.retryCount = config.retryCount || 0;
        
        const isNetworkError = !response;
        const isIdempotent = config.method === 'get'; // Safest to retry GETs
        
        if (isNetworkError && isIdempotent && config.retryCount < MAX_RETRIES && cachedNetInfo?.isConnected !== false) {
            config.retryCount += 1;
            if (__DEV__) console.warn(`[API] Network error on ${url}. Retrying (${config.retryCount}/${MAX_RETRIES})...`);
            
            // Backoff delay
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, config.retryCount - 1)));
            return api(config);
        }

        // Expected service outages are already represented by the single global
        // offline/unavailable UI. Do not turn them into red development errors.
        if (__DEV__ && response?.status && response.status < 500 && response.status !== 404) {
            const errorMsg = response?.data?.message || error.message;
            const errorCode = error.code;
            console.error(`[API] ❌ ${errorMsg} (Code: ${errorCode}) on ${url}`, {
                status: response?.status,
                headers: response?.headers,
                config: {
                    method: config?.method,
                    headers: config?.headers,
                }
            });
        }

        // Centralise service failures so individual screens never need to render a
        // raw Axios error or compete to show their own alert/modal.
        if (response?.status && response.status >= 500 && !(config as any)?.skipGlobalError) {
            useAuthStore.getState().setConnectionState('serverDown');
            notifyServiceFailure('Skeeme is temporarily unavailable. Your saved content is still available offline; please try again later.');
        } else if (isNetworkError) {
            const offline = cachedNetInfo?.isConnected === false || cachedNetInfo?.isInternetReachable === false;
            useAuthStore.getState().setConnectionState(offline ? 'offline' : 'serverDown');
            notifyServiceFailure(offline
                ? 'You’re offline. You can continue with content already saved on this device.'
                : 'Skeeme can’t reach the server right now. Please try again later.');
        }

        // Sanitize raw errors before they reach local Alert.alert() catches
        if (error.response) {
            const status = error.response.status;
            // Ensure data object exists so we can safely set .message
            if (!error.response.data || typeof error.response.data !== 'object') {
                error.response.data = {};
            }
            
            if (status >= 500) {
                error.response.data.message = 'Skeeme is currently down for maintenance. Please try again later.';
            } else if (status === 404) {
                error.response.data.message = 'That content is unavailable right now. Please refresh and try again.';
            } else if (status === 403) {
                error.response.data.message = 'You do not have permission to perform this action.';
            } else if (status === 421) {
                error.response.data.message = 'Service temporarily unavailable. Please try again.';
            } else if (status === 304) {
                error.response.data.message = 'No changes were made.';
            }
        } else if (isNetworkError) {
            // Provide a safe fallback for network timeouts so local catches read it cleanly
            error.response = { data: { message: 'Network connection lost. Please check your internet.' } } as any;
        }
        
        return Promise.reject(error);
    }
);

/**
 * Enhanced API wrappers to address "Return inconsistent response shapes"
 */
export const apiStandard = {
    get: async <T = any>(url: string, config?: any): Promise<T> => {
        const res = await api.get(url, config);
        return res.data.data !== undefined ? res.data.data : res.data;
    },
    post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        const res = await api.post(url, data, config);
        return res.data.data !== undefined ? res.data.data : res.data;
    },
    put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        const res = await api.put(url, data, config);
        return res.data.data !== undefined ? res.data.data : res.data;
    },
    delete: async <T = any>(url: string, config?: any): Promise<T> => {
        const res = await api.delete(url, config);
        return res.data.data !== undefined ? res.data.data : res.data;
    }
};
