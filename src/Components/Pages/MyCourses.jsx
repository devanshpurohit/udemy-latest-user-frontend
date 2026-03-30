import { faStar, faStarHalf, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import React, { useState, useEffect, useMemo } from 'react';
import CourseCard from '../Common/CourseCard';
import { NavLink } from 'react-router-dom';
import config from "../../config/config";
import { getAllCourses, syncCartWithPurchases, getCachedAllCourses } from "../../services/apiService";

function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [selectedSort, setSelectedSort] = useState('newest');

    const fetchMyCourses = async (isInitialLoad = false) => {
        try {
            // Only show loading if we don't have courses already (optimistic UI)
            if (courses.length === 0) {
                setLoading(true);
            }
            
            console.log('🔍 MyCourses: Fetching fresh courses (cache bypassed)...');
            const response = await getAllCourses(false); // Force fresh data
            
            if (response.success && Array.isArray(response.data)) {
                setCourses(response.data);
                console.log(`✅ MyCourses: ${response.data.length} courses loaded ${response.fromCache ? '(from cache)' : ''}`);
            } else {
                setError(response.error || 'Failed to load courses');
                setCourses([]);
            }
        } catch (error) {
            setError('Failed to fetch courses');
            console.error('❌ MyCourses: Fetch Error:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Try to load from cache immediately to eliminate UI flicker
        const cached = getCachedAllCourses();
        if (cached && cached.data) {
            setCourses(cached.data);
            setLoading(false); // We have data, don't show initial loader
        }

        fetchMyCourses(true);
        
        // Only sync cart occasionally or on first load to save API calls
        if (!sessionStorage.getItem('cart_synced')) {
            syncCartWithPurchases();
            sessionStorage.setItem('cart_synced', 'true');
        }
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
            } else if (selectedSort === 'highest-rated') {
                return (b.averageRating || 0) - (a.averageRating || 0);
            }
            return 0;
        });

        return result;
    }, [courses, selectedRating, selectedLanguage, selectedSort]);

    
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
            case 'highest-rated': return 'Highest Rated';
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
                                    <h3 className="lg_title text-center mb-2">Available Courses</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <NavLink to="/" className="breadcrumb-link">
                                                        Home
                                                    </NavLink>
                                                </li>

                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Available Courses
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
                                <h3 className="nw-lg-title  mb-lg-0 mb-sm-2">Available Courses</h3>
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
                                       
                                    </ul>
                                </div>

                                <div className="dropdown">
                                    <button
                                        type="button"
                                        className="vertical-btn dropdown-toggle w-100 text-start"
                                        id="ratingDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {getRatingLabel()}
                                    </button>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                        aria-labelledby="ratingDropdown"
                                    >
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(null); }}>
                                                All Rated
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(4.5); }}>
                                                4.5 & Up
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(4.0); }}>
                                                4.0 & Up
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(3.5); }}>
                                                3.5 & Up
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(3.0); }}>
                                                3.0 & Up
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(2.5); }}>
                                                2.5 & Up
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(2.0); }}>
                                                2.0 & Up
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(1.5); }}>
                                                1.5 & Up
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedRating(1.0); }}>
                                                1.0 & Up
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
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSelectedSort('highest-rated'); }}>
                                                Highest Rated
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
                        {loading && courses.length === 0 ? (
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
                        ) : (
                            filteredAndSortedCourses.map((course) => (
                                <div key={course._id} className="col-lg-6 col-sm-12 col-md-12 mb-3">
                                    {/* <CourseCard course={course} /> */}
                                    <CourseCard course={course} variant="my-course" />
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </section>
        </>
    )
}

export default MyCourses
    