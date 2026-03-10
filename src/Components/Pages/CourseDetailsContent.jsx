import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import config from "../../config/config";
import { getToken } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { FaPlay } from "react-icons/fa";

import { MdWork } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { IoBookmarkOutline, IoSpeedometer } from "react-icons/io5";
import { IoLanguage } from "react-icons/io5";
import { PiCertificateFill } from "react-icons/pi";
import { MdQuiz } from "react-icons/md";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { BsTelegram } from "react-icons/bs";
import { MdDesktopWindows } from "react-icons/md";
import { IoMdVideocam } from "react-icons/io";
import { PiCardsThreeFill } from "react-icons/pi";
import { faClose, faLock, faVideo, faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdSort } from "react-icons/md";
import { IoIosStar, IoIosStarOutline } from "react-icons/io";
import { MdRateReview } from "react-icons/md";
// 🎥 Check if video is YouTube
const isYouTube = (url) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
};

// 🎥 Extract YouTube video id
const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// 🎥 Get YouTube embed URL
const getYouTubeEmbed = (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) return "";
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
};

function CourseDetailsContent({ course: propCourse }) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [isReview, setIsReview] = useState(false)
    const [currentVideo, setCurrentVideo] = useState(null)
    const [wishlistLoading, setWishlistLoading] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const [expandedSections, setExpandedSections] = useState({});
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [course, setCourse] = useState(location.state?.course || null);
    const [loading, setLoading] = useState(!location.state?.course);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("")
    const [rating, setRating] = useState(5)

    // 🎯 Check if user has purchased this course
    const [isPurchased, setIsPurchased] = useState(false);
    // start in-checking to avoid running redirect before purchase logic kicks off
    const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);

    // 🎯 Check if we're in learning mode
    const isLearnMode = location.pathname.includes('/learn');

    // 🎯 Progress tracking
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [courseProgress, setCourseProgress] = useState(0);

    // 🎯 Auth Context
    const { user } = useAuth();
    const isLoggedIn = !!user;

    // 🎯 Check if user is enrolled in this course
    const isEnrolled = course?.enrolledStudents?.some(
        id => id.toString() === user?._id
    );

    // 🎯 Handle quiz click
    const handleQuizClick = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentLesson(null);
        setShowVideo(false);
    };
    const submitReview = async () => {

        const token = localStorage.getItem("token")

        const res = await fetch(`${config.API_BASE_URL}/reviews/${course._id}`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                rating: rating,
                comment: reviewText
            })

        })

        const data = await res.json()

        if (data.success) {

            alert("Review submitted")

            setReviewText("")
            setRating(5)

            setReviews(prev => [data.data, ...prev])

        }

    }
    useEffect(() => {

        if (!showVideo || !currentLesson?.videoUrl) return;
        if (!isYouTube(currentLesson.videoUrl)) return;

        let player;
        let interval;

        const loadPlayer = () => {

            player = new window.YT.Player("youtube-player", {

                events: {

                    onReady: () => {

                        interval = setInterval(() => {

                            const duration = player.getDuration();
                            const current = player.getCurrentTime();

                            if (duration && current / duration >= 0.7) {

                                console.log("Lesson auto completed");

                                markLessonCompleted(currentLesson._id);

                                clearInterval(interval);

                            }

                        }, 2000);

                    }

                }

            });

        };

        if (!window.YT) {

            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);

            window.onYouTubeIframeAPIReady = loadPlayer;

        } else {

            loadPlayer();

        }

        return () => {
            if (interval) clearInterval(interval);
        };

    }, [showVideo, currentLesson]);

    useEffect(() => {

        const fetchReviews = async () => {

            const res = await fetch(`${config.API_BASE_URL}/reviews/${course._id}`, {
                mode: 'cors'
            });

            const data = await res.json();

            if (data.success) {
                setReviews(data.data);
            }

        };

        if (course?._id) {
            fetchReviews();
        }

    }, [course]);

    // 🎯 Fetch course data if not provided as prop
    useEffect(() => {
        // 🔥 If course already passed from previous page

        // If course is provided as prop, use it directly
        if (propCourse) {
            setCourse(propCourse);
            setLoading(false);
            return;
        }

        // Otherwise fetch from API
        const fetchCourseData = async () => {
            try {

                setLoading(true);
                console.log('🔍 CourseDetailsContent: Fetching course data for ID:', id);

                const token = localStorage.getItem('token');
                const headers = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }


                const response = await fetch(`${config.API_BASE_URL}/public/courses/${id}`, {
                    headers: headers,
                    cache: "no-store"
                });


                const data = await response.json();
                console.log('🔍 CourseDetailsContent: API Response:', data);
                console.log("Latest course data:", data.data);

                if (data.success) {
                    setCourse(data.data);
                    console.log('✅ CourseDetailsContent: Course data loaded successfully');
                } else {
                    console.error('❌ CourseDetailsContent: API Error:', data.message);
                    setCourse(null);
                }
            } catch (error) {
                console.error('❌ CourseDetailsContent: Fetch error:', error);
                setCourse(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourseData();
        }
    }, [id, propCourse]);

    // 🎯 Check purchase status after course is loaded
    useEffect(() => {
        // do nothing until we have a loaded course with an id
        if (!course || !course._id) return;

        const checkPurchaseStatus = async () => {
            setIsCheckingPurchase(true);

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsPurchased(false);
                    setIsCheckingPurchase(false);
                    return;
                }

                // Check cache first for purchase status
                const purchaseCacheKey = `purchase_${course._id}`;
                const cachedPurchaseStatus = sessionStorage.getItem(purchaseCacheKey);

                if (cachedPurchaseStatus !== null) {
                    setIsPurchased(JSON.parse(cachedPurchaseStatus));
                    setIsCheckingPurchase(false);
                    return;
                }

                // Only fetch dashboard if not cached
                const res = await fetch(
                    `${config.API_BASE_URL}/users/dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (data.success && data.orders) {
                    const orders = data.orders;

                    const purchased = orders.some(
                        order => {
                            const orderCourseId = order.courseId?._id || order.courseId;
                            const currentCourseId = course?._id || course?.id || course?._id;
                            return orderCourseId.toString() === currentCourseId.toString();
                        }
                    );

                    setIsPurchased(purchased);
                    // Cache the result
                    sessionStorage.setItem(purchaseCacheKey, JSON.stringify(purchased));
                } else {
                    setIsPurchased(false);
                    sessionStorage.setItem(purchaseCacheKey, JSON.stringify(false));
                }
            } catch (error) {
                console.log('Error checking purchase status:', error);
                setIsPurchased(false);
            } finally {
                setIsCheckingPurchase(false);
            }
        };

        checkPurchaseStatus();
    }, [course?._id]);

    // 🎯 Access control for learn mode - redirect if not purchased
    useEffect(() => {

        // wait until purchase check finished
        if (!course || isCheckingPurchase) return;

        if (isLearnMode && !isPurchased) {
            console.log("❌ User trying to access learn mode without purchase - redirecting");

            navigate(`/course/${course._id}`, { replace: true });
        }

    }, [isLearnMode, isPurchased, isCheckingPurchase, course]);
    // 🎯 Handle location state for lesson navigation (only after course is loaded)
    useEffect(() => {
        if (!course || !location.state?.lessonId) return;

        const lessons = getAllLessons();
        const lesson = lessons.find(
            (l) => String(l._id) === String(location.state.lessonId)
        );

        if (lesson) {
            setCurrentVideo(lesson.videoUrl);
        }
    }, [course, location.state]);

    // Debug: Log course data (only after course is loaded)
    useEffect(() => {
        if (course) {
            console.log('🔍 CourseDetailsContent - course data:', course);
            console.log('🔍 CourseDetailsContent - course._id:', course?._id);
        }
    }, [course?._id]);

    // 🎯 Helper functions for sections structure
    const getAllLessons = () => {
        if (!course) return [];
        if (course.sections && course.sections.length > 0) {
            return course.sections.flatMap(section => section.lessons || []);
        } else if (course.lessons && course.lessons.length > 0) {
            return course.lessons;
        }
        return [];
    };

    const getTotalLessonsCount = () => {
        return getAllLessons().length;
    };

    // 🎯 Progress tracking functions
    const loadProgress = () => {
        if (!user || !course?._id) return;
        const progressKey = `progress_${user._id}_${course._id}`;
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            const completedLessonIds = JSON.parse(savedProgress);
            setCompletedLessons(new Set(completedLessonIds));
        }
    };

    const saveProgress = (lessonIds) => {
        if (!user || !course?._id) return;
        const progressKey = `progress_${user._id}_${course._id}`;
        localStorage.setItem(progressKey, JSON.stringify(Array.from(lessonIds)));
    };

    const markLessonCompleted = (lessonId) => {
        setCompletedLessons(prev => {
            const newCompleted = new Set(prev);
            newCompleted.add(lessonId);
            saveProgress(newCompleted);
            return newCompleted;
        });

        // ⭐ video complete hone par review modal open
        setTimeout(() => {
            openReviewModal();
        }, 500);
    };
    const openReviewModal = () => {
        const modalElement = document.getElementById("review-Add");

        if (modalElement && window.bootstrap) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    const calculateProgress = () => {
        const totalLessons = getTotalLessonsCount();
        if (totalLessons === 0) return 0;
        const completedCount = completedLessons.size;
        return Math.round((completedCount / totalLessons) * 100);
    };

    // Load progress when course and user are available
    useEffect(() => {
        if (course && user && isLearnMode) {
            loadProgress();
        }
    }, [course, user, isLearnMode]);

    // Update progress when completed lessons change
    useEffect(() => {
        const progress = calculateProgress();
        setCourseProgress(progress);
    }, [completedLessons, course]);

    // 🎯 Early returns for loading and error states (must come after all hooks)
    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mt-3">Loading Course Content...</h4>
                    <p className="text-muted">Please wait while we fetch the course information.</p>
                </div>
            </div>
        );
    }

    if (!course) {
        console.error('❌ CourseDetailsContent: No course data provided');
        return <div className="container py-5"><h3>Course data not available</h3></div>;
    }

    const getFirstLesson = () => {
        const allLessons = getAllLessons();
        return allLessons.length > 0 ? allLessons[0] : null;
    };

    // Handle lesson click with progress tracking
    const handleLessonClick = (lesson) => {
        setCurrentLesson(lesson);
        setCurrentQuiz(null);
        setShowVideo(true);

        // Mark lesson as completed when clicked (simplified - in real app, mark when video ends)
        if (lesson._id && !completedLessons.has(lesson._id)) {
            markLessonCompleted(lesson._id);
        }
    };

    // Add to wishlist function
    const addToWishlist = async () => {
        try {
            setWishlistLoading(true);
            const token = getToken();

            if (!token) {
                alert('Please login to add courses to wishlist');
                return;
            }

            const response = await fetch(`${config.API_BASE_URL}/users/wishlist/${course._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                alert('Course added to wishlist successfully!');
            } else {
                alert(data.message || 'Failed to add to wishlist');
            }
        } catch (error) {
            console.error('Add to wishlist error:', error);
            alert('Failed to add to wishlist');
        } finally {
            setWishlistLoading(false);
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
                                    <h3 className="lg_title text-center mb-2">Course</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="#" className="breadcrumb-link">
                                                        Home
                                                    </a>
                                                </li>

                                                <li className="breadcrumb-item">
                                                    <a href="#" className="breadcrumb-link">
                                                        Course
                                                    </a>
                                                </li>

                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Details
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
                        <div className="col-lg-8 mb-2">
                            <div className="course-card mb-3">
                                <div className="udemy-thumb-video">
                                    {/* Professional Video Wrapper */}
                                    <div className="video-wrapper" style={{
                                        position: "relative",
                                        width: "100%",
                                        marginBottom: "20px"
                                    }}>
                                        {!showVideo ? (
                                            <div
                                                className="thumbnail-container"
                                                onClick={() => setShowVideo(true)}
                                                style={{
                                                    position: "relative",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <img
                                                    src={course.thumbnail || course.courseImage || "/course_banner.png"}
                                                    alt="Course Thumbnail"
                                                    className="thumbnail-img"
                                                    style={{
                                                        width: "100%",
                                                        height: "400px",
                                                        objectFit: "cover",
                                                        borderRadius: "12px"
                                                    }}
                                                />

                                                <div className="play-button" style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",

                                                    background: "rgba(0, 0, 0, 0.6)",
                                                    color: "white",
                                                    fontSize: "50px",
                                                    width: "80px",
                                                    height: "80px",

                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",

                                                    borderRadius: "50%",
                                                    transition: "all 0.3s ease"
                                                }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                                                        e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)";
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
                                                        e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                                                    }}
                                                >
                                                    <FaPlay style={{ marginLeft: "5px" }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {(() => {
                                                    const lessonVideo = currentVideo || getFirstLesson()?.videoUrl;
                                                    return lessonVideo && (
                                                        <>
                                                            {isYouTube(lessonVideo) ? (
                                                                <>
                                                                    <iframe
                                                                        id="youtube-player"
                                                                        width="100%"
                                                                        height="450"
                                                                        src={`https://www.youtube.com/embed/${extractVideoId(lessonVideo)}?enablejsapi=1&origin=${window.location.origin}`}
                                                                        frameBorder="0"
                                                                        allow="autoplay; encrypted-media"
                                                                        allowFullScreen
                                                                        style={{ borderRadius: "12px" }}
                                                                    />

                                                                    <div className="text-end mt-2">
                                                                        <button
                                                                            className="thm-btn"
                                                                            onClick={() => {
                                                                                if (currentLesson?._id) {
                                                                                    markLessonCompleted(currentLesson._id);
                                                                                }
                                                                            }}
                                                                        >
                                                                            Mark as Completed
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <video
                                                                    width="100%"
                                                                    height="450"
                                                                    controls
                                                                    autoPlay
                                                                    onEnded={() => {
                                                                        if (currentLesson?._id) {
                                                                            markLessonCompleted(currentLesson._id);
                                                                        }
                                                                    }}
                                                                    onTimeUpdate={(e) => {
                                                                        const video = e.target;

                                                                        // अगर video 95% से ज्यादा play हो चुका है
                                                                        if (
                                                                            currentLesson?._id &&
                                                                            video.duration &&
                                                                            video.currentTime / video.duration > 0.95
                                                                        ) {
                                                                            markLessonCompleted(currentLesson._id);
                                                                        }
                                                                    }}
                                                                    style={{ borderRadius: "12px" }}
                                                                >
                                                                    <source
                                                                        src={
                                                                            lessonVideo.startsWith("http")
                                                                                ? lessonVideo
                                                                                : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://udemy-latest-backend-1.onrender.com'}${lessonVideo}`
                                                                        }
                                                                        type="video/mp4"
                                                                    />
                                                                    Your browser does not support video tag.
                                                                </video>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="udemy-content-video d-flex align-items-start justify-content-between">
                                        <div>
                                            <h5>{course.title || 'Course Title'}</h5>
                                            <p>Posted {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently'}</p>
                                        </div>

                                        <div>
                                            {/* <button
                                                onClick={addToWishlist}
                                                disabled={wishlistLoading}
                                                className="thm-btn outline"
                                                style={{
                                                    opacity: wishlistLoading ? 0.6 : 1,
                                                    cursor: wishlistLoading ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {wishlistLoading ? 'Adding...' : 'Add to Wishlist'}
                                            </button> */}
                                            <button
                                                onClick={addToWishlist}
                                                disabled={wishlistLoading}
                                                className="thm-btn outline wishlist-btn"
                                            >
                                                <span className="wishlist-text">
                                                    {wishlistLoading ? 'Adding...' : 'Add to Wishlist'}
                                                </span>

                                                <span className="wishlist-icon">
                                                    <IoBookmarkOutline />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="employee-tabs">
                                    <ul
                                        className="nav nav-tabs gap-3 justify-content-start mb-2 udemy-course-tab"
                                        id="myTab"
                                        role="tablist"
                                    >
                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link active"
                                                id="home-tab"
                                                data-bs-toggle="tab"
                                                href="#home"
                                                role="tab"
                                                onClick={() => setIsReview(false)}
                                            >
                                                Description
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link nw-nav-link"
                                                id="profile-tab"
                                                data-bs-toggle="tab"
                                                href="#profile"
                                                role="tab"
                                                onClick={() => setIsReview(false)}
                                            >
                                                Course Curriculum
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link nw-nav-link"
                                                id="review-tab"
                                                data-bs-toggle="tab"
                                                href="#review"
                                                role="tab"
                                                onClick={() => setIsReview(!isReview)}
                                            >
                                                Review
                                            </a>
                                        </li>
                                    </ul>

                                    <div className="employee-tabs payment-tp-border">
                                        <div className="tab-content" id="myTabContent">
                                            <div
                                                className="tab-pane fade show active"
                                                id="home"
                                                role="tabpanel"
                                            >
                                                <div className="udemy-description">
                                                    <h6 className="first_para">Descriptions</h6>
                                                    <p>
                                                        {course.description || 'Course description will be displayed here. This course covers comprehensive topics and provides in-depth learning experience.'}
                                                    </p>
                                                </div>

                                                <div className="udemy-description">
                                                    <h6 className="first_para">What I Will Learn</h6>
                                                    <ul className="ud-description-list">
                                                        <li className="ud-item">
                                                            Have the skills to start making money on the side,
                                                            as a casual freelancer, or full time as a
                                                            work-from-home freelancer
                                                        </li>
                                                        <li className="ud-item">
                                                            Easily create a beautiful HTML & CSS website with
                                                            Bootstrap (that doesn't look like generic
                                                            Bootstrap websites!)
                                                        </li>
                                                        <li className="ud-item">
                                                            Convert any static HTML & CSS website into a
                                                            Custom WordPress Theme
                                                        </li>
                                                        <li className="ud-item">
                                                            Have a thorough understanding of utilizing PHP to
                                                            create WordPress websites & themes
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="udemy-description">
                                                    <h6 className="first_para">Requirements</h6>
                                                    <ul className="ud-description-list">
                                                        <li className="ud-item pb-0">
                                                            Have a basic understanding of HTML, CSS and PHP
                                                            (all courses I offer)
                                                        </li>
                                                        <li className="ud-item pb-0">
                                                            Proficiency in tools like Premiere Pro / After
                                                            Effects / Final Cut Pro
                                                        </li>
                                                        <li className="ud-item pb-0">
                                                            Strong sense of timing, storytelling, and visual
                                                            flow
                                                        </li>
                                                        <li className="ud-item pb-0">
                                                            Ability to meet deadlines and follow creative
                                                            briefs
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="payment-tp-border"></div>

                                                <div className="about-job-box">
                                                    <h6 className="first_para">About the job</h6>
                                                    <div className="bid-job-main-box">
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">
                                                                <IoSpeedometer />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Course Level</p>
                                                                <h6>{course.level || 'Expert'}</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">
                                                                <FaClock />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p>Availability</p>
                                                                <h6>Lifetime</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">
                                                                <IoLanguage />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p>Language</p>
                                                                <h6>{course.language || 'English'}</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">
                                                                <MdWork />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Lessons</p>
                                                                <h6>{getTotalLessonsCount() || '0'}</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">
                                                                <MdQuiz />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Quizs</p>
                                                                <h6>5</h6>
                                                            </div>
                                                        </div>
                                                        <div className="bid-grid-box">
                                                            <span className="bid-about-icon">
                                                                <PiCertificateFill />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p> Certificate</p>
                                                                <h6>Yes</h6>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="payment-tp-border"></div>
                                                <div className="about-job-box">
                                                    <h6 className="first_para">Related Tags</h6>

                                                    <ul className="category-list">
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                onClick={(e) => e.preventDefault()}
                                                                className="category-nav"
                                                            >
                                                                Web design
                                                            </a>
                                                        </li>
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                onClick={(e) => e.preventDefault()}
                                                                className="category-nav"
                                                            >
                                                                Development
                                                            </a>
                                                        </li>
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                onClick={(e) => e.preventDefault()}
                                                                className="category-nav"
                                                            >
                                                                Programming
                                                            </a>
                                                        </li>
                                                        <li className="category-item">
                                                            <a
                                                                href="#"
                                                                onClick={(e) => e.preventDefault()}
                                                                className="category-nav"
                                                            >
                                                                {course.category || 'Technology'}
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="payment-tp-border"></div>

                                                <div className="bid-share-box">
                                                    <ul className="bid-share-list">
                                                        <li>
                                                            <span className="first_para fz-20 fw-700">
                                                                Share :
                                                            </span>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >
                                                                <FaFacebookF />
                                                            </a>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >
                                                                <FaLinkedinIn />
                                                            </a>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >
                                                                <FaWhatsapp />
                                                            </a>
                                                        </li>
                                                        <li className="bid-share-item">
                                                            <a
                                                                href="javscript:viud(0)"
                                                                className="bid-share-nav"
                                                            >
                                                                <BsTelegram />
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div
                                                className="tab-pane fade"
                                                id="profile"
                                                role="tabpanel"
                                            >
                                                <div className="col-lg-12">


                                                    {/* Course Curriculum Accordion */}
                                                    <div className="accordion custom-accordion" id="customAccordion">
                                                        {course.sections && course.sections.length > 0 ? (
                                                            course.sections.map((section, sectionIndex) => (
                                                                <div className="accordion-item" key={section._id || sectionIndex}>

                                                                    <h2 className="accordion-header" id={`heading${sectionIndex}`}>
                                                                        <button
                                                                            className="accordion-button"
                                                                            type="button"
                                                                            data-bs-toggle="collapse"
                                                                            data-bs-target={`#collapse${sectionIndex}`}
                                                                            aria-expanded={sectionIndex === 0}
                                                                            aria-controls={`collapse${sectionIndex}`}
                                                                        >
                                                                            <div className="accordion-title w-100 d-flex justify-content-between align-items-center">

                                                                                <span>
                                                                                    {sectionIndex + 1}. {section.title || `Section ${sectionIndex + 1}`}

                                                                                    <a href="#" className="preview-btn ms-2">
                                                                                        <FontAwesomeIcon icon={faLock} />
                                                                                    </a>
                                                                                </span>

                                                                                <div className="download-notes-box accordion-actions">
                                                                                    <button
                                                                                        className="udemy-down-btn"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            e.nativeEvent.stopImmediatePropagation();
                                                                                        }}
                                                                                    >
                                                                                        Download Notes
                                                                                    </button>
                                                                                </div>

                                                                            </div>

                                                                        </button>
                                                                    </h2>

                                                                    <div
                                                                        id={`collapse${sectionIndex}`}
                                                                        className={`accordion-collapse collapse ${sectionIndex === 0 ? "show" : ""}`}
                                                                        aria-labelledby={`heading${sectionIndex}`}
                                                                        data-bs-parent="#customAccordion"
                                                                    >

                                                                        <div className="accordion-body">

                                                                            {section.lessons && section.lessons.length > 0 ? (
                                                                                section.lessons.map((lesson, lessonIndex) => (
                                                                                    <div key={lesson._id || lessonIndex}>

                                                                                        <div className="quiz-card">

                                                                                            <div>
                                                                                                <a
                                                                                                    href="#"
                                                                                                    className="quiz-title"
                                                                                                    onClick={() => {
                                                                                                        setCurrentLesson(lesson);
                                                                                                        setCurrentVideo(lesson.videoUrl);
                                                                                                        setShowVideo(true);

                                                                                                        window.scrollTo({
                                                                                                            top: 0,
                                                                                                            behavior: "smooth"
                                                                                                        });
                                                                                                    }}
                                                                                                >

                                                                                                    {lesson.videoUrl ? (
                                                                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                                                                    ) : (
                                                                                                        <MdQuiz className="file-icon" />
                                                                                                    )}

                                                                                                    <span>{lessonIndex + 1}. {lesson.title}</span>

                                                                                                </a>
                                                                                            </div>

                                                                                            <div>

                                                                                                {completedLessons.has(lesson._id) ? (
                                                                                                    <span className="course-com-title">Completed</span>
                                                                                                ) : lesson.duration ? (
                                                                                                    <span className="course-time-title">{lesson.duration}m</span>
                                                                                                ) : null}

                                                                                            </div>



                                                                                        </div>

                                                                                        {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                                                            <div className="ms-4 mt-2">

                                                                                                {lesson.quizzes.map((quiz, quizIndex) => (

                                                                                                    <div
                                                                                                        key={quizIndex}
                                                                                                        className="quiz-card d-flex justify-content-between align-items-center mb-2"
                                                                                                    >

                                                                                                        <div>
                                                                                                            <a
                                                                                                                href="#"
                                                                                                                className="quiz-title"
                                                                                                                onClick={(e) => {

                                                                                                                    e.preventDefault();

                                                                                                                    const lId = String(lesson?._id);

                                                                                                                    if (!completedLessons.has(lId)) {
                                                                                                                        alert("Please first complete the video to unlock the quiz.");
                                                                                                                        return;
                                                                                                                    }

                                                                                                                    navigate(`/course/${course._id}/lesson/${lesson._id}/quiz/${quiz._id}`);

                                                                                                                }}
                                                                                                            >
                                                                                                                {completedLessons.has(lesson._id) ? (
                                                                                                                    <MdQuiz className="file-icon me-2" />
                                                                                                                ) : (
                                                                                                                    <FontAwesomeIcon icon={faLock} className="file-icon me-2" />
                                                                                                                )}
                                                                                                                Quiz {quizIndex + 1} : {quiz.title || "Quiz"}
                                                                                                            </a>
                                                                                                        </div>

                                                                                                        <div>
                                                                                                            <span className="course-time-title">
                                                                                                                {quiz.questions?.length || 0} Questions
                                                                                                            </span>
                                                                                                        </div>

                                                                                                    </div>

                                                                                                ))}

                                                                                            </div>
                                                                                        )}

                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <p className="text-muted">No lessons in this section yet.</p>
                                                                            )}

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <p>No lessons available yet. Check back soon!</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className="tab-pane fade"
                                                id="review"
                                                role="tabpanel"
                                            >
                                                <div className="col-lg-12 mb-3">
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <div>
                                                            <h3 className="first_para mb-0">Review</h3>
                                                        </div>
                                                        <div className="">
                                                            <div className="dropdown">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => e.preventDefault()}
                                                                    className="sort-btn"
                                                                    id="acticonMenu2"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >
                                                                    Sort By <MdSort />
                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                                                    aria-labelledby="acticonMenu2"
                                                                >
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" data-bs-toggle="modal" data-bs-target="#edit-Announcement">
                                                                            Most Relevant
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

                                                    <div className="payment-tp-border">

                                                        {reviews.length === 0 && (
                                                            <p className="text-center">No reviews yet</p>
                                                        )}

                                                        {reviews.map((review) => (

                                                            <div className="udemy-review-box" key={review._id}>

                                                                <div className="udemy-review-picture">
                                                                    <img src={review.userId?.profileImage || "/review_01.jpg"} alt="" />
                                                                </div>

                                                                <div className="udemy-review-content">

                                                                    <h5>{review.userId?.name || "User"}</h5>

                                                                    <h6>
                                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                                    </h6>

                                                                    <div className="cart-details-bx mb-2">

                                                                        <ul className="rating-list">

                                                                            {[...Array(review.rating)].map((_, i) => (
                                                                                <li key={i} className="rating-item">
                                                                                    <IoIosStar />
                                                                                </li>
                                                                            ))}

                                                                        </ul>

                                                                    </div>

                                                                    <p>{review.comment}</p>

                                                                </div>

                                                            </div>

                                                        ))}

                                                        <div className="text-center mt-2">
                                                            <button className="thm-btn outline">View More</button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isReview &&
                                <div className="course-card">
                                    <div className="">
                                        <div>
                                            <h3 className="first_para ">Write a Review</h3>
                                        </div>
                                        <div className="custom-frm-bx payment-tp-border">
                                            <textarea name="" id="" className="form-control review-control" placeholder="Write here"></textarea>
                                        </div>

                                        <div>
                                            <h3 className="first_para mb-0">Give Rating</h3>
                                            <div className=" cart-details-bx ">
                                                <ul className="rating-list">
                                                    <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStar />
                                                    </a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline />
                                                    </a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /> </a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn"> <IoIosStarOutline /></a></li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="mt-3 d-flex align-items-center gap-3">
                                            <button type="button" className="thm-btn px-5" data-bs-toggle="modal" data-bs-target="#review-Add">Submit</button>
                                            <button className="revw-btn outline" >Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className="col-lg-4">
                            <div className="course-card mb-3">
                                <div className="udemy-price-box mb-3">
                                    <h5 className="fz-20 mb-0">Your Learning Progress</h5>
                                </div>

                                <div className="progress-wrapper mb-3">
                                    <div className="progress-item">
                                        <div className="d-flex align-items-center justify-content-between udemy-progress">
                                            <span className="udemy-complete-video">Course Completion</span>
                                        </div>

                                        <div className="progress custom-progress">
                                            <div className="progress-bar" style={{ width: `${courseProgress}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    {isCheckingPurchase ? (
                                        <button
                                            className="thm-btn w-100"
                                            disabled
                                        >
                                            Checking Purchase Status...
                                        </button>
                                    ) : (
                                        <button
                                            className="thm-btn w-100"
                                            style={{
                                                cursor: 'pointer',
                                                zIndex: 10,
                                                position: 'relative'
                                            }}
                                            onClick={() => {

                                                const firstLesson = getFirstLesson();

                                                if (!firstLesson) return;

                                                setCurrentLesson(firstLesson);   // ⭐ important
                                                setCurrentVideo(firstLesson.videoUrl);
                                                setShowVideo(true);

                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth"
                                                });

                                            }}
                                        >
                                            {isPurchased ? 'Continue Learning' : 'Start Learning'}
                                        </button>
                                    )}
                                </div>

                                <div className="course-duration-content">
                                    <p>Course Start: <span className="duration-date"> 16-01-2026</span> </p>
                                    <p>Estimated Completion Time: <span className="duration-date">8 week</span> </p>
                                </div>
                            </div>

                            <div className="course-master-card">
                                <div className="webinar-content">
                                    <span className="webinar-title">WEBINAR</span>

                                    <h6>Ana Kursova</h6>
                                    <h3>Masterclass in Design Thinking, Innovation & Creativity</h3>

                                    <div>
                                        <a href="javacript:void(0)" className="course-more-btn">Learn More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* payment Successful Popup Start  */}
            <div className="modal step-modal fade" id="review-Add" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content custom-modal-box success-modal">
                        <div className="text-end">
                            <button type="button" className="modal-close-btn" data-bs-dismiss="modal" aria-label="Close">
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="modal-body px-4">
                            <div className="row ">
                                <div className="col-lg-12">
                                    <form action="">
                                        <div className="offer-modal-content">
                                            <span className="offer-modal-icon"> <MdRateReview /> </span>
                                            <h6 className="fz-24 fw-700">How was your learning experience? Share a quick review!</h6>

                                            <div className=" cart-details-bx d-flex align-items-center justify-content-center">
                                                <ul className="rating-list">
                                                    <li className="rating-item"><a href="#" className="review-ration-btn fz-24"> <IoIosStar />
                                                    </a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn fz-24"> <IoIosStarOutline />
                                                    </a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn fz-24"> <IoIosStarOutline /> </a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn fz-24"> <IoIosStarOutline /></a></li>
                                                    <li className="rating-item"><a href="#" className="review-ration-btn fz-24"> <IoIosStarOutline /></a></li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="custom-frm-bx">
                                            <textarea name="" id="" className="form-control " style={{ height: "167px" }} placeholder="Write here Something(Optional)"></textarea>
                                        </div>

                                        <div className="mt-4 text-center">
                                            <button
                                                className="thm-btn px-5"
                                                onClick={submitReview}
                                                data-bs-dismiss="modal"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  payment Successful Popup End */}
        </>
    )
}

export default CourseDetailsContent