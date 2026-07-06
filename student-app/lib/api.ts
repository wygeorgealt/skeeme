import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
    },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1s

// Single request interceptor: attach auth token and network metadata
api.interceptors.request.use(
    async (config) => {
        // Attach network quality headers for AI timeout optimization
        try {
            const netInfo = await NetInfo.fetch();
            config.headers['X-Network-Type'] = netInfo.type;
            if (netInfo.type === 'cellular') {
                config.headers['X-Network-Generation'] = (netInfo.details as any)?.cellularGeneration || 'unknown';
            }
        } catch (e) {
            if (__DEV__) console.error('[API] Failed to fetch network info', e);
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
        
        if (isNetworkError && isIdempotent && config.retryCount < MAX_RETRIES) {
            config.retryCount += 1;
            if (__DEV__) console.warn(`[API] Network error on ${url}. Retrying (${config.retryCount}/${MAX_RETRIES})...`);
            
            // Backoff delay
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, config.retryCount - 1)));
            return api(config);
        }

        if (__DEV__) {
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

        // Global fallback for 500 errors to ensure an error is always shown (using the custom modal)
        if (response?.status && response.status >= 500 && !(config as any)?.skipGlobalError) {
            useAuthStore.getState().setGlobalError('Skeeme is currently down. Please try again later.');
        } else if (isNetworkError && config.retryCount >= MAX_RETRIES) {
            // Network-side failure — user's connection, not our server
            useAuthStore.getState().setGlobalError('No internet connection. Check your network and try again.');
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
