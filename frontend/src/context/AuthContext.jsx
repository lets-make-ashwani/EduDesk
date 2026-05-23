import React, { createContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('access_token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('auth/me/');
            setUser(res.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const res = await api.post('auth/login/', { username, password });
        Cookies.set('access_token', res.data.access);
        Cookies.set('refresh_token', res.data.refresh);
        await fetchUser();
    };

    const logout = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
