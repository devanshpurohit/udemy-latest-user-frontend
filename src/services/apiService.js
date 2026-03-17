// Common Backend API Configuration
import config from '../config/config';

const API_BASE_URL = config.API_BASE_URL;

// Store token in localStorage
const setToken = (token) => {
    localStorage.setItem(config.TOKEN_KEY, token);
};

const getToken = () => {
    const token = localStorage.getItem(config.TOKEN_KEY);
    console.log("🔍 apiService getToken - Raw token:", token);
    console.log("🔍 apiService getToken - Token length:", token?.length || 0);
    console.log("🔍 apiService getToken - Token type:", typeof token);
    console.log("🔍 apiService getToken - Config TOKEN_KEY:", config.TOKEN_KEY);
    return token;
};

const removeToken = () => {
    localStorage.removeItem(config.TOKEN_KEY);
};

// Get auth headers
const getAuthHeaders = () => {
    const token = getToken();
    console.log("🔍 Frontend - Token from localStorage:", token ? "YES" : "NO");
    console.log("🔍 Frontend - Token length:", token?.length || 0);
    console.log("🔍 Frontend - Token value:", token);
    console.log("🔍 Frontend - Token type:", typeof token);
    console.log("🔍 Frontend - Authorization header:", token ? `Bearer ${token}` : "NO TOKEN");
    
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Get all courses (public)
export const getAllCourses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/public/courses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('🔍 API Response in getAllCourses:', data);
        console.log('🔍 API Response data.data:', data.data);
        console.log('🔍 Is data.data array?:', Array.isArray(data.data));
        
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch courses' };
        }
    } catch (error) {
        console.error('Courses fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Get course by ID (public)
export const getCourseById = async (courseId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/public/courses/${courseId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch course' };
        }
    } catch (error) {
        console.error('Course fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Get top courses (public)
export const getTopCourses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/top`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        console.log('🔍 API Response in getTopCourses:', data);
        console.log('🔍 API Response data.data:', data.data);
        console.log('🔍 Is data.data array?:', Array.isArray(data.data));
        
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch top courses' };
        }
    } catch (error) {
        console.error('Top courses fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Search courses (public)
export const searchCourses = async (query, category) => {
    try {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (category) params.append('category', category);

        const response = await fetch(`${API_BASE_URL}/courses/search?${params}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        console.log('🔍 API Response in searchCourses:', data);
        console.log('🔍 API Response data.data:', data.data);
        console.log('🔍 Is data.data array?:', Array.isArray(data.data));
        
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to search courses' };
        }
    } catch (error) {
        console.error('Course search error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Enroll in course (protected)
export const enrollCourse = async (courseId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/enroll`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ courseId })
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.message || 'Failed to enroll in course' };
        }
    } catch (error) {
        console.error('Enroll course error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Get my enrolled courses (protected)
export const getMyCourses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/my-courses`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch my courses' };
        }
    } catch (error) {
        console.error('My courses fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Get dashboard data (protected)
export const getDashboardData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch dashboard data' };
        }
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Submit quiz score (protected)
export const submitQuizScore = async (courseId, lessonId, score) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/quiz-score`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ courseId, lessonId, score })
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.message || 'Failed to submit quiz score' };
        }
    } catch (error) {
        console.error('Submit quiz score error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Authentication services
export const loginUser = async (username, password) => {
    try {
        console.log('🔍 apiService login attempt:', { username, passwordLength: password?.length });
        console.log('🔍 API_BASE_URL:', API_BASE_URL);
        
        // Single auth endpoint - backend allows all roles now
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        console.log('🔍 apiService response status:', response.status);
        const data = await response.json();
        console.log('🔍 apiService response data:', data);

        if (response.ok) {
            console.log('🔍 apiService login successful');
            
            const token = data.token || data.data?.token;
            const user = data.user || data.data?.user;
            
            console.log('🔍 apiService user role:', user?.role);
            
            if (token) setToken(token);
            if (user) setUser(user);
            
            return { success: true, data };
        } else {
            console.log('🔍 apiService error response:', data);
            return { success: false, error: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('apiService Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const registerUser = async (userData) => {
    try {
        console.log('🔍 apiService register attempt:', userData);
        console.log('🔍 API_BASE_URL:', API_BASE_URL);
        
        // Single register endpoint
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        console.log('🔍 apiService register response status:', response.status);
        const data = await response.json();
        console.log('🔍 apiService register response data:', data);

        if (response.ok) {
            console.log('🔍 apiService register successful');
            
            const token = data.token || data.data?.token;
            const user = data.user || data.data?.user;
            
            console.log('🔍 apiService register user role:', user?.role);
            
            if (token) setToken(token);
            if (user) setUser(user);
            
            return { success: true, data };
        } else {
            console.log('🔍 apiService register error response:', data);
            return { success: false, error: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('apiService Registration error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const logoutUser = () => {
    removeToken();
    removeUser();
    return { success: true };
};

// Store user data in localStorage
const setUser = (user) => {
    localStorage.setItem(config.USER_KEY, JSON.stringify(user));
};

const getUser = () => {
    const user = localStorage.getItem(config.USER_KEY);
    try {
        return user && user !== 'undefined' ? JSON.parse(user) : null;
    } catch (error) {
        console.error('getUser JSON parse error:', error, 'user:', user);
        localStorage.removeItem(config.USER_KEY); // Clear corrupted data
        return null;
    }
};

const removeUser = () => {
    localStorage.removeItem(config.USER_KEY);
};

export const getCurrentUser = () => {
    return getUser();
};

export const isAuthenticated = () => {
    return !!getToken();
};
