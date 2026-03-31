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
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// --- CACHING SYSTEM ---
const CACHE_PREFIX = 'udemy_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const getCache = (key) => {
    try {
        const cached = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;
        
        const { data, expiry } = JSON.parse(cached);
        if (new Date().getTime() > expiry) {
            sessionStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
};

const setCache = (key, data, ttl = DEFAULT_TTL) => {
    try {
        const serialized = JSON.stringify({ data, expiry: new Date().getTime() + ttl });
        
        // Safety check: Don't try to store data larger than 2MB in sessionStorage
        if (serialized.length > 2 * 1024 * 1024) {
            console.warn(`Cache: Data for "${key}" is too large (${Math.round(serialized.length / 1024)} KB). Skipping cache.`);
            return;
        }

        sessionStorage.setItem(CACHE_PREFIX + key, serialized);
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('Cache quota exceeded. Clearing all session storage to make room...');
            
            try {
                sessionStorage.clear(); // Clear everything in sessionStorage
                
                const serialized = JSON.stringify({ data, expiry: new Date().getTime() + ttl });
                if (serialized.length < 2 * 1024 * 1024) {
                    sessionStorage.setItem(CACHE_PREFIX + key, serialized);
                    console.log('Cache successfully saved after full clearing.');
                }
            } catch (retryError) {
                console.warn('Cache: Storage still failing after cleanup. Proceeding without cache.', retryError);
            }
        } else {
            console.warn('Cache storage failed:', e);
        }
    }
};

export const clearCache = (key) => {
    if (key) sessionStorage.removeItem(CACHE_PREFIX + key);
    else {
        // Clear all udemy caches
        Object.keys(sessionStorage).forEach(k => {
            if (k.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(k);
        });
    }
};
// --- END CACHING SYSTEM ---

// Synchronous cache reader for all courses
export const getCachedAllCourses = () => {
    const cacheKey = 'all_courses';
    const cached = getCache(cacheKey);
    return cached ? { success: true, data: cached, fromCache: true } : null;
};

// Get all courses (public)
export const getAllCourses = async (useCache = true) => {
    const cacheKey = 'all_courses';
    if (useCache) {
        const cached = getCache(cacheKey);
        if (cached) {
            console.log(`⚡ API Cache Hit: ${cacheKey}`);
            return { success: true, data: cached, fromCache: true };
        }
        console.log(`📂 API Cache Miss: ${cacheKey}`);
    }

    try {
        console.log(`🌐 API Network Fetch: ${API_BASE_URL}/public/courses`);
        const response = await fetch(`${API_BASE_URL}/public/courses`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        
        if (response.ok) {
            if (useCache) setCache(cacheKey, data.data);
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch courses' };
        }
    } catch (error) {
        console.error('Courses fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Synchronous getter for course by ID (eliminates loading UI flashes)
export const getCachedCourseById = (courseId) => {
    const cacheKey = `course_${courseId}`;
    const cached = getCache(cacheKey);
    return cached ? { success: true, data: cached, fromCache: true } : null;
};

// Get course by ID (public)
export const getCourseById = async (courseId, useCache = true) => {
    const cacheKey = `course_${courseId}`;
    if (useCache) {
        const cached = getCache(cacheKey);
        if (cached) return { success: true, data: cached, fromCache: true };
    }

    try {
        console.log(`🌐 [DEBUG] API Network Fetch (Course): ${API_BASE_URL}/public/courses/${courseId}`, useCache ? '' : '(Cache Bypassed)');
        const response = await fetch(`${API_BASE_URL}/public/courses/${courseId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            if (useCache) setCache(cacheKey, data);
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

// Synchronous cache reader for enrolled courses
export const getCachedMyCourses = () => {
    const user = getCurrentUser();
    const cacheKey = user ? `my_courses_${user._id}` : 'my_courses_guest';
    const cached = getCache(cacheKey);
    return cached ? { success: true, data: cached, fromCache: true } : null;
};

// Get my enrolled courses (protected)
export const getMyCourses = async (useCache = true) => {
    const user = getCurrentUser();
    const cacheKey = user ? `my_courses_${user._id}` : 'my_courses_guest';
    
    if (useCache) {
        const cached = getCache(cacheKey);
        if (cached) return { success: true, data: cached, fromCache: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/my-courses`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            if (useCache) setCache(cacheKey, data);
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch my courses' };
        }
    } catch (error) {
        console.error('My courses fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Synchronous cache reader for instantaneous route guards
export const getCachedDashboardData = () => {
    const user = getCurrentUser();
    const userId = user?._id || user?.id;
    const cacheKey = userId ? `dashboard_${userId}` : 'dashboard_guest';
    const cached = getCache(cacheKey);
    return cached ? { success: true, data: cached, fromCache: true } : null;
};

// Get dashboard data (protected)
export const getDashboardData = async (useCache = true) => {
    const user = getCurrentUser();
    const userId = user?._id || user?.id;
    const cacheKey = userId ? `dashboard_${userId}` : 'dashboard_guest';

    if (useCache) {
        const cached = getCache(cacheKey);
        if (cached) {
            console.log(`⚡ API Cache Hit: ${cacheKey}`);
            return { success: true, data: cached, fromCache: true };
        }
        console.log(`📂 API Cache Miss: ${cacheKey}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            if (useCache) setCache(cacheKey, data);
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch dashboard data' };
        }
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Sync cart with purchased courses
export const syncCartWithPurchases = async () => {
    try {
        const dashboard = await getDashboardData(true); // Get cached dashboard
        if (!dashboard.success || !dashboard.data?.orders) return;

        const purchasedIds = dashboard.data.orders.map(order => 
            (order.courseId?._id || order.courseId).toString()
        );

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = cart.filter(item => !purchasedIds.includes(item._id.toString()));

        if (cart.length !== updatedCart.length) {
            console.log(`🧹 Sync Cart: Removed ${cart.length - updatedCart.length} purchased courses from cart.`);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            window.dispatchEvent(new Event("cartUpdated"));
        }
    } catch (error) {
        console.warn('Sync cart error:', error);
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

// Question services
export const createQuestion = async (question) => {
    try {
        const response = await fetch(`${API_BASE_URL}/questions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ question })
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to submit question' };
        }
    } catch (error) {
        console.error('Create question error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export const getMyQuestions = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/my`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch your questions' };
        }
    } catch (error) {
        console.error('My questions fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Synchronous cache reader for public FAQs
export const getCachedQuestionsPublic = () => {
    const cacheKey = 'public_faqs';
    const cached = getCache(cacheKey);
    return cached ? { success: true, data: cached, fromCache: true } : null;
};

export const getQuestionsPublic = async (useCache = true) => {
    const cacheKey = 'public_faqs';
    if (useCache) {
        const cached = getCache(cacheKey);
        if (cached) return { success: true, data: cached, fromCache: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/questions/public`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            if (useCache) setCache(cacheKey, data.data);
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch FAQ' };
        }
    } catch (error) {
        console.error('Public questions fetch error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Get reviews for a course (public)
export const getCourseReviews = async (courseId, useCache = true) => {
    const cacheKey = `reviews_${courseId}`;
    if (useCache) {
        const cached = getCache(cacheKey);
        if (cached) return { success: true, data: cached, fromCache: true };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${courseId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': useCache ? 'max-age=3600' : 'no-cache',
            }
        });

        const data = await response.json();
        console.log(`📡 [DEBUG] getCourseReviews API response for ${courseId}:`, data);
        if (data.success) {
            if (useCache) setCache(cacheKey, data.data);
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch reviews' };
        }
    } catch (error) {
        console.error('Reviews fetch error:', error);
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

export const updateWatchTime = async (seconds) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/watch-time`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ seconds })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Update watch time error:', error);
        return { success: false, error: 'Network error updating watch time' };
    }
};
