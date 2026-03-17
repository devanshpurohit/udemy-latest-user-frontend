import { faStar, faStarHalf, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import React, { useState, useEffect, useMemo } from 'react';
import CourseCard from '../Common/CourseCard';
import { NavLink } from 'react-router-dom';
import config from "../../config/config";

function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [selectedSort, setSelectedSort] = useState('newest');
    const coursesPerPage = 8;


    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 500); // Scroll to top of results on page change
    };

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            console.log('🔍 MyCourses: Fetching all courses from API...');

            // Fetch all courses (no auth needed, public endpoint)
            const response = await fetch(`${config.API_BASE_URL}/public/courses`);
            console.log('🔍 MyCourses: Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('🔍 MyCourses: API Response:', data);
            console.log('🔍 MyCourses: Response data type:', typeof data);
            console.log('🔍 MyCourses: Response data.data:', data.data);
            console.log('🔍 MyCourses: Response data.data type:', typeof data.data);
            console.log('🔍 MyCourses: Is data.data array?:', Array.isArray(data.data));
            
            if (data.success && Array.isArray(data.data)) {
                setCourses(data.data);
                console.log(`✅ MyCourses: ${data.data.length} courses loaded`);
            } else {
                setError(data.message || 'Failed to load courses');
                console.error('❌ MyCourses: API Error:', data.message);
                setCourses([]); // Ensure courses is always an array
            }
        } catch (error) {
            setError('Failed to fetch courses');
            console.error('❌ MyCourses: Fetch Error:', error);
            setCourses([]); // Ensure courses is always an array
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const filteredAndSortedCourses = useMemo(() => {
        let result = [...courses];

        // Filter by Rating
        if (selectedRating !== null) {
            result = result.filter(course => (course.averageRating || 0) >= selectedRating);
        }

        // Filter by Language
        if (selectedLanguage !== null) {
            result = result.filter(course => course.language === selectedLanguage);
        }

        // Sort
        result.sort((a, b) => {
            if (selectedSort === 'popular') {
                return (b.totalEnrollments || 0) - (a.totalEnrollments || 0);
            } else if (selectedSort === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (selectedSort === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
        });

        return result;
    }, [courses, selectedRating, selectedLanguage, selectedSort]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const currentCourses = filteredAndSortedCourses.slice(startIndex, endIndex);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedRating, selectedLanguage, selectedSort]);
    
    // Helper to get dropdown labels
    const getRatingLabel = () => {
        if (selectedRating === null) return 'All Rated';
        return `${selectedRating} Star & Up`;
    };

    const getLanguageLabel = () => {
        if (selectedLanguage === null) return 'Language';
        return selectedLanguage;
    };

    const getSortLabel = () => {
        switch (selectedSort) {
            case 'popular': return 'Popular';
            case 'newest': return 'Newest';
            case 'oldest': return 'Oldest';
            default: return 'Sort By';
        }
    };

    return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">My Course</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="/home-second" className="breadcrumb-link">
                                                        Home
                                                    </a>
                                                </li>

                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    My Course
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
                        <div className="udemy-tp-content">
                            <div>
                                <h3 className="nw-lg-title  mb-lg-0 mb-sm-2">My Courses</h3>
                            </div>

                            <div className="udemy-dropdown-box gap-3">

                                <div className="dropdown">
                                    <button
                                        type="button"
                                        className="vertical-btn dropdown-toggle w-100 text-start"
                                        id="languageDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {getLanguageLabel()}
                                    </button>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                        aria-labelledby="languageDropdown"
                                    >
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedLanguage(null); }}>
                                                All Languages
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedLanguage('English'); }}>
                                                English
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedLanguage('Tamil'); }}>
                                                Tamil
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedLanguage('Hindi'); }}>
                                                Hindi
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="dropdown">
                                    <button
                                        type="button"
                                        className="vertical-btn dropdown-toggle w-100 text-start"
                                        id="sortDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {getSortLabel()}
                                    </button>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                        aria-labelledby="sortDropdown"
                                    >
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedSort('popular'); }}>
                                                Popular
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedSort('newest'); }}>
                                                Newest
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedSort('oldest'); }}>
                                                Oldest
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {loading ? (
                            <div className="text-center py-5 w-100 spiner-loader">
                                            <div className="loader-course" role="status">
                                                <span className=""></span>
                                            </div>
                                            <p className="mt-3">Loading courses...</p>
                                        </div>
                        ) : error ? (
                            <div className="col-12 text-center py-5">
                                <div className="alert alert-danger">
                                    <h4>Error loading courses</h4>
                                    <p>{error}</p>
                                    <button className="btn btn-primary" onClick={fetchMyCourses}>
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : currentCourses.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <h4>No courses available</h4>
                                <p>Check back later for new courses.</p>
                            </div>
                        ) : (
                            currentCourses.map((course) => (
                                <div key={course._id} className="col-lg-6 col-sm-12 col-md-12 mb-3">
                                    {/* <CourseCard course={course} /> */}
                                    <CourseCard course={course} variant="my-course" />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {courses.length > 0 && (
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

export default MyCourses
    