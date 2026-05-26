import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api/' : 'https://edudesk-api.onrender.com/api/'),
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = Cookies.get('refresh_token');
                if (refreshToken) {
                    const res = await axios.post(`${api.defaults.baseURL}auth/refresh/`, { refresh: refreshToken });
                    if (res.status === 200) {
                        Cookies.set('access_token', res.data.access);
                        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                        return axios(originalRequest);
                    }
                }
            } catch (err) {
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
