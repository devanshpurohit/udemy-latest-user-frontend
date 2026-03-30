import React, { useEffect, useState } from "react"; 
import { useParams, useNavigate, useLocation } from "react-router-dom";
import config from "../../config/config";
import { getToken } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { FaPlay } from "react-icons/fa";
import { toast } from "react-toastify";
import { getCourseById, getCachedCourseById, getCourseReviews, getDashboardData, syncCartWithPurchases } from "../../services/apiService";

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
import { faClose, faVideo, faClock, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdSort } from "react-icons/md";
import { IoIosStar, IoIosStarOutline } from "react-icons/io";
import { MdRateReview } from "react-icons/md";
import { getLangText } from "../../utils/languageUtils";
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

const normalizeMediaUrl = (url) => {
    if (!url) return "/course_banner.png";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    let cleanPath = url.replace(/\\/g, '/');
    if (cleanPath.includes('/uploads/')) {
        cleanPath = '/uploads/' + cleanPath.split('/uploads/').pop();
    }
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }
    const baseUrl = config.API_BASE_URL.replace('/api', '');
    return encodeURI(`${baseUrl}${cleanPath}`.replace(/\/+/g, '/').replace(':/', '://'));
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
    const [course, setCourse] = useState(() => {
        if (propCourse) return propCourse;
        if (location.state?.course) return location.state.course;
        if (id) {
            const cached = getCachedCourseById(id);
            if (cached && cached.success) return cached.data.data || cached.data;
        }
        return null;
    });

    const [loading, setLoading] = useState(() => {
        if (propCourse || location.state?.course) return false;
        if (id) {
            const cached = getCachedCourseById(id);
            if (cached && cached.success) return false;
        }
        return true;
    });
    const [reviews, setReviews] = useState([]);
    const [courseFAQs, setCourseFAQs] = useState([]);
    const [faqLoading, setFaqLoading] = useState(false);
    const [reviewText, setReviewText] = useState("")
    const [rating, setRating] = useState(5)
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [sortReviewBy, setSortReviewBy] = useState('newest');
    const INITIAL_REVIEWS_COUNT = 3;
    const [activeFaq, setActiveFaq] = useState(null);

    // 🎯 Check if user has purchased this course (Always true here since CourseGuard prevents non-purchased users from seeing this)
    const isPurchased = true;

    // 🎯 Check if we're in learning mode
    const isLearnMode = location.pathname.includes('/learn');

    // 🎯 Progress tracking
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [courseProgress, setCourseProgress] = useState(0);

    // 🎯 Auth Context
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const userLanguage = user?.profile?.language || 'English';

    // 🎯 Check if user is enrolled in this course
    const isEnrolled = course?.enrolledStudents?.some(
        id => id.toString() === user?._id
    );

    // 🎯 Handle quiz click
    const handleDownloadNotes = () => {
        try {
            if (!course?.resources || course.resources.length === 0) {
                toast.info("No resources available for this course.");
                return;
            }

            course.resources.forEach(resource => {
                const link = document.createElement('a');
                let fullUrl = resource.url;
                if (!resource.url.startsWith('data:') && !resource.url.startsWith('http')) {
                    // Normalize path: replace backslashes, extract only the part after 'uploads' or root
                    let cleanPath = resource.url.replace(/\\/g, '/');
                    
                    if (cleanPath.includes('/uploads/')) {
                        cleanPath = '/uploads/' + cleanPath.split('/uploads/').pop();
                    }
                    
                    if (!cleanPath.startsWith('/')) {
                        cleanPath = '/' + cleanPath;
                    }

                    const baseUrl = config.API_BASE_URL.replace('/api', '');
                    fullUrl = `${baseUrl}${cleanPath}`.replace(/\/+/g, '/').replace(':/', '://');
                    fullUrl = encodeURI(fullUrl);
                }
                link.href = fullUrl;
                link.download = resource.name || 'resource';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
            
            toast.success(`Starting download for ${course.resources.length} resource(s)`);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download notes. Please try again.");
        }
    };

    const handleQuizClick = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentLesson(null);
        setShowVideo(false);
    };

    // 🎯 Fetch Course FAQs
    useEffect(() => {
        const fetchCourseFAQs = async () => {
            if (!course?._id) return;
            try {
                setFaqLoading(true);
                const response = await fetch(`${config.API_BASE_URL}/questions/course/${course._id}`);
                const data = await response.json();
                if (data.success) {
                    setCourseFAQs(data.data);
                }
            } catch (error) {
                console.error("❌ Fetch Course FAQs Error:", error);
            } finally {
                setFaqLoading(false);
            }
        };

        fetchCourseFAQs();
    }, [course?._id]);

    const submitReview = async (e) => {
        if(e) e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) { toast.error("Please login to submit a review"); return; }

        try {
            const res = await fetch(`${config.API_BASE_URL}/reviews/${course._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ rating: rating, comment: reviewText })
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Review submitted! It will be visible after admin approval.");
                setReviewText("");
                setRating(5);
                // We don't add it to the local state yet because it needs approval to be seen
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (err) {
            console.error("Submit review error:", err);
            toast.error("Failed to submit review. Please try again.");
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
            if (!course?._id) return;
            try {
                const res = await getCourseReviews(course._id, false);
                if (res.success) {
                    setReviews(res.data);
                }
            } catch (err) {
                console.log("Error fetching reviews:", err);
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
                if (!course) {
                    setLoading(true);
                }
                console.log('🔍 CourseDetailsContent: Fetching course data via apiService:', id);

                const response = await getCourseById(id, false); // Bypass cache for learn page

                if (response.success && response.data) {
                    const courseData = response.data.data || response.data;
                    setCourse(courseData);
                    console.log('✅ CourseDetailsContent: Course data loaded successfully', response.fromCache ? '(from cache)' : '');
                } else {
                    console.error('❌ CourseDetailsContent: Error:', response.error);
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

    // 🎯 Access control for learn mode - redirect if not purchased is handled by CourseGuard now!

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
        if (course?.totalLessonsCount > 0) return course.totalLessonsCount;
        if (course?.totalLessons > 0) return course.totalLessons;
        return getAllLessons().length;
    };

    const getTotalQuizzesCount = () => {
        if (!course || !course.sections) return 0;
        return course.sections.reduce((total, section) => {
            return total + (section.lessons ? section.lessons.reduce((lessonTotal, lesson) => {
                return lessonTotal + (lesson.quizzes ? lesson.quizzes.length : 0);
            }, 0) : 0);
        }, 0);
    };

    // 🎯 Progress tracking functions
    const loadProgress = () => {
        if (!user || !course?._id) return;
        
        const progressKey = `progress_${user._id}_${course._id}`;
        const savedProgress = localStorage.getItem(progressKey);
        let localCompletedIds = [];
        
        if (savedProgress) {
            try {
                localCompletedIds = JSON.parse(savedProgress).map(id => String(id));
            } catch (e) {
                console.error("Error parsing local progress:", e);
            }
        }

        // Merge with backend progress if available
        // The public API now returns completedLessons for enrolled users
        const backendCompletedIds = (course.completedLessons || []).map(l => 
            typeof l === 'object' ? (l.lessonId || l._id || l.lesson) : l
        ).filter(Boolean).map(id => String(id));

        const mergedIds = new Set([...localCompletedIds, ...backendCompletedIds]);
        
        setCompletedLessons(mergedIds);
        
        // Save merged progress back to localStorage
        localStorage.setItem(progressKey, JSON.stringify(Array.from(mergedIds)));
        
        // If we have local IDs that aren't on the backend, sync them
        const localOnlyIds = localCompletedIds.filter(id => !backendCompletedIds.includes(id));
        if (localOnlyIds.length > 0) {
            syncLocalToBackend(localOnlyIds);
        }
    };

    const syncLocalToBackend = async (lessonIds) => {
        const token = localStorage.getItem('token');
        if (!token || !user?._id || !course?._id) return;

        console.log(`🔄 Syncing ${lessonIds.length} local-only lessons to backend...`);
        
        // We call the existing single-lesson sync for each lesson
        // A bulk endpoint would be better, but this works with existing API
        for (const lessonId of lessonIds) {
            try {
                await fetch(`${config.API_BASE_URL}/students/${user._id}/courses/${course._id}/progress`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ lessonId })
                });
            } catch (err) {
                console.error(`Failed to sync lesson ${lessonId}:`, err);
            }
        }
    };

    const saveProgress = (lessonIds) => {
        if (!user || !course?._id) return;
        const progressKey = `progress_${user._id}_${course._id}`;
        localStorage.setItem(progressKey, JSON.stringify(Array.from(lessonIds)));
    };

    const markLessonCompleted = async (lessonId) => {
        if (!lessonId) return;
        const idStr = String(lessonId);

        // Local update
        setCompletedLessons(prev => {
            const newCompleted = new Set(prev);
            newCompleted.add(idStr);
            saveProgress(newCompleted);
            return newCompleted;
        });

        // ⭐ Sync with Backend
        try {
            const token = localStorage.getItem('token');
            if (token && user?._id && course?._id) {
                const response = await fetch(`${config.API_BASE_URL}/students/${user._id}/courses/${course._id}/progress`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        lessonId: idStr,
                    })
                });
                const result = await response.json();
                console.log('Progress sync result:', result);
            }
        } catch (err) {
            console.error("Failed to sync progress to backend:", err);
        }

        // ⭐ video complete hone par review modal open
        setTimeout(() => {
            openReviewModal();
        }, 500);
    };

    const openReviewModal = () => {
        const modalElement = document.getElementById("review-Add");

        if (modalElement && window.bootstrap) {
            const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
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
        if (course && user) {
            console.log("🔄 CourseDetailsContent: Triggering loadProgress...");
            loadProgress();
        }
    }, [course, user]); // Use objects to ensure it triggers on fresh fetch

    // Update progress when completed lessons change
    useEffect(() => {
        const progress = calculateProgress();
        setCourseProgress(progress);
    }, [completedLessons, course]);

    // 🎯 Early returns for loading and error states (must come after all hooks)
    if (loading && !course) {
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

    const handleLessonClick = (lesson) => {
        if (!isPurchased && user?.role !== 'admin') {
            toast.info("First buy the course to access the video.");
            return;
        }
        
        // Navigate to the dynamic video player page
        navigate(`/video-player/${course._id}`, { state: { lessonId: lesson._id } });
    };

    // Add to wishlist function
    const addToWishlist = async () => {
        try {
            setWishlistLoading(true);
            const token = getToken();

            if (!token) {
                toast.error('Please login to add courses to wishlist');
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
                toast.success('Course added to wishlist successfully!');
            } else {
                toast.error(data.message || 'Failed to add to wishlist');
            }
        } catch (error) {
            console.error('Add to wishlist error:', error);
            toast.error('Failed to add to wishlist');
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
                                    <h3 className="lg_title text-center mb-2">Courses</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="/" className="breadcrumb-link">
                                                        Home
                                                    </a>
                                                </li>

                                                <li className="breadcrumb-item">
                                                    <a href="/available-courses" className="breadcrumb-link">
                                                        Courses
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
                                                onClick={() => {
                                                    if (!isPurchased && user?.role !== 'admin') {
                                                        toast.info("First buy the course to access the video.");
                                                        return;
                                                    }
                                                    navigate(`/video-player/${course._id}`);
                                                }}
                                                style={{
                                                    position: "relative",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <img
                                                    src={normalizeMediaUrl(course?.thumbnail || course?.courseImage)}
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
                                                                    src={currentLesson.videoUrl.startsWith('http')
                                                                        ? currentLesson.videoUrl
                                                                        : `${config.API_BASE_URL.replace('/api', '')}/${currentLesson.videoUrl.replace(/\\/g, '/')}`.replace(/\/+/g, '/').replace(':/', '://')}
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
                                            <h5>{getLangText(course.title, userLanguage) || 'Course Title'}</h5>
                                            <div className="cart-details-bx mb-2">
                                                <ul className="rating-list">
                                                    {[...Array(5)].map((_, index) => {
                                                        const starValue = index + 1;
                                                        const rating = course.averageRating || 0;
                                                        return (
                                                            <li key={index} className="rating-item">
                                                                <IoIosStar
                                                                    style={{ color: rating >= starValue ? '#ffc107' : rating >= starValue - 0.5 ? '#ffc107' : '#e4e5e9' }}
                                                                />
                                                            </li>
                                                        );
                                                    })}
                                                    <li className="rating-item ps-1">
                                                        <span className="rating-number">
                                                            {course.averageRating?.toFixed(1) || "0.0"} ({course.numReviews || 0} reviews)
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
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

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link nw-nav-link"
                                                id="faq-tab"
                                                data-bs-toggle="tab"
                                                href="#faq-section"
                                                role="tab"
                                                onClick={() => setIsReview(false)}
                                            >
                                                FAQ
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
                                                    <p className="course-desc" style={{ whiteSpace: 'pre-line' }}>
                                                        {getLangText(course.description, userLanguage) || 'Course description will be displayed here. This course covers comprehensive topics and provides in-depth learning experience.'}
                                                    </p>
                                                </div>

                                                {course?.whatYouWillLearn && (() => {
                                                    const learnList = Array.isArray(course.whatYouWillLearn)
                                                        ? course.whatYouWillLearn
                                                        : (course.whatYouWillLearn[userLanguage === 'Kannada' ? 'kn' : 'en'] || course.whatYouWillLearn.en || []);
                                                    return learnList.length > 0 && (
                                                        <div className="udemy-description">
                                                            <h6 className="first_para">What I Will Learn</h6>
                                                            <ul className="ud-description-list">
                                                                {learnList.map((item, index) => (
                                                                    <li key={index} className="ud-item pb-2">{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })()}

                                                {course?.requirements && (() => {
                                                    const reqList = Array.isArray(course.requirements)
                                                        ? course.requirements
                                                        : (course.requirements[userLanguage === 'Kannada' ? 'kn' : 'en'] || course.requirements.en || []);
                                                    return reqList.length > 0 && (
                                                        <div className="udemy-description">
                                                            <h6 className="first_para">Requirements</h6>
                                                            <ul className="ud-description-list">
                                                                {reqList.map((item, index) => (
                                                                    <li key={index} className="ud-item pb-2">{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })()}

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
                                                                <h6 style={{ textTransform: 'capitalize' }}>{course?.level || 'Beginner'}</h6>
                                                                       <div className="bid-grid-box">
                                                            <span className="bid-about-icon">
                                                                <IoLanguage />
                                                            </span>
                                                            <div className="bid-about-content">
                                                                <p>Language</p>
                                                                <h6>{getLangText(course?.language, userLanguage) || 'English'}</h6>
                                                            </div>
                                                        </div>
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
                                                                <h6>{getTotalQuizzesCount() || '0'}</h6>
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

                                                                    <h2 className="accordion-header position-relative" id={`heading${sectionIndex}`}>
                                                                        <button
                                                                            className="accordion-button"
                                                                            type="button"
                                                                            data-bs-toggle="collapse"
                                                                            data-bs-target={`#collapse${sectionIndex}`}
                                                                            aria-expanded={sectionIndex === 0}
                                                                            aria-controls={`collapse${sectionIndex}`}
                                                                        >
                                                                            <div className="accordion-title w-100 d-flex justify-content-between align-items-center pe-5">
                                                                                <span>
                                                                                    {sectionIndex + 1}. {getLangText(section.title, userLanguage) || `Section ${sectionIndex + 1}`}
                                                                                </span>
                                                                            </div>
                                                                        </button>
                                                                        {/* Download button moved OUTSIDE the accordion-button to fix click bubbling */}
                                                                        <div className="download-notes-box " >
                                                                            <button
                                                                                className="udemy-down-btn"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    if (e.nativeEvent) {
                                                                                        e.nativeEvent.stopImmediatePropagation();
                                                                                    }
                                                                                    // Handle download logic here
                                                                                    handleDownloadNotes();
                                                                                }}
                                                                            >
                                                                                <span className="mb-note-rm">Download Notes</span>
                                                                                <span className="d-lg-none"><FontAwesomeIcon icon={faDownload}/></span>
                                                                            </button>
                                                                        </div>
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
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        handleLessonClick(lesson);
                                                                                                    }}
                                                                                                >

                                                                                                    {lesson.videoUrl ? (
                                                                                                        <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                                                                    ) : (
                                                                                                        <MdQuiz className="file-icon" />
                                                                                                    )}

                                                                                                    <span>{lessonIndex + 1}. {getLangText(lesson.title, userLanguage)}</span>

                                                                                                </a>
                                                                                            </div>

                                                                                            <div>
                                                                {(() => {
                                                                    const lId = String(lesson._id);
                                                                    return completedLessons.has(lId) ? (
                                                                        <span className="course-com-title">Completed</span>
                                                                    ) : lesson.duration ? (
                                                                        <span className="course-time-title">{lesson.duration}m</span>
                                                                    ) : null;
                                                                })()}
                                                            </div>



                                                                                        </div>

                                                                                        {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                                                            <div className=" mt-2">

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
                                                                                                                        toast.warning("Please first complete the video to unlock the quiz.");
                                                                                                                        return;
                                                                                                                    }

                                                                                                                    navigate(`/course/${course._id}/lesson/${lesson._id}/quiz/${quiz._id}`);

                                                                                                                }}
                                                                                                            >
                                                                                                                <MdQuiz className="file-icon me-2" />
                                                                                                                Quiz {quizIndex + 1} : {getLangText(quiz.title, userLanguage) || "Quiz"}
                                                                                                            </a>
                                                                                                        </div>

                                                                                                        <div>
                                                                                                            <span className="course-time-title">
                                                                                                                {lesson.quizzes?.length || 0} Questions
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
                                                                    Sort By: {sortReviewBy === 'newest' ? 'Newest' : sortReviewBy === 'oldest' ? 'Oldest' : sortReviewBy === 'highest' ? 'Highest Rating' : 'Lowest Rating'} <MdSort />
                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                                                    aria-labelledby="acticonMenu2"
                                                                >
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortReviewBy('newest'); }}>
                                                                            Newest
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortReviewBy('oldest'); }}>
                                                                            Oldest
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortReviewBy('highest'); }}>
                                                                            Highest Rating
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortReviewBy('lowest'); }}>
                                                                            Lowest Rating
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

                                                        {(() => {
                                                            let sortedReviews = [...reviews];
                                                            if (sortReviewBy === 'newest') {
                                                                sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                                                            } else if (sortReviewBy === 'oldest') {
                                                                sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                                                            } else if (sortReviewBy === 'highest') {
                                                                sortedReviews.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                                                            } else if (sortReviewBy === 'lowest') {
                                                                sortedReviews.sort((a, b) => (a.rating || 0) - (b.rating || 0));
                                                            }
                                                            const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, INITIAL_REVIEWS_COUNT);
                                                            
                                                            return displayedReviews.map((review) => {
                                                                const reviewer = review.userId;
                                                            const firstName = reviewer?.profile?.firstName || "";
                                                            const lastName = reviewer?.profile?.lastName || "";
                                                            const displayName = (firstName + " " + lastName).trim() || reviewer?.username || "User";
                                                            const profileImg = reviewer?.profile?.profileImage;
                                                            const avatarSrc = profileImg && !profileImg.includes("boy.png")
                                                                ? (profileImg.startsWith("http") ? profileImg : `${config.API_BASE_URL.replace("/api", "")}${profileImg}`)
                                                                : "/boy.png";

                                                            return (
                                                                <div className="udemy-review-box" key={review._id}>

                                                                    <div className="udemy-review-picture">
                                                                        <img
                                                                            src={avatarSrc}
                                                                            alt={displayName}
                                                                            onError={(e) => { e.target.src = "/boy.png"; }}
                                                                        />
                                                                    </div>

                                                                    <div className="udemy-review-content">

                                                                        <h5>{displayName}</h5>

                                                                        <h6>
                                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                                        </h6>

                                                                        <div className="cart-details-bx mb-2">

                                                                            <ul className="rating-list">

                                                                                {[...Array(review.rating)].map((_, i) => (
                                                                                    <li key={i} className="rating-item">
                                                                                        <span className="review-ration-btn"><IoIosStar /></span>
                                                                                    </li>
                                                                                ))}

                                                                            </ul>

                                                                        </div>

                                                                        <p>{review.comment}</p>

                                                                    </div>

                                                                </div>
                                                            );
                                                        })})()}

                                                        {reviews.length > INITIAL_REVIEWS_COUNT && (
                                                            <div className="text-center mt-2">
                                                                <button
                                                                    className="thm-btn outline"
                                                                    onClick={() => setShowAllReviews(prev => !prev)}
                                                                >
                                                                    {showAllReviews ? "Show Less" : `View More (${reviews.length - INITIAL_REVIEWS_COUNT} more)`}
                                                                </button>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>

                                            {/* Course FAQ Tab Pane */}
                                            <div
                                                className="tab-pane fade"
                                                id="faq-section"
                                                role="tabpanel"
                                            >
                                                <div className="col-lg-12 mb-3">
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <h3 className="first_para mb-0">Course FAQs</h3>
                                                    </div>

                                                    <div className="payment-tp-border">
                                                        {faqLoading ? (
                                                            <div className="text-center py-4">
                                                                <div className="spinner-border text-primary" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        ) : courseFAQs.length === 0 ? (
                                                            <p className="text-center py-4">No FAQs available for this course yet.</p>
                                                        ) : (
                                                            <div className="accordion udemy-faq-accordion" id="courseFaqAccordion">
                                                                {courseFAQs.map((faq, index) => (
                                                                    <div className="accordion-item border-0 mb-3 shadow-sm rounded overflow-hidden" key={faq._id}>
                                                                        <h2 className="accordion-header" id={`faqHeading${index}`}>
                                                                            <button 
                                                                                className={`accordion-button ${activeFaq === index ? '' : 'collapsed'} fw-bold py-3 px-4 bg-white text-dark`} 
                                                                                type="button" 
                                                                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                                                                style={{ boxShadow: 'none' }}
                                                                            >
                                                                                <span className="me-3 text-primary">Q.</span> {faq.question}
                                                                            </button>
                                                                        </h2>
                                                                        <div 
                                                                            id={`faqCollapse${index}`} 
                                                                            className={`accordion-collapse collapse ${activeFaq === index ? 'show' : ''}`} 
                                                                            aria-labelledby={`faqHeading${index}`}
                                                                        >
                                                                            <div className="accordion-body py-3 px-4 bg-light-subtle border-top">
                                                                                <div className="d-flex">
                                                                                    <span className="me-3 text-success fw-bold">A.</span>
                                                                                    <div className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                                                                                        {faq.answer}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
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
                                    <button
                                        className="thm-btn w-100"
                                        style={{
                                            cursor: 'pointer',
                                            zIndex: 10,
                                            position: 'relative'
                                        }}
                                        onClick={() => {
                                            if (!isPurchased && user?.role !== 'admin') {
                                                toast.info("First buy the course to access the video.");
                                                return;
                                            }
                                            const firstLesson = getFirstLesson();
                                            const targetState = firstLesson ? { state: { lessonId: firstLesson._id } } : {};
                                            navigate(`/video-player/${course._id}`, targetState);
                                        }}
                                    >
                                        Continue Learning
                                    </button>
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
                                    <form onSubmit={submitReview}>
                                        <div className="offer-modal-content">
                                            <span className="offer-modal-icon"> <MdRateReview /> </span>
                                            <h6 className="fz-24 fw-700">How was your learning experience? Share a quick review!</h6>

                                            <div className="cart-details-bx d-flex align-items-center justify-content-center">
                                                <ul className="rating-list">
                                                    {[1,2,3,4,5].map((star) => (
                                                        <li key={star} className="rating-item">
                                                            <a
                                                                href="#"
                                                                className="review-ration-btn fz-24"
                                                                onClick={(e) => { e.preventDefault(); setRating(star); }}
                                                            >
                                                                {star <= rating ? <IoIosStar /> : <IoIosStarOutline />}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="custom-frm-bx">
                                            <textarea
                                                className="form-control"
                                                style={{ height: "167px" }}
                                                placeholder="Write here Something(Optional)"
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="mt-4 text-center">
                                            <button
                                                type="submit"
                                                className="thm-btn px-5"
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
