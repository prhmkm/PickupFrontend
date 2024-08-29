import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const tokenExpiration = JSON.parse(atob(token.split('.')[1])).exp * 1000;
            if (Date.now() > tokenExpiration) {
                logout(); // اگر توکن منقضی شده باشد، لاگ اوت می‌کنیم
            } else {
                setIsAuthenticated(true);
            }
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return { isAuthenticated, login, logout };
};
