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
    const coursesPerPage = 4;

    // Pagination logic
    const totalPages = Math.ceil(courses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const currentCourses = courses.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
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

    const myCoursesList = useMemo(() => courses, [courses]);

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
                                                    <a href="#" className="breadcrumb-link">
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
                                    <a
                                        href="#"
                                        className="vertical-btn dropdown-toggle"
                                        id="acticonMenu2"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        All Rated
                                    </a>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end  tble-action-menu admin-dropdown-card"
                                        aria-labelledby="acticonMenu2"
                                    >
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav">
                                                5 Star
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" >
                                                4 Star
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" >
                                                3 Star
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" >
                                                2 Star
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" >
                                                1 Star
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="dropdown">
                                    <a
                                        href="#"
                                        className="vertical-btn dropdown-toggle"
                                        id="acticonMenu2"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Language
                                    </a>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end  tble-action-menu admin-dropdown-card"
                                        aria-labelledby="acticonMenu2"
                                    >
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" >
                                                English
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" >
                                                Tamil
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="dropdown">
                                    <a
                                        href="#"
                                        className="vertical-btn dropdown-toggle"
                                        id="acticonMenu2"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Sort By
                                    </a>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end  tble-action-menu admin-dropdown-card"
                                        aria-labelledby="acticonMenu2"
                                    >
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" data-bs-toggle="modal" data-bs-target="#edit-Announcement">
                                                Popular
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" data-bs-toggle="modal" data-bs-target="#edit-Announcement">
                                                Newest
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" >
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
    