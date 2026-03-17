import { faStar, faStarHalf, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import React, { useState, useEffect, useMemo } from 'react';
import { getBackendUrl } from '../../config/backendConfig';
import CourseCard from '../Common/CourseCard';
import { NavLink } from 'react-router-dom';
import { getToken } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

function MyWishlist() {
    const { user: authUser } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 8;

    // Pagination logic
    const totalPages = Math.ceil(courses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const currentCourses = courses.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const fetchWishlistCourses = async () => {
        try {
            setLoading(true);
            console.log('🔍 MyWishlist: Fetching user wishlist from API...');
            
            const token = getToken();
            console.log('🔍 MyWishlist: Raw token from localStorage:', localStorage.getItem('token'));
            console.log('🔍 MyWishlist: Token exists:', !!token);
            console.log('🔍 MyWishlist: Token length:', token ? token.length : 0);
            
            if (!token) {
                setError('Please login to view your wishlist');
                setLoading(false);
                return;
            }
            
            // Use backend URL from config
            const apiUrl = getBackendUrl('/users/wishlist');
            console.log('🔍 MyWishlist: Full API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('🔍 MyWishlist: Response status:', response.status);
            console.log('🔍 MyWishlist: Response headers:', response.headers);
            
            if (response.status === 401) {
                console.error('❌ MyWishlist: Authentication failed - token may be expired');
                setError('Your session has expired. Please login again.');
                // Clear invalid token but DON'T redirect automatically
                localStorage.removeItem('token');
                setLoading(false);
                // Show error message instead of auto-redirect
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('🔍 MyWishlist: API Response:', data);
            
            if (data.success) {
                setCourses(data.data);
                console.log(`✅ MyWishlist: ${data.data.length} wishlist courses loaded`);
            } else {
                setError(data.message || 'Failed to load wishlist');
                console.error('❌ MyWishlist: API Error:', data.message);
            }
        } catch (error) {
            setError('Failed to fetch wishlist courses');
            console.error('❌ MyWishlist: Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch wishlist if user is authenticated
        if (authUser) {
            console.log('🔍 MyWishlist: User authenticated, fetching wishlist...');
            fetchWishlistCourses();
        } else {
            console.log('🔍 MyWishlist: No authenticated user found');
            setError('Please login to view your wishlist');
            setLoading(false);
        }
    }, [authUser]); // Depend on authUser instead of empty array

    // Prevent infinite re-renders by memoizing courses
    const wishlistCourses = useMemo(() => courses, [courses]);

    return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">My Wishlist</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="#" className="breadcrumb-link">
                                                        Home
                                                    </a>
                                                </li>

                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    My Wishlist
                                                </li>
                                            </ol>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            <section className="course-section">
                <div className="container">
                    <div className="row">
                        <div className="udemy-tp-content mt-3">
                            <div>
                                <h3 className="nw-lg-title mb-2">My Wishlist</h3>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {loading ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading courses...</span>
                                </div>
                                <p className="mt-3">Loading your wishlist...</p>
                            </div>
                        ) : error ? (
                            <div className="col-12 text-center py-5">
                                <div className="alert alert-danger">
                                    <h4>Authentication Error</h4>
                                    <p>{error}</p>
                                    <p className="mb-3">Please <a href="/login" className="btn btn-primary">Login Again</a> to continue.</p>
                                    <button className="btn btn-secondary ms-2" onClick={fetchWishlistCourses}>
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <h3>No courses in wishlist</h3>
                                <p>You haven't added any courses to your wishlist yet.</p>
                            </div>
                        ) : (
                            currentCourses.map((course) => (
                                <div key={course._id} className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                    <CourseCard course={course} variant="wishlist" />
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="dz-pagination-wrapper">
                                    <div className="dz-pagination-info">
                                        <p>Showing {startIndex + 1} to {Math.min(endIndex, courses.length)} of {courses.length} results</p>
                                    </div>

                                    <nav>
                                        <ul className="pagination dz-custom-pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link dz-page-link" 
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    <MdChevronLeft />
                                                </button>
                                            </li>

                                            {[...Array(totalPages)].map((_, index) => (
                                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link dz-page-link" 
                                                        onClick={() => handlePageChange(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            ))}

                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link dz-page-link" 
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <MdChevronRight />
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default MyWishlist
    