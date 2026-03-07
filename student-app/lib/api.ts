import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://skeeme-web.onrender.com/api/v1/student/';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 seconds (needed for OCR + DeepSeek image processing)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

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

// Response interceptor: handle 401
api.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log(`[API] ✅ ${response.status} from ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        const url = error.config?.url;
        const { user, logout } = useAuthStore.getState();

        if (error.response?.status === 401) {
            if (user && !url?.includes('logout')) {
                if (__DEV__) console.warn(`[API] 401 Unauthorized on ${url} - triggering logout`);
                logout();
            }
            return Promise.reject(error);
        }

        if (__DEV__) console.error(`[API] ❌ ${error.message} on ${url}`);
        return Promise.reject(error);
    }
);
