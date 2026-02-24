import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Determine base URL based on environment. 
// For local Android emulator testing pointing to Laravel Herd on host machine, use 10.0.2.2.
// For iOS Simulator pointing to host, use localhost or 127.0.0.1.
// A physical device needs the internal IP address of the computer running Herd.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1/student';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial during local dev
    },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
