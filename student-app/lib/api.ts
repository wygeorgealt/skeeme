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
        console.error(`[API] ❌ ${error.message} on ${error.config?.url}`);
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
