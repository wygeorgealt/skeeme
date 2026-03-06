import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Direct Render URL — bypasses Cloudflare bot protection that blocks mobile POST requests
const API_URL = 'https://skeeme-web.onrender.com/api/v1/student/';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 seconds (needed for OCR + DeepSeek image processing)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Single request interceptor: log + attach auth token
api.interceptors.request.use(
    (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`[API] ${config.method?.toUpperCase()} ${fullUrl}`);
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: log + handle 401
api.interceptors.response.use(
    (response) => {
        console.log(`[API] ✅ ${response.status} from ${response.config.url}`);
        return response;
    },
    (error) => {
        const url = error.config?.url;
        // Don't log spam for background 401s if we're already unauthenticated
        const isAuthCall = url?.includes('me') || url?.includes('streaks/heatmap');
        const { user, logout } = useAuthStore.getState();

        if (error.response?.status === 401) {
            if (user && !url?.includes('logout')) {
                console.warn(`[API] 401 Unauthorized on ${url} - triggering logout`);
                logout();
            }
            // If it's a 401 on logout, we just ignore it as it's likely a stale token
            return Promise.reject(error);
        }

        console.error(`[API] ❌ ${error.message} on ${url}`);
        return Promise.reject(error);
    }
);
