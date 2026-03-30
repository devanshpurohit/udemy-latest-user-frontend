import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { BiSolidBadgeCheck } from 'react-icons/bi';
import { FaArrowLeft, FaArrowRight, FaCheck, FaQuoteRight } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getBackendUrl } from '../../config/backendConfig';
import config from '../../config/config';
import { getLangText } from '../../utils/languageUtils';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";

// Import Components
import TopLearningSlider from '../Sliders/TopLearningSlider';
import UpcomingSlider from '../Sliders/UpcomingSlider';
import FeedbackSlider from '../Sliders/FeedbackSlider';
import CourseCard from '../Common/CourseCard';
import { getQuestionsPublic, getAllCourses, getCachedAllCourses, getCachedQuestionsPublic, getMyCourses } from "../../services/apiService";

const HomeSecond = () => {
    const { isAuthenticated, user } = useAuth();
    const userLanguage = user?.profile?.language || 'English';
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [faqs, setFaqs] = useState([]);
    const [loadingFaqs, setLoadingFaqs] = useState(true);

    useEffect(() => {
        // Instant FAQ cache load
        const cachedFaqs = getCachedQuestionsPublic();
        if (cachedFaqs && cachedFaqs.data) {
            setFaqs(cachedFaqs.data);
            setLoadingFaqs(false);
        }

        const fetchFaqs = async () => {
            try {
                const res = await getQuestionsPublic(false);
                if (res.success) {
                    setFaqs(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch FAQs:", err);
            } finally {
                setLoadingFaqs(false);
            }
        };
        fetchFaqs();
    }, []);

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const coursesPerPage = 4;

    const splideRef1 = useRef(null);
    const splideRef2 = useRef(null);
    const splideRef3 = useRef(null);

    // Memoize course slices to prevent unnecessary recalculations
    const topLearningCourses = useMemo(() => courses, [courses]);
    const upcomingCourses = useMemo(() => courses.slice(0, 4), [courses]);



    useEffect(() => {
        // Instant Course cache load
        const cachedCourses = getCachedAllCourses();
        if (cachedCourses && cachedCourses.data) {
            setCourses(cachedCourses.data);
            setLoading(false);
        }
        
        fetchCourses();
    }, [isAuthenticated]);
    useEffect(() => {
        if (courses.length > 0) {
            splideRef1.current?.splide?.refresh();
            splideRef2.current?.splide?.refresh();
            splideRef3.current?.splide?.refresh();
        }
    }, [courses]);

    const fetchCourses = async () => {
        try {
            if (courses.length === 0) {
                setLoading(true);
            }
            console.log('🔍 HomeSecond: Fetching courses via apiService...');

            const response = await getAllCourses(false);
            
            if (response.success && response.data && Array.isArray(response.data)) {
                let coursesData = response.data;

                // If authenticated, fetch progress data and merge it
                if (isAuthenticated) {
                    try {
                        const myCoursesRes = await getMyCourses(false); // Bypass cache for live update
                        if (myCoursesRes.success && myCoursesRes.data) {
                            const responseData = myCoursesRes.data;
                            const myCourses = Array.isArray(responseData) 
                                ? responseData 
                                : (responseData.data || responseData.enrolledCourses || responseData.courses || []);

                            // Create a map for quick lookup
                            const progressMap = new Map();
                            myCourses.forEach(c => {
                                // Handle both populated and unpopulated courseId
                                const courseId = c.courseId?._id || c.courseId?.id || c.courseId || c._id || c.id;
                                if (courseId) {
                                    progressMap.set(courseId.toString(), {
                                        progressPercentage: c.progressPercentage || 0,
                                        completedLessonsCount: c.completedLessonsCount || 0,
                                        totalLessonsCount: c.totalLessonsCount || 0,
                                        isPurchased: true
                                    });
                                }
                            });

                            // Merge progress into the main courses list
                            coursesData = coursesData.map(course => {
                                const courseIdStr = (course._id || course.id)?.toString();
                                if (courseIdStr) {
                                    const progress = progressMap.get(courseIdStr);
                                    if (progress) {
                                        return { ...course, ...progress };
                                    }
                                }
                                return course;
                            });
                        }
                    } catch (myErr) {
                        console.error("Failed to fetch user progress:", myErr);
                    }
                }

                setCourses(coursesData);
                console.log(`✅ HomeSecond: ${coursesData.length} courses loaded ${response.fromCache ? '(from cache)' : ''}`);
            } else {
                setError(response.error || 'Failed to load courses');
            }
        } catch (error) {
            setError('Failed to fetch courses');
            console.error('❌ HomeSecond: Fetch Error:', error);
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
                                <button 
                                    className='alert-btn'
                                    {...(!isAuthenticated ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#loginModal' } : {})}
                                    onClick={() => {
                                        if (isAuthenticated) {
                                            const aiCourse = courses.find(c => {
                                                const title = getLangText(c.title, userLanguage);
                                                return title.toLowerCase().includes('ai');
                                            }) || courses[0];
                                            if (aiCourse) {
                                                navigate(`/course/${aiCourse._id}`);
                                            } else {
                                                navigate('/my-account');
                                            }
                                        }
                                    }}
                                >
                                    Click here!
                                </button>
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
                                <h5>{settings.bannerTitle || "Learn AI the Smart Way"}</h5>
                                <h2>{settings.bannerSubtitle || "Simple, practical AI concepts designed for school students."}</h2>
                                <p>{settings.bannerDescription || "Explore the basics of AI through guided lessons and real examples.Learn how artificial intelligence is shaping the world around us."}</p>
                                <div>
                                    <NavLink to="/available-courses" className='explore-btn'>Explore Courses</NavLink>
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
                            <div className="row">
                                {(topLearningCourses || [])?.slice(0, 4).map((course) => (
                                    <div key={course._id} className="col-lg-12 col-md-12 col-sm-12 mb-3">
                                        <CourseCard course={course} variant="my-course" />
                                    </div>
                                ))}
                            </div>

                            <div className='text-center top-more-course mt-4'>
                                <NavLink to="/available-courses" className='nw-thm-btn'>Show More</NavLink>
                            </div>
                        </div>

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
                                                                                            <span className="rating-number">({course.averageRating?.toFixed(1) || "0.0"})</span>
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
                                                                                        <span className="rating-number">({course.averageRating?.toFixed(1) || "0.0"})</span>
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
                        <div className='text-center top-more-course mt-4'>
                            <NavLink to="/available-courses" className='nw-thm-btn'>Show More</NavLink>
                        </div>
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
                                <div className="accordion zx-faq-accordion " id="zxFaqHS">
                                    {loadingFaqs ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : faqs.length > 0 ? (
                                        faqs.slice(0, 10).map((faq, index) => (
                                            <div className="accordion-item" key={faq._id}>
                                                <h2 className="accordion-header" id={`headingHS${index}`}>
                                                    <button 
                                                        className={`accordion-button zx-faq-btn ${index !== 0 ? 'collapsed' : ''}`}
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#collapseHS${index}`}
                                                        aria-expanded={index === 0 ? "true" : "false"}>
                                                        {faq.question}
                                                    </button>
                                                </h2>
                                                <div id={`collapseHS${index}`}
                                                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                                    data-bs-parent="#zxFaqHS">
                                                    <div className="accordion-body">
                                                        {faq.answer || "No answer provided yet."}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            No questions asked yet. Be the first to ask!
                                        </div>
                                    )}
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
