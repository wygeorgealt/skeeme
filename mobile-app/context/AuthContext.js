import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        checkToken();
    }, []);

    const login = async (token) => {
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ isLoading, userToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
