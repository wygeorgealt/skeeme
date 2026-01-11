import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual Render URL
const API_URL = 'https://skeeme.com/api/v1/team';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/logout');
    } catch (e) {
        // Ignore logout errors
    }
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
};

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard');
    return response.data;
};

export const getLogs = async (lines = 100) => {
    const response = await api.get(`/logs?lines=${lines}`);
    return response.data;
};

export const getErrors = async () => {
    const response = await api.get('/logs/errors');
    return response.data;
};

export default api;
