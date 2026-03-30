import { faStar, faStarHalf, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BiSolidBadgeCheck } from "react-icons/bi";
import { FaArrowLeft, FaArrowRight, FaCheck, FaQuoteRight } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getBackendUrl } from '../../config/backendConfig';
import { getLangText } from '../../utils/languageUtils';


import { useRef, useState, useEffect, useMemo } from 'react';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";

// Import Components
import TopLearningSlider from '../Sliders/TopLearningSlider';
import UpcomingSlider from '../Sliders/UpcomingSlider';
import FeedbackSlider from '../Sliders/FeedbackSlider';
import CourseCard from '../Common/CourseCard';
import { getQuestionsPublic, getAllCourses, getCachedAllCourses, getCachedQuestionsPublic } from "../../services/apiService";

function Home() {
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


    const splideRef1 = useRef(null);
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

    const fetchCourses = async () => {
        try {
            if (courses.length === 0) {
                setLoading(true);
            }
            console.log('🔍 Home: Fetching courses via apiService...');

            const response = await getAllCourses(false); // Force fresh fetch to get progress data

            if (response.success && response.data) {
                setCourses(response.data);
                console.log(`✅ Home: ${response.data.length} courses loaded ${response.fromCache ? '(from cache)' : ''}`);
            } else {
                setError(response.error || 'Failed to load courses');
            }
        } catch (error) {
            setError('Failed to fetch courses');
            console.error('❌ Home: Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };
    const coursesPerPage = 4;
    const [currentPage, setCurrentPage] = useState(0);
    //  const topLearningCourses = useMemo(() => courses, [courses]);
    const continueLearningCourses = useMemo(() => courses, [courses]);
    // const upcomingCourses = useMemo(() => courses, [courses]);

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



    //  const splideRef1 = useRef(null);
    const splideRef2 = useRef(null);


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
                                <p>Start Your AI Journey with our Student AI Portal & AI Study Card</p>
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
                                                navigate('/available-courses');
                                            }
                                        }
                                    }}
                                >
                                    Get Started
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
                                <h5>{settings.bannerTitle || "Best Learning Platform"}</h5>
                                <h2>{settings.bannerSubtitle || "Empowering Students with AI-Driven Learning"}</h2>
                                <p>{settings.bannerDescription || "Access premium courses, study materials, and AI-powered tools designed to help you excel in your academic journey."}</p>
                                <div className="d-flex gap-3 explore-signup-bx">
                                    <div>
                                        <NavLink to="/available-courses" className='explore-btn'>Explore Courses</NavLink>
                                    </div>
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



            {/* Continue Learning Section */}
            <section className='top-learn-section'>
                <div className="container">
                    <div className="row">
                        <div className='col-lg-12'>
                            <div className='udemy-learn-content'>
                                <h5> <span className='top-learn-title'>Top Learning</span> Course </h5>
                                <div className='udemy-para-content'>
                                    <p>Explore our most popular and highly-rated courses.</p>
                                </div>
                            </div>
                        </div>

                        <div className='col-lg-12 mb-3'>
                        {loading && courses.length === 0 ? (
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
                            ) : courses.length === 0 ? (
                                <div className="text-center py-5">
                                    <h3>No courses available</h3>
                                    <p>Check back later for new courses.</p>
                                </div>
                            ) : (
                                <>
                                    {currentCourses.map((course) => (
                                        <SplideSlide key={course._id}>
                                            <CourseCard course={course} variant="continue-learning" />
                                        </SplideSlide>
                                    ))}
                                </>
                            )}


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
                                                                                alt={getLangText(course.title, userLanguage)}
                                                                            />
                                                                            <div className="udemy-category-box">
                                                                                <span className="udemy-seller">Best Seller</span>
                                                                                <span className="udemy-offer">20% OFF</span>
                                                                            </div>
            
                                                                        </div>
            
                                                                        <div className="udemy-content mt-0">
                                                                            <div className='udemy-course-list'>
                                                                                <div className='udemy-course-top'>
                                                                                    <h4>{getLangText(course.title, userLanguage)}</h4>
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
                                                                                        {getLangText(course.description, userLanguage)?.slice(0, 90)}...
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
                                                            {t('home.previous')}
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
                                                            {t('home.next')}
                                                            <MdChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )} */}
                        </div>

                        <div className='text-center top-more-course mt-4'>
                            <NavLink to="/available-courses" className='nw-thm-btn'>Show More</NavLink>
                        </div>
                    </div>
                </div>
            </section>

            <section className='explore-category-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className='udemy-learn-content '>
                                <h5> Explore <span className='top-learn-title'>Categories </span> </h5>
                                <div className='udemy-para-content'>
                                    <p>Discover courses across various domains and technologies.</p>
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
                                    <h5 className="zb-hover-title">HTML & CSS</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                            <div className="zb-hover-card">
                                <img src="/explore_03.jpg" className="img-fluid" alt="image" />
                                <div className="zb-hover-overlay">
                                    <h5 className="zb-hover-title">HTML & CSS</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                            <div className="zb-hover-card">
                                <img src="/explore_04.jpg" className="img-fluid" alt="image" />
                                <div className="zb-hover-overlay">
                                    <h5 className="zb-hover-title">HTML & CSS</h5>
                                </div>
                            </div>
                        </div>
                        <div className='text-center top-more-course mt-4'>
                            <NavLink to="/available-courses" className='nw-thm-btn'>Show More</NavLink>
                        </div>
                    </div>
                </div>
            </section>

            <section className='choose-us-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className='udemy-learn-content d-flex'>
                                <h5 className='text-white text-start bg-title'>  Why Choose  <span className='top-learn-title'> Us</span></h5>
                            </div>
                            <div className="row">
                                <div className='col-lg-6 mb-3'>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Expert Instructors</h6>
                                            <p>Learn from industry experts and experienced educators.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>AI-Powered Tools</h6>
                                            <p>Utilize advanced AI tools to enhance your learning experience.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Flexible Learning</h6>
                                            <p>Study at your own pace, anytime and anywhere.</p>
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
                                            <h6>Comprehensive Content</h6>
                                            <p>In-depth courses covering all essential topics.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Certification</h6>
                                            <p>Earn recognized certificates upon course completion.</p>
                                        </div>
                                    </div>
                                    <div className='choose-main-content'>
                                        <div>
                                            <span className='choose-check-icon'> <FaCheck />
                                            </span>
                                        </div>
                                        <div className='choose-content'>
                                            <h6>Student Support</h6>
                                            <p>Get 24/7 support for all your queries and issues.</p>
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
                                <h5> Upcoming <span className='top-learn-title'>Course </span> </h5>
                                <div className='udemy-para-content'>
                                    <p>Explore our most popular and highly-rated courses.</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-12'>
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
                                <h5> Students <span className='top-learn-title'>Feedback </span> </h5>
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
                                <h5> Common <span className='top-learn-title'> Question </span> </h5>
                            </div>
                        </div>
                        <div className='col-lg-12'>
                            <div className='faq-cards'>
                                <div className="accordion zx-faq-accordion " id="zxFaq">
                                    {loadingFaqs && faqs.length === 0 ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : faqs.length > 0 ? (
                                        faqs.slice(0, 10).map((faq, index) => (
                                            <div className="accordion-item" key={faq._id}>
                                                <h2 className="accordion-header" id={`heading${index}`}>
                                                    <button 
                                                        className={`accordion-button zx-faq-btn ${index !== 0 ? 'collapsed' : ''}`}
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#collapse${index}`}
                                                        aria-expanded={index === 0 ? "true" : "false"}>
                                                        {faq.question}
                                                    </button>
                                                </h2>
                                                <div id={`collapse${index}`}
                                                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                                    data-bs-parent="#zxFaq">
                                                    <div className="accordion-body">
                                                        {faq.answer || "No answer provided yet."}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            No questions found.
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

export default Home
