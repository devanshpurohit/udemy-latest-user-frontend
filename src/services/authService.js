import config from '../config/config';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

// Clear corrupted data immediately
// const clearCorruptedData = () => {
//     const user = localStorage.getItem(config.USER_KEY);
//     const token = localStorage.getItem(config.TOKEN_KEY);
    
//     if (user === 'undefined') {
//         localStorage.removeItem(config.USER_KEY);
//     }
    
//     if (token === 'undefined') {
//         localStorage.removeItem(config.TOKEN_KEY);
//     }
// };

// Clear corrupted data immediately
// clearCorruptedData();
const setToken = (token) => {
    localStorage.setItem(config.TOKEN_KEY, token);
};

const getToken = () => {
    const token = localStorage.getItem(config.TOKEN_KEY);
    return token;
};

const removeToken = () => {
    localStorage.removeItem(config.TOKEN_KEY);
};

// Store user data in localStorage
const setUser = (user) => {
    localStorage.setItem(config.USER_KEY, JSON.stringify(user));
};

// Get stored user data
const getUser = () => {
    const user = localStorage.getItem(config.USER_KEY);
    try {
        return user && user !== 'undefined' ? JSON.parse(user) : null;
    } catch (error) {
        console.error('getUser JSON parse error:', error, 'user:', user);
        localStorage.removeItem(config.USER_KEY);
        return null;
    }
};

const removeUser = () => {
    localStorage.removeItem(config.USER_KEY);
};

// Check if user is logged in
const isLoggedIn = () => {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
};

// Get stored user data
const getStoredUser = () => {
    return getUser();
};

// Login function
const login = async (username, password) => {
    try {
        console.log('🔍 AuthService login attempt:', { username, passwordLength: password?.length });
        console.log('🔍 API_BASE_URL:', API_BASE_URL);
        
        // Single auth endpoint - backend allows all roles now
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        console.log('🔍 Response status:', response.status);
        const data = await response.json();
        console.log('🔍 Response data:', data);

        if (response.ok) {
            console.log('🔍 Login successful');
            
            const token = data.token || data.data?.token;
            const user = data.user || data.data?.user;
            
            console.log('🔍 Final token:', token);
            console.log('🔍 Final user:', user);
            console.log('🔍 User role:', user?.role);
            
            // Store user with profile image
            const userWithProfile = {
                ...user,
                profile: {
                    ...user?.profile,
                    profileImage: user?.profile?.profileImage || null
                }
            };
            
            setToken(token);
            setUser(userWithProfile);
            return { success: true, data };
        } else {
            console.log('🔍 Error response:', data);
            return { success: false, error: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Register function
const register = async (userData) => {
    try {
        console.log('🔍 AuthService register attempt:', userData);
        console.log('🔍 API_BASE_URL:', API_BASE_URL);
        
        // Single register endpoint
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        console.log('🔍 Register response status:', response.status);
        const data = await response.json();
        console.log('🔍 Register response data:', data);

        if (response.ok) {
            console.log('🔍 Register successful');
            
            const token = data.token || data.data?.token;
            const user = data.user || data.data?.user || data.data?.data?.user;
            
            console.log('🔍 Register token:', token);
            console.log('🔍 Register user:', user);
            console.log('🔍 Register user role:', user?.role);
            
            if (token && user) {
                const userWithProfile = {
                    ...user,
                    profile: {
                        ...user?.profile,
                        profileImage: user?.profile?.profileImage || null
                    }
                };
                setToken(token);
                setUser(userWithProfile);
            }
            
            return { success: true, data };
        } else {
            console.log('🔍 Register error response:', data);
            return { success: false, error: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Logout function
const logout = () => {
    removeToken();
    removeUser();
    // Use React Router navigation instead of window.location
    return { success: true, message: 'Logged out successfully' };
};

// Update profile function
const updateProfile = async (profileData) => {
    try {
        const token = getToken();
        if (!token) {
            return { success: false, message: 'No authentication token found' };
        }

        console.log('🔍 Sending profile data:', profileData);

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        console.log("FULL BACKEND RESPONSE:", data);

        if (!response.ok) {
            return { success: false, message: data.message };
        }

        // 🔥 HANDLE BOTH POSSIBLE STRUCTURES
        const updatedUser = data.data?.user || data.user || data;

        if (!updatedUser || !updatedUser._id) {
            console.error("Still invalid user:", data);
            return { success: false, message: "Invalid server response" };
        }

        // Normalize structure
        const normalizedUser = {
            ...updatedUser,
            profile: {
                ...updatedUser.profile,
                profileImage: updatedUser.profile?.profileImage || null
            }
        };

        setUser(normalizedUser);

        return {
            success: true,
            data: { user: normalizedUser }
        };

    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, message: "Network error" };
    }
};

// Forgot Password function
const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Request failed' };
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Verify OTP function
const verifyOtp = async (email, otp) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp })
        });
        const data = await response.json();
        if (response.ok) {
            const token = data.token || data.data?.token;
            const user = data.user || data.data?.user;
            
            if (token && user) {
                // Store for auto-login
                const userWithProfile = {
                    ...user,
                    profile: {
                        ...user?.profile,
                        profileImage: user?.profile?.profileImage || null
                    }
                };
                setToken(token);
                setUser(userWithProfile);
            }
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'OTP verification failed' };
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Reset Password function
const resetPassword = async (email, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, newPassword })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Reset password failed' };
        }
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Get auth headers for API calls
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Verify token function
const verifyToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}${config.ENDPOINTS.AUTH.VERIFY}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            return { success: true, user: data.user };
        } else {
            logout();
            return { success: false, error: 'Token expired' };
        }
    } catch (error) {
        console.error('Token verification error:', error);
        logout();
        return { success: false, error: 'Network error' };
    }
};

// Verify AI Card function
const verifyAICard = async (cardNumber, cvv) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai-cards/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cardNumber, cvv })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Card verification failed' };
        }
    } catch (error) {
        console.error('Verify card error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export {
    login,
    register,
    logout,
    isLoggedIn,
    getToken,
    getStoredUser,
    getAuthHeaders,
    verifyToken,
    updateProfile,
    setToken,
    setUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    verifyAICard
};
