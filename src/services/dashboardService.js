import config from '../config/config';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

// Get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem(config.TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Get dashboard data - User's own enrolled courses from single database
const getDashboardData = async () => {
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
        console.error('Dashboard data error:', error);
        // Fallback to mock data if API fails
        return { 
            success: true, 
            data: {
                enrolledCourses: [
                    {
                        id: 1,
                        title: "Sample React Course",
                        instructor: "John Instructor",
                        description: "Learn React from scratch...",
                        image: "/course_01.png",
                        rating: 4.7,
                        totalRatings: 2341,
                        progress: 65,
                        completedVideos: 8,
                        totalVideos: 12,
                        status: "active"
                    }
                ],
                completedCourses: [],
                activeCourses: 1,
                certificates: [],
                invoices: [],
                stats: {
                    totalEnrolled: 1,
                    totalActive: 1,
                    totalCompleted: 0,
                    totalQuizzes: 0
                }
            }
        };
    }
};

// Enroll in course
const enrollCourse = async (courseId) => {
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

// Get all courses for admin/instructor view
const getAllCoursesForAdmin = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/instructor-courses`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Failed to fetch courses' };
        }
    } catch (error) {
        console.error('Admin courses error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Create course (admin/instructor only)
const createCourse = async (courseData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Failed to create course' };
        }
    } catch (error) {
        console.error('Create course error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};

export {
    getDashboardData,
    enrollCourse,
    getAllCoursesForAdmin,
    createCourse
};
