import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { BiSolidBadgeCheck } from 'react-icons/bi';
import { FaArrowLeft, FaArrowRight, FaCheck, FaQuoteRight } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getBackendUrl } from '../../config/backendConfig';
import config from '../../config/config';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";

// Import Components
import TopLearningSlider from '../Sliders/TopLearningSlider';
import UpcomingSlider from '../Sliders/UpcomingSlider';
import FeedbackSlider from '../Sliders/FeedbackSlider';
import CourseCard from '../Common/CourseCard';

const HomeSecond = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const coursesPerPage = 4;

    const splideRef1 = useRef(null);
    const splideRef2 = useRef(null);
    const splideRef3 = useRef(null);

    // Memoize course slices to prevent unnecessary recalculations
    const topLearningCourses = useMemo(() => courses, [courses]);
    const continueLearningCourses = useMemo(() => courses, [courses]);
    const upcomingCourses = useMemo(() => courses, [courses]);

    // Pagination logic for Continue Learning section
    const totalPages = Math.ceil(continueLearningCourses.length / coursesPerPage);
    const startIndex = currentPage * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const currentCourses = continueLearningCourses.slice(startIndex, endIndex);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);
    useEffect(() => {
        if (courses.length > 0) {
            splideRef1.current?.splide?.refresh();
            splideRef2.current?.splide?.refresh();
            splideRef3.current?.splide?.refresh();
        }
    }, [courses]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            console.log('🔍 HomeSecond: Fetching courses from API...');

            // Get token for purchase status checking
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Use backend URL from config
            const response = await fetch(`${config.API_BASE_URL}/public/courses`, {
                headers: headers
            });
            console.log('🔍 HomeSecond: Response status:', response.status);
            console.log('🔍 HomeSecond: Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔍 HomeSecond: Raw API Response:', data);
            console.log('🔍 HomeSecond: Success status:', data.success);
            console.log('🔍 HomeSecond: Data type:', typeof data.data);
            console.log('🔍 HomeSecond: Data length:', data.data ? data.data.length : 'undefined');
            console.log('🔍 HomeSecond: Course titles:', data.data ? data.data.map(c => c.title) : 'No data');

            if (data.success && data.data && Array.isArray(data.data)) {
                setCourses(data.data);
                console.log(`✅ HomeSecond: ${data.data.length} courses loaded`);
                console.log('🔍 HomeSecond: Set courses state:', data.data.length);
            } else {
                setError(data.message || 'Failed to load courses - Invalid data format');
                console.error('❌ HomeSecond: API Error:', data.message);
                console.error('❌ HomeSecond: Data structure:', JSON.stringify(data, null, 2));
            }
        } catch (error) {
            setError('Failed to fetch courses');
            console.error('❌ HomeSecond: Fetch Error:', error);
            console.error('❌ HomeSecond: Full error details:', error);
            console.error('❌ HomeSecond: Error stack:', error.stack);
        } finally {
            setLoading(false);
        }
    };

    const goPrev = () => {
        splideRef1.current?.splide.go("<");
        splideRef2.current?.splide.go("<");
        splideRef3.current?.splide.go("<");
    };

    const goNext = () => {
        splideRef1.current?.splide.go(">");
        splideRef2.current?.splide.go(">");
        splideRef3.current?.splide.go(">");
    };



    return (
        <>

            <section className='udemy-alert-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className='udemy-alert-content'>
                                <p>For all the students who have the AI card purchased, please click the button to access the Student AI course details.</p>
                                <button className='alert-btn'>Click here!</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='banner-section'>
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className='udemy-hp-content'>
                                <h5>Learn AI the Smart Way</h5>
                                <h2>Simple, practical AI concepts designed for school students.</h2>
                                <p>Explore the basics of AI through guided lessons and real examples.Learn how artificial intelligence is shaping the world around us.</p>
                                <div>
                                    <NavLink to="/my-course" className='explore-btn'>Explore Courses</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6 px-0'>
                            <div className='hm-banner-box'>
                                <img src="/hm_banner_02.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className='continue-section'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <div className="text-center mb-4">
                                <div className='udemy-learn-content'>

                                    <h5><span className='top-learn-title'>Continue</span> Learning </h5>
                                    <div className='udemy-para-content'>
                                        <p>Most popular courses for students.</p>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* <TopLearningSlider
                                topLearningCourses={topLearningCourses}
                                loading={loading}
                                error={error}
                                onRetry={fetchCourses}
                                splideRef={splideRef1}
                            /> */}

                        {loading ? (
                            <div className="text-center py-5 w-100 spiner-loader">
                                <div className="loader-course" role="status">
                                    <span className=""></span>
                                </div>
                                <p className="mt-3">Loading courses...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-5">
                                <div className="alert alert-danger">
                                    <h4>Error loading courses</h4>
                                    <p>{error}</p>
                                    <button className="btn btn-primary" onClick={fetchCourses}>
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : (topLearningCourses || []).length === 0 ? (
                            <div className="text-center py-5">
                                <h3>No courses available</h3>
                                <p>Check back later for new courses.</p>
                            </div>
                        ) : (
                            (topLearningCourses || [])?.slice(0, 2).map((course) => (
                                <div className='col-lg-12 col-md-12 col-sm-12 mb-3'>
                                    <div key={course._id}>
                                        <NavLink to={`/course/${course._id}`} className="text-decoration-none">
                                            <div className="udemy-cards">

                                                <div className='row'>
                                                    <div className='col-lg-6'>
                                                        <div className='udemy-picture'>
                                                            <img
                                                                src={course.thumbnail || course.courseImage || "/course_01.png"}
                                                                alt={course.title}
                                                            />

                                                            <div className="udemy-category-box">
                                                                <span className="udemy-seller"> Best Seller </span>
                                                                <span className="udemy-offer"> 20% OFF </span>
                                                            </div>

                                                        </div>

                                                    </div>
                                                    <div className='col-lg-6'>
                                                        <div className="udemy-content top-course-list-box">
                                                            <div>
                                                                <h4>{course.title}</h4>
                                                                <span className="pb-2">
                                                                    <FontAwesomeIcon icon={faUser} className="udemy-course-icon" /> <a href="#" className="udemy-user">{course.instructor?.username || 'Instructor'}</a>

                                                                </span>
                                                                <p>{course.description ? course.description.substring(0, 80) + '...' : 'Course description not available'}</p>
                                                            </div>

                                                            {/* <span >₹{course.price || '999'}</span> */}
                                                            <div>
                                                                <ul className="rating-list">
                                                                    <li className="rating-item"> <a href="#" className="rating-text"><FontAwesomeIcon icon={faStar} /> </a> </li>
                                                                    <li className="rating-item"> <a href="#" className="rating-text"><FontAwesomeIcon icon={faStar} /> </a> </li>
                                                                    <li className="rating-item"> <a href="#" className="rating-text"><FontAwesomeIcon icon={faStar} /> </a> </li>
                                                                    <li className="rating-item"> <a href="#" className="rating-text"><FontAwesomeIcon icon={faStar} /> </a> </li>
                                                                    <li className="rating-item"> <a href="#" className="rating-text"><FontAwesomeIcon icon={faStarHalf} /> </a> </li>
                                                                    <li className="rating-item"><span className="rating-number">(1.2K)</span></li>
                                                                </ul>
                                                                <div className="progress-wrapper mt-1">
                                                                    <div className="progress-item">
                                                                        <div className="d-flex align-items-center justify-content-between udemy-progress">
                                                                            <span className="udemy-complete-video">(4/10)Video Completed</span>
                                                                            <span className="progress-label fz-12 fw-500">60%</span>
                                                                        </div>

                                                                        <div className="progress custom-progress">
                                                                            <div className="progress-bar" style={{ width: "60%" }}></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>

                                                </div>





                                            </div>
                                        </NavLink>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>

            </section>


            <section className='top-learn-section'>
                <div className="container">
                    <div className="row">
                        <div className='col-lg-12'>
                            <div className='udemy-learn-content'>
                                <h5> <span className='top-learn-title'>Top Learning</span> Courses </h5>
                                <div className='udemy-para-content'>
                                    <p>Most popular courses for students.</p>
                                </div>
                            </div>
                        </div>

                        <div className='col-lg-12 mb-3'>
                            {currentCourses.map((course) => (
                                <div key={course._id}>

                                    <NavLink
                                        to={`/course/${course._id}`}
                                        className="text-decoration-none"
                                    >

                                        <div className="udemy-cards mb-3">
                                            <div className='row '>

                                                <div className='col-lg-6'>
                                                    <div className="udemy-picture top-udemy-picture">
                                                        <img
                                                            src={
                                                                course.courseImage
                                                                    ? course.courseImage
                                                                    : "/course_01.png"
                                                            }
                                                            alt={course.title}
                                                        />

                                                        <div className="udemy-category-box">
                                                            <span className="udemy-seller">Best Seller</span>
                                                            <span className="udemy-offer">20% OFF</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-lg-6'>
                                                    <div className="udemy-content top-udemy-content-box">

                                                        <div className='udemy-course-list top-course-list-box'>

                                                            <div className='udemy-course-top'>

                                                                <h4>{course.title}</h4>

                                                                <span className="pb-2">
                                                                    <FontAwesomeIcon
                                                                        icon={faUser}
                                                                        className="udemy-course-icon"
                                                                    />

                                                                    <a className="udemy-user">
                                                                        {course.instructor?.username || "Admin"}
                                                                    </a>
                                                                </span>

                                                                <p>
                                                                    {course.description?.slice(0, 90)}...
                                                                </p>

                                                            </div>

                                                            <div className='udemy-course-bottom'>

                                                                <div className='udemy-certificate-content'>
                                                                    <h6>

                                                                        <span className='fz-24'>
                                                                            <BiSolidBadgeCheck />
                                                                        </span>

                                                                        Certificate Guarantee

                                                                    </h6>
                                                                </div>

                                                                <ul className="rating-list">

                                                                    <li className="rating-item">
                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                    </li>

                                                                    <li className="rating-item">
                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                    </li>

                                                                    <li className="rating-item">
                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                    </li>

                                                                    <li className="rating-item">
                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                    </li>

                                                                    <li className="rating-item">
                                                                        <FontAwesomeIcon icon={faStarHalf} className='rating-text' />
                                                                    </li>

                                                                    <li className="rating-item">
                                                                        <span className="rating-number">(1.2K)</span>
                                                                    </li>

                                                                </ul>

                                                                <div className="udemy-course-price">

                                                                    <h5>
                                                                        ${course.price}

                                                                        {course.originalPrice && (
                                                                            <del className="udemy-sale">
                                                                                ${course.originalPrice}
                                                                            </del>
                                                                        )}

                                                                    </h5>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>
                                                </div>






                                            </div>
                                        </div>

                                    </NavLink>

                                </div>
                            ))}

                            {/* {loading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading courses...</span>
                                                </div>
                                                <p className="mt-3">Loading courses...</p>
                                            </div>
                                        ) : error ? (
                                            <div className="text-center py-5">
                                                <div className="alert alert-danger">
                                                    <h4>Error loading courses</h4>
                                                    <p>{error}</p>
                                                    <button className="btn btn-primary" onClick={fetchCourses}>
                                                        Try Again
                                                    </button>
                                                </div>
                                            </div>
                                        ) : courses.length === 0 ? (
                                            <div className="text-center py-5">
                                                <h3>No courses available</h3>
                                                <p>Check back later for new courses.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="row">
                                                    {currentCourses.map((course) => (
                                                        <div className="col-lg-6 mb-4" key={course._id}>
            
                                                            <NavLink
                                                                to={`/course/${course._id}`}
                                                                className="text-decoration-none"
                                                            >
            
                                                                <div className="udemy-cards">
                                                                    <div className='top-learn-box'>
                                                                        <div className="udemy-picture top-udemy-picture">
                                                                            <img
                                                                                src={
                                                                                    course.courseImage
                                                                                        ? course.courseImage
                                                                                        : "/course_01.png"
                                                                                }
                                                                                alt={course.title}
                                                                            />
                                                                            <div className="udemy-category-box">
                                                                                <span className="udemy-seller">Best Seller</span>
                                                                                <span className="udemy-offer">20% OFF</span>
                                                                            </div>
            
                                                                        </div>
            
                                                                        <div className="udemy-content mt-0">
                                                                            <div className='udemy-course-list'>
                                                                                <div className='udemy-course-top'>
                                                                                    <h4>{course.title}</h4>
                                                                                    <span className="pb-2">
                                                                                        <FontAwesomeIcon
                                                                                            icon={faUser}
                                                                                            className="udemy-course-icon"
                                                                                        />
            
                                                                                        <a className="udemy-user">
                                                                                            {course.instructor?.username || "Admin"}
                                                                                        </a>
            
                                                                                    </span>
            
                                                                                    <p>
                                                                                        {course.description?.slice(0, 90)}...
                                                                                    </p>
            
                                                                                </div>
            
                                                                                <div className='udemy-course-bottom'>
            
                                                                                    <div className='udemy-certificate-content'>
                                                                                        <h6>
            
                                                                                            <span className='fz-24'>
                                                                                                <BiSolidBadgeCheck />
                                                                                            </span>
            
                                                                                            Certificate Guarantee
            
                                                                                        </h6>
                                                                                    </div>
            
                                                                                    <ul className="rating-list">
            
                                                                                        <li className="rating-item">
                                                                                            <FontAwesomeIcon icon={faStar} className='rating-text'/>
                                                                                        </li>
            
                                                                                        <li className="rating-item">
                                                                                            <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                                        </li>
            
                                                                                        <li className="rating-item">
                                                                                            <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                                        </li>
            
                                                                                        <li className="rating-item">
                                                                                            <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                                        </li>
            
                                                                                        <li className="rating-item">
                                                                                            <FontAwesomeIcon icon={faStarHalf} className='rating-text' />
                                                                                        </li>
            
                                                                                        <li className="rating-item">
                                                                                            <span className="rating-number">(1.2K)</span>
                                                                                        </li>
            
                                                                                    </ul>
            
                                                                                    <div className="udemy-course-price">
            
                                                                                        <h5>
                                                                                            ${course.price}
            
                                                                                            {course.originalPrice && (
                                                                                                <del className="udemy-sale">
                                                                                                    ${course.originalPrice}
                                                                                                </del>
                                                                                            )}
            
                                                                                        </h5>
            
                                                                                    </div>
            
                                                                                </div>
            
                                                                            </div>
            
                                                                        </div>
            
                                                                    </div>
            
                                                                </div>
            
                                                            </NavLink>
            
                                                        </div>
            
                                                    ))}
                                                </div>
                                               
                                                {totalPages > 1 && (
                                                    <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                                                        <button
                                                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                                                            onClick={handlePrevPage}
                                                            disabled={currentPage === 0}
                                                            style={{
                                                                opacity: currentPage === 0 ? 0.5 : 1,
                                                                cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            <MdChevronLeft size={20} />
                                                            Previous
                                                        </button>
            
                                                        <span className="text-muted">
                                                            {startIndex + 1}-{Math.min(endIndex, continueLearningCourses.length)} of {continueLearningCourses.length}
                                                        </span>
            
                                                        <button
                                                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                                                            onClick={handleNextPage}
                                                            disabled={currentPage === totalPages - 1}
                                                            style={{
                                                                opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                                                                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            Next
                                                            <MdChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )} */}
                        </div>

                        {/* <div className='col-lg-12'>
                            <div className="zs-splide-wrapper">
                                <Splide
                                    ref={splideRef2}
                                    options={{
                                        type: "loop",
                                        perPage: 1,
                                        gap: "20px",
                                        arrows: false,
                                        pagination: false,
                                        breakpoints: {
                                            992: { perPage: 2 },
                                            576: { perPage: 1 },
                                        },
                                    }}
                                >

                                    {loading ? (
                                        <div className="text-center py-5 w-100 spiner-loader">
                                            <div className="loader-course" role="status">
                                                <span className=""></span>
                                            </div>
                                            <p className="mt-3">Loading courses...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-5">
                                            <div className="alert alert-danger">
                                                <h4>Error loading courses</h4>
                                                <p>{error}</p>
                                                <button className="thm-btn" onClick={fetchCourses}>
                                                    Try Again
                                                </button>
                                            </div>
                                        </div>
                                    ) : courses.length === 0 ? (
                                        <div className="text-center py-5">
                                            <h3>No courses available</h3>
                                            <p>Check back later for new courses.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {currentCourses.map((course) => (
                                                <SplideSlide key={course._id}>

                                                    <NavLink
                                                        to={`/course/${course._id}`}
                                                        className="text-decoration-none"
                                                    >

                                                        <div className="udemy-cards">
                                                            <div className='row'>

                                                                <div className='col-lg-6'>
                                                                    <div className="udemy-picture top-udemy-picture">
                                                                        <img
                                                                            src={
                                                                                course.courseImage
                                                                                    ? course.courseImage
                                                                                    : "/course_01.png"
                                                                            }
                                                                            alt={course.title}
                                                                        />

                                                                        <div className="udemy-category-box">
                                                                            <span className="udemy-seller">Best Seller</span>
                                                                            <span className="udemy-offer">20% OFF</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className='col-lg-6'>
                                                                    <div className="udemy-content top-udemy-content-box">

                                                                        <div className='udemy-course-list top-course-list-box'>

                                                                            <div className='udemy-course-top'>

                                                                                <h4>{course.title}</h4>

                                                                                <span className="pb-2">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faUser}
                                                                                        className="udemy-course-icon"
                                                                                    />

                                                                                    <a className="udemy-user">
                                                                                        {course.instructor?.username || "Admin"}
                                                                                    </a>
                                                                                </span>

                                                                                <p>
                                                                                    {course.description?.slice(0, 90)}...
                                                                                </p>

                                                                            </div>

                                                                            <div className='udemy-course-bottom'>

                                                                                <div className='udemy-certificate-content'>
                                                                                    <h6>

                                                                                        <span className='fz-24'>
                                                                                            <BiSolidBadgeCheck />
                                                                                        </span>

                                                                                        Certificate Guarantee

                                                                                    </h6>
                                                                                </div>

                                                                                <ul className="rating-list">

                                                                                    <li className="rating-item">
                                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                                    </li>

                                                                                    <li className="rating-item">
                                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                                    </li>

                                                                                    <li className="rating-item">
                                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                                    </li>

                                                                                    <li className="rating-item">
                                                                                        <FontAwesomeIcon icon={faStar} className='rating-text' />
                                                                                    </li>

                                                                                    <li className="rating-item">
                                                                                        <FontAwesomeIcon icon={faStarHalf} className='rating-text' />
                                                                                    </li>

                                                                                    <li className="rating-item">
                                                                                        <span className="rating-number">(1.2K)</span>
                                                                                    </li>

                                                                                </ul>

                                                                                <div className="udemy-course-price">

                                                                                    <h5>
                                                                                        ${course.price}

                                                                                        {course.originalPrice && (
                                                                                            <del className="udemy-sale">
                                                                                                ${course.originalPrice}
                                                                                            </del>
                                                                                        )}

                                                                                    </h5>

                                                                                </div>

                                                                            </div>

                                                                        </div>

                                                                    </div>
                                                                </div>






                                                            </div>
                                                        </div>

                                                    </NavLink>

                                                </SplideSlide>
                                            ))}
                                        </>
                                    )}



                                </Splide>

                                <div className="zs-bottom-arrows">
                                    <button className="zs-arrow-btn" onClick={goPrev}>
                                        <FaArrowLeft />
                                    </button>

                                    <button className="zs-arrow-btn" onClick={goNext}>
                                        <FaArrowRight />
                                    </button>
                                </div>
                            </div>

                        </div> */}

                       
                    </div>
                </div>
            </section>


            <section className='explore-category-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className='udemy-learn-content'>
                                <h5> Explore <span className='top-learn-title '>Course Categories </span> </h5>
                                <div className='udemy-para-content'>
                                    <p>Explore different areas of learning.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                            <div className="zb-hover-card">
                                <img src="/explore_01.jpg" className="img-fluid" alt="image" />
                                <div className="zb-hover-overlay">
                                    <h5 className="zb-hover-title">HTML & CSS</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                            <div className="zb-hover-card">
                                <img src="/explore_02.jpg" className="img-fluid" alt="image" />
                                <div className="zb-hover-overlay">
                                    <h5 className="zb-hover-title">JavaScript</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                            <div className="zb-hover-card">
                                <img src="/explore_03.jpg" className="img-fluid" alt="image" />
                                <div className="zb-hover-overlay">
                                    <h5 className="zb-hover-title">React</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                            <div className="zb-hover-card">
                                <img src="/explore_04.jpg" className="img-fluid" alt="image" />
                                <div className="zb-hover-overlay">
                                    <h5 className="zb-hover-title">Python</h5>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </section>


            <section className='choose-us-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className='udemy-learn-content d-flex'>
                                <h5 className='text-white text-start bg-title'>  Why Should You  <span className='top-learn-title'> Choose Us</span></h5>
                            </div>
                            <div className="row">
                                <div className='col-lg-6 mb-3'>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Student-Focused Learning</h6>
                                            <p>Courses are designed specifically for students with age-appropriate explanations.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Simple & Structured Content</h6>
                                            <p>Learn step by step with clear lessons, quizzes, and progress tracking.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Secure Access with AI Card</h6>
                                            <p>One-time card access ensures safe and controlled learning for every student.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-6 mb-3'>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Language Flexibility</h6>
                                            <p>Learn in English or Kannada based on your preferred language, making it easier to understand concepts.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Trusted Certification</h6>
                                            <p>Receive a verified course completion certificate after finishing the course.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Real-World AI Relevance</h6>
                                            <p>Explore how AI is used around you every day and how learning AI today can open doors to exciting future careers.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className='choose-picture'>
                                <img src="/choose_01.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className='upcoming-section'>
                <div className="container">
                    <div className="row">
                        <div className='col-lg-12'>
                            <div className='udemy-learn-content'>
                                <h5> Upcomming <span className='top-learn-title'>Popular Courses </span> </h5>
                                <div className='udemy-para-content'>
                                    <p>Most popular courses for students.</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-12 mb-3'>
                            <UpcomingSlider
                                upcomingCourses={upcomingCourses}
                                loading={loading}
                                error={error}
                                onRetry={fetchCourses}
                                splideRef={splideRef3}
                            />
                        </div>
                        {/* <div className='text-center top-more-course'>
                            <button className='nw-thm-btn'>More</button>
                        </div> */}
                    </div>
                </div>
            </section>


            <section className='feedback-section'>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className='udemy-learn-content'>
                                <h5> Our User <span className='top-learn-title'>Feedback </span> </h5>
                            </div>
                        </div>
                        <div className='col-lg-12'>
                            <FeedbackSlider />
                        </div>
                    </div>
                </div>
            </section>


            <section className='faq-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className='udemy-learn-content'>
                                <h5> Frequently <span className='top-learn-title'> Ask Question </span> </h5>
                            </div>
                        </div>
                        <div className='col-lg-12'>
                            <div className='faq-cards'>
                                <div className="accordion zx-faq-accordion " id="zxFaq">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button className="accordion-button  zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseOne"
                                                aria-expanded="true">
                                                Who is this course designed for?
                                            </button>
                                        </h2>
                                        <div id="collapseOne"
                                            className="accordion-collapse collapse show"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingTwo">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseTwo">
                                                What makes this course easy to understand for students?
                                            </button>
                                        </h2>
                                        <div id="collapseTwo"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingThree">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseThree">
                                                What type of knowledge or skills does this course help students develop?
                                            </button>
                                        </h2>
                                        <div id="collapseThree"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingFour">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseFour">
                                                Why is this course useful for students at a school level?
                                            </button>
                                        </h2>
                                        <div id="collapseFour"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingFive">
                                            <button className="accordion-button collapsed zx-faq-btn"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#collapseFive">
                                                What learning materials are included in this course?
                                            </button>
                                        </h2>
                                        <div id="collapseFive"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#zxFaq">
                                            <div className="accordion-body">
                                                Sign up for a free account, complete your profile, showcase your skills, and start bidding on projects that match your expertise.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HomeSecond;
