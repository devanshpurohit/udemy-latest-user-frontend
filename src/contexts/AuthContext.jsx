import React, { createContext, useContext, useState, useEffect } from 'react';
import { isLoggedIn, getStoredUser, logout } from '../services/authService';
import { clearCache } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication status on app load
        const checkAuth = async () => {
            const loggedIn = isLoggedIn();
            const userData = getStoredUser();
            
            console.log('🔍 AuthContext - Checking auth:', { loggedIn, userData });
            
            if (loggedIn) {
                const { verifyToken } = await import('../services/authService');
                const verifyRes = await verifyToken();
                if (verifyRes.success) {
                    setIsAuthenticated(true);
                    setUser(verifyRes.user || userData);
                } else {
                    console.warn('🔍 AuthContext - Token verification failed, logging out...');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();
        
        // Listen for storage changes to sync across components
        const handleStorageChange = (e) => {
            console.log('🔍 AuthContext - Storage change detected:', e);
            if (e.key === 'user' || e.key === null) {
                const userData = getStoredUser();
                console.log('🔍 AuthContext - Updated user from storage:', userData);
                setUser(userData);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const login = (userData) => {
        // Clear old public/cached data so new authenticated data is fetched
        clearCache();
        setIsAuthenticated(true);
        setUser(userData);
    };

    const handleLogout = () => {
        logout();
        // Clear cart so next user doesn't see previous user's cart
        localStorage.removeItem('cart');
        // Also clear session cache
        sessionStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
        // Dispatch event so cart count in header updates immediately
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout: handleLogout,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
