import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export const api = axios.create({
    baseURL: API_URL,
    timeout: 180000, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1s

// Single request interceptor: attach auth token
api.interceptors.request.use(
    (config) => {
        if (__DEV__) {
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
        if (__DEV__) {
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
            const { useAuthStore } = require('@/store/authStore');
            useAuthStore.getState().toggleCreditsModal(true);
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
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config.retryCount));
            return api(config);
        }

        if (__DEV__) {
            const errorMsg = response?.data?.message || error.message;
            console.error(`[API] ❌ ${errorMsg} on ${url}`);
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
