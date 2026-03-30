import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getBackendBaseUrl } from "../../config/backendConfig";
import config from "../../config/config";
import { getCourseById, getCourseReviews, getDashboardData, syncCartWithPurchases, getCachedCourseById } from "../../services/apiService";
import { getLangText } from "../../utils/languageUtils";

import { MdWork } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { IoSpeedometer } from "react-icons/io5";
import { IoLanguage } from "react-icons/io5";
import { PiCertificateFill } from "react-icons/pi";
import { MdQuiz, MdSort } from "react-icons/md";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { BsTelegram } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import { faVideo, faClose, faLock, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoIosStar } from "react-icons/io";
import { IoIosStarOutline } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { PiCardsThreeFill } from "react-icons/pi";
import { MdDesktopWindows } from "react-icons/md";
import { IoMdVideocam } from "react-icons/io";

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

function CourseDetailsContentSecond({ course: propCourse }) {
    const [isReview, setIsReview] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const itemsPerPage = 6;
    const navigate = useNavigate();


    // 🎯 Reviews State
    const [reviews, setReviews] = useState([]);
    const [courseFAQs, setCourseFAQs] = useState([]);
    const [faqLoading, setFaqLoading] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [sortReviewBy, setSortReviewBy] = useState('newest');
    const [activeFaq, setActiveFaq] = useState(null);

    // 🎯 Get course ID from URL
    const { id } = useParams();

    // 🎯 Check if we're in learning mode
    const isLearnMode = location.pathname.includes('/learn');

    // 🎯 Auth Context
    const { user } = useAuth();
    const userLanguage = user?.profile?.language || 'English';
    const isLoggedIn = !!user;

    // 🎯 Check if user is enrolled in this course
    const isEnrolled = course?.enrolledStudents?.some(
        id => id.toString() === user?._id
    );

    // 🎯 Check if user has purchased this course (Always false here since CourseGuard prevents purchased users from seeing this)
    const isPurchased = false;

    const openLoginModal = () => {
        const el = document.getElementById("loginModal");
        if(el) {
            const modal = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
            modal.show();
        }
    };


    const handleQuizClick = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentLesson(null);
        setShowVideo(false);
    };

    const isYouTube = (url) => {
        if (!url) return false;
        return url.includes("youtube.com") || url.includes("youtu.be");
    };

    // 🎯 Fetch Course FAQs
    useEffect(() => {
        const fetchCourseFAQs = async () => {
            const courseId = course?._id || id;
            if (!courseId) return;
            try {
                setFaqLoading(true);
                const response = await fetch(`${config.API_BASE_URL}/questions/course/${courseId}`);
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
    }, [course?._id, id]);

    // Extract video ID from YouTube URL
    const extractVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    // Toggle section expansion
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Handle lesson click
    const handleLessonClick = (lesson) => {
        if (!isPurchased && user?.role !== 'admin') {
            toast.info("First buy the course to access the video.");
            return;
        }
        
        const targetState = lesson ? { state: { lessonId: lesson._id } } : {};
        navigate(`/course/${course._id}/learn`, targetState);
    };


    // Calculate total lessons from sections
    const getTotalLessons = () => {
        if (!course?.sections) return 0;
        return course.sections.reduce((total, section) => total + (section.lessons?.length || 0), 0);
    };

    const getTotalQuizzes = () => {
        if (!course?.sections) return 0;
        return course.sections.reduce((total, section) => {
            return total + (section.lessons?.reduce((lessonTotal, lesson) => {
                return lessonTotal + (lesson.quizzes?.length || 0);
            }, 0) || 0);
        }, 0);
    };

    // Get all lessons for pagination
    const getAllLessonsForPagination = () => {
        if (!course?.sections) return [];
        return course.sections.flatMap(section => section.lessons || []);
    };

    const getFirstLesson = () => {
        const allLessons = getAllLessonsForPagination();
        return allLessons.length > 0 ? allLessons[0] : null;
    };

    // Get paginated lessons
    const getPaginatedLessons = () => {
        const allLessons = getAllLessonsForPagination();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allLessons.slice(startIndex, endIndex);
    };

    // Calculate total pages
    const getTotalPages = () => {
        const allLessons = getAllLessonsForPagination();
        return Math.ceil(allLessons.length / itemsPerPage);
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Calculate total duration from sections
    const getTotalDuration = () => {
        if (!course?.sections) return course.duration || '21h';
        const totalMinutes = course.sections.reduce((total, section) => {
            return total + (section.lessons?.reduce((lessonTotal, lesson) => lessonTotal + (lesson.duration || 0), 0) || 0);
        }, 0);
        return totalMinutes > 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes}m`;
    };

    // 🎯 Add to Cart Function
    const addToCart = () => {
        if (!course) return;

        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

        const isAlreadyInCart = existingCart.some(item => item._id === course._id);

        if (isAlreadyInCart) {
            navigate('/add-cart');
            return;
        }

        const courseForCart = {
            _id: course._id,
            title: getLangText(course.title, userLanguage),
            price: course.discountedPrice || course.price,
            thumbnail: course.thumbnail || course.courseImage,
            instructor: course.instructor || 'Instructor',
            duration: getTotalDuration(),
            lessons: getTotalLessons(),
            addedAt: new Date().toISOString()
        };

        const updatedCart = [...existingCart, courseForCart];

        localStorage.setItem('cart', JSON.stringify(updatedCart));

        window.dispatchEvent(new Event("cartUpdated")); // ⭐ important

        navigate('/add-cart');
    };
    const addToWishlist = async () => {
        try {
            setWishlistLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Please login first");
                return;
            }

            const backendUrl = getBackendBaseUrl();

            const res = await fetch(`${backendUrl}/api/users/wishlist/${course._id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Course added to wishlist successfully");
            } else {
                toast.error(data.message || "Failed to add wishlist");
            }

        } catch (error) {
            console.error("Wishlist error:", error);
            toast.error("Failed to add wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    // 🎯 Handle course purchase
    const handleBuyCourse = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to purchase this course");
                navigate("/");
                return;
            }

            const courseId = course._id;
            if (!courseId) {
                toast.error("Course ID not found");
                return;
            }

            console.log('🔍 Purchasing course:', courseId);

            const res = await fetch(`${getBackendBaseUrl()}/api/purchase/${courseId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            console.log('🔍 Purchase response:', data);

            if (data.success) {
                toast.success("Course purchased successfully!");
                setIsPurchased(true);
                // Clear purchase cache for this course
                sessionStorage.removeItem(`purchase_${courseId}`);
                navigate(`/course/${courseId}/learn`);
            } else {
                toast.error(data.message || "Failed to purchase course");
            }
        } catch (error) {
            console.error("❌ Purchase error:", error);
            toast.error("Failed to purchase course. Please try again.");
        }
    };

    // 🎯 Fetch Reviews API Call
    useEffect(() => {
        const fetchReviews = async () => {
            if (!course?._id) return;

            try {
                setReviewsLoading(true);
                const res = await getCourseReviews(course._id, false);
                if (res.success) {
                    setReviews(res.data);
                }
            } catch (error) {
                console.log("Error fetching reviews:", error);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [course]);

    // 🎯 Fetch course data
    useEffect(() => {
        // use prop or navigation state if available
        if (propCourse || location.state?.course) {
            const initial = propCourse || location.state.course;
            setCourse(initial);
            setLoading(false);

            if (initial.sections?.length > 0) {
                const firstLesson = initial.sections[0].lessons?.[0];
                if (firstLesson) {
                    setCurrentLesson(firstLesson);
                    // setShowVideo(true); // ❌ Remove auto-play
                }
            }
            return;
        }

        // Otherwise fetch from API
        const fetchCourse = async () => {
            try {
                // Instant cache check
                const cached = getCachedCourseById(id);
                if (cached && cached.data) {
                    setCourse(cached.data);
                    setLoading(false);
                    console.log("⚡ CourseDetails: Instant cache hit upon mount");
                } else if (!course) {
                    setLoading(true);
                }

                console.log("🔍 Fetching course id via apiService:", id);

                const response = await getCourseById(id, false);

                if (response.success && response.data) {
                    const courseData = response.data.data || response.data; // Handle potential nesting
                    setCourse(courseData);
                    console.log("✅ Course loaded successfully:", courseData.title, response.fromCache ? "(from cache)" : "");

                    if (courseData.sections?.length > 0) {
                        const firstLesson = courseData.sections[0].lessons?.[0];
                        if (firstLesson) {
                            setCurrentLesson(firstLesson);
                        }
                    }
                } else {
                    console.error("❌ Course fetch failed:", response.error);
                }
            } catch (error) {
                console.error("❌ Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        } else {
            console.error("❌ No course ID provided");
            setLoading(false);
        }
    }, [id, propCourse]);

    // 🎯 Loading state
    if (loading && !course) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h3>Loading Course Details...</h3>
                    <p className="text-muted">Please wait while we fetch the course information.</p>
                </div>
            </div>
        );
    }

    // 🎯 Course not found
    if (!course) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h3>Course Not Found</h3>
                    <p className="text-muted">The course you're looking for doesn't exist.</p>
                    <NavLink to="/courses" className="btn btn-primary">Browse Courses</NavLink>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header Section */}
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">Courses Details</h3>
                                    <div className="admin-breadcrumb mt-2">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb justify-content-center">

                                                <li className="breadcrumb-item">
                                                    <NavLink to="/" className="breadcrumb-link">
                                                        Home
                                                    </NavLink>
                                                </li>

                                                <li className="breadcrumb-item">
                                                    <NavLink to="/available-courses" className="breadcrumb-link">
                                                        Courses
                                                    </NavLink>
                                                </li>

                                                <li className="breadcrumb-item active" aria-current="page">
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

            {/* Course Content Section */}
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
                                                {showVideo && currentLesson?.videoUrl && (
                                                    <>
                                                        {isYouTube(currentLesson.videoUrl) ? (
                                                            <iframe
                                                                width="100%"
                                                                height="400"
                                                                src={`https://www.youtube.com/embed/${extractVideoId(currentLesson.videoUrl)}?rel=0`}
                                                                title="Course Video"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />

                                                        ) : (
                                                            <video
                                                                controls
                                                                style={{
                                                                    width: "100%",
                                                                    height: "400px",
                                                                    borderRadius: "12px"
                                                                }}
                                                            >
                                                                <source
                                                                    src={currentLesson.videoUrl.startsWith('http')
                                                                        ? currentLesson.videoUrl
                                                                        : `${config.API_BASE_URL.replace('/api', '')}/${currentLesson.videoUrl.replace(/\\/g, '/')}`.replace(/\/+/g, '/').replace(':/', '://')}
                                                                    type="video/mp4"
                                                                />
                                                            </video>
                                                        )}
                                                    </>
                                                )}

                                                <div className="text-center mt-3">

                                                </div>
                                            </div>
                                        )}

                                        <div className="udemy-content-video">

                                            <div className="d-flex justify-content-between align-items-center">

                                                <h5 className="mb-0">
                                                    {getLangText(course?.title, userLanguage) || "Course Title"}
                                                </h5>

                                                <button
                                                    className="thm-btn outline btn-sm"
                                                    onClick={() => {
                                                        if (!isLoggedIn) {
                                                            openLoginModal();
                                                            return;
                                                        }
                                                        addToWishlist();
                                                    }}
                                                    disabled={wishlistLoading}
                                                >
                                                    {wishlistLoading ? "Adding..." : "Add to Wishlist"}
                                                </button>

                                            </div>

                                            <p className="mt-1">
                                                Posted {course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : ""}
                                            </p>

                                        </div>
                                    </div>

                                    {/* Course Tabs */}
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

                                        {/* Tab Content */}
                                        <div className="employee-tabs payment-tp-border">
                                            <div className="tab-content" id="myTabContent">
                                                {/* Description Tab */}
                                                <div
                                                    className="tab-pane fade show active"
                                                    id="home"
                                                    role="tabpanel"
                                                >
                                                    <div className="udemy-description">
                                                        <h6 className="first_para">Descriptions</h6>
                                                        <p className="course-desc" style={{ whiteSpace: 'pre-line' }}>
                                                            {getLangText(course?.description, userLanguage) || 'No description provided.'}
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

                                                    {/* About Job Section */}
                                                    <div className="about-job-box">
                                                        <h6 className="first_para">About the job</h6>
                                                        <div className="bid-job-main-box">
                                                            <div className="bid-grid-box">
                                                                <span className="bid-about-icon">
                                                                    <IoSpeedometer />
                                                                </span>
                                                                <div className="bid-about-content">
                                                                    <p>Course Level</p>
                                                                    <h6 style={{ textTransform: 'capitalize' }}>{course?.level || 'Beginner'}</h6>
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
                                                                    <h6>{getLangText(course?.language, userLanguage) || 'English'}</h6>
                                                                </div>
                                                            </div>
                                                            <div className="bid-grid-box">
                                                                <span className="bid-about-icon">
                                                                    <MdWork />
                                                                </span>
                                                                <div className="bid-about-content">
                                                                    <p>Lessons</p>
                                                                    <h6>{getTotalLessons()}</h6>
                                                                </div>
                                                            </div>
                                                            <div className="bid-grid-box">
                                                                <span className="bid-about-icon">
                                                                    <MdQuiz />
                                                                </span>
                                                                <div className="bid-about-content">
                                                                    <p>Quizzes</p>
                                                                    <h6>{getTotalQuizzes()}</h6>
                                                                </div>
                                                            </div>
                                                            <div className="bid-grid-box">
                                                                <span className="bid-about-icon">
                                                                    <PiCertificateFill />
                                                                </span>
                                                                <div className="bid-about-content">
                                                                    <p>Certificate</p>
                                                                    <h6>Yes</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="payment-tp-border"></div>

                                                    {/* Share Section */}
                                                    <div className="bid-share-box">
                                                        <ul className="bid-share-list">
                                                            <li>
                                                                <span className="first_para fz-20 fw-700">
                                                                    Share :
                                                                </span>
                                                            </li>
                                                            <li className="bid-share-item">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => e.preventDefault()}
                                                                    className="bid-share-nav"
                                                                >
                                                                    <FaFacebookF />
                                                                </a>
                                                            </li>
                                                            <li className="bid-share-item">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => e.preventDefault()}
                                                                    className="bid-share-nav"
                                                                >
                                                                    <FaLinkedinIn />
                                                                </a>
                                                            </li>
                                                            <li className="bid-share-item">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => e.preventDefault()}
                                                                    className="bid-share-nav"
                                                                >
                                                                    <FaWhatsapp />
                                                                </a>
                                                            </li>
                                                            <li className="bid-share-item">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => e.preventDefault()}
                                                                    className="bid-share-nav"
                                                                >
                                                                    <BsTelegram />
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Course Curriculum Tab */}
                                                <div
                                                    className="tab-pane fade"
                                                    id="profile"
                                                    role="tabpanel"
                                                >
                                                    <div className="col-lg-12">
                                                        <div className="accordion custom-accordion" id="customAccordion">
                                                            {isLearnMode ? (
                                                                // Learning mode with pagination - show 6 lessons per page
                                                                <>
                                                                    {getPaginatedLessons().map((lesson, index) => {
                                                                        const globalIndex = (currentPage - 1) * itemsPerPage + index;
                                                                        return (
                                                                            <div key={lesson._id || globalIndex}>

                                                                                <div className="quiz-card mb-3">
                                                                                    <div>
                                                                                        <a href="#" onClick={(e) => {
                                                                                            e.preventDefault();

                                                                                            if (!isPurchased && user?.role !== 'admin') {
                                                                                                 toast.info("first buy the course to access video");
                                                                                                return; // locked
                                                                                            }

                                                                                            if (!isLearnMode) {
                                                                                                navigate(`/course/${course._id}/learn`);
                                                                                                return;
                                                                                            }

                                                                                            if (lesson.videoUrl) {
                                                                                                handleLessonClick(lesson);
                                                                                            }
                                                                                        }} className="quiz-title">
                                                                                            {isPurchased && isLearnMode ? (
                                                                                                <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                                                            ) : (
                                                                                                <FontAwesomeIcon icon={faLock} className="file-icon" />
                                                                                            )}
                                                                                            <span>{globalIndex + 1}. {getLangText(lesson.title, userLanguage)}</span>
                                                                                        </a>
                                                                                    </div>

                                                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                                                        <span className="course-com-title">
                                                                                            {lesson.duration ? `${lesson.duration} min` : 'Video'}
                                                                                        </span>
                                                                                        {lesson.isPreview && (
                                                                                            <span className="badge bg-success">Preview</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                                                    <div className="mt-2">

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

                                                                                                            if (!isPurchased && user?.role !== 'admin') {
                                                                                                                 toast.info("first buy the course to access video");
                                                                                                                 return;
                                                                                                             }

                                                                                                            // ❌ quiz only allowed in learning page
                                                                                                            if (!isLearnMode) {
                                                                                                                navigate(`/course/${course._id}/learn`);
                                                                                                                return;
                                                                                                            }

                                                                                                            const cId = course?._id || course?.id;
                                                                                                            const lId = lesson?._id || lesson?.id;
                                                                                                            const qId = quiz?._id || quiz?.id;

                                                                                                            if (!cId || !lId || !qId) return;

                                                                                                            navigate(`/course/${cId}/lesson/${lId}/quiz/${qId}`);
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
                                                                        );
                                                                    })}

                                                                    {/* Pagination Controls */}
                                                                    {getTotalPages() > 1 && (
                                                                        <div className="d-flex justify-content-center mt-4">
                                                                            <nav>
                                                                                <ul className="pagination">
                                                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                                        <button
                                                                                            className="page-link"
                                                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                                                            disabled={currentPage === 1}
                                                                                        >
                                                                                            Previous
                                                                                        </button>
                                                                                    </li>
                                                                                    {[...Array(getTotalPages())].map((_, index) => (
                                                                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                                                            <button
                                                                                                className="page-link"
                                                                                                onClick={() => handlePageChange(index + 1)}
                                                                                            >
                                                                                                {index + 1}
                                                                                            </button>
                                                                                        </li>
                                                                                    ))}
                                                                                    <li className={`page-item ${currentPage === getTotalPages() ? 'disabled' : ''}`}>
                                                                                        <button
                                                                                            className="page-link"
                                                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                                                            disabled={currentPage === getTotalPages()}
                                                                                        >
                                                                                            Next
                                                                                        </button>
                                                                                    </li>
                                                                                </ul>
                                                                            </nav>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (

                                                                <>
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
                                                                                                <b>{sectionIndex + 1}. {getLangText(section.title, userLanguage) || `Section ${sectionIndex + 1}`}</b>
                                                                                             {!isPurchased && (
                                                                                                 <a href="#" className="preview-btn ms-2">
                                                                                                     <FontAwesomeIcon icon={faLock} />
                                                                                                 </a>
                                                                                             )}
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
                                                                                                // Handle download logic here
                                                                                                console.log("Download clicked");
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

                                                                                                    <div className="quiz-card mb-3">

                                                                                                        <div>
                                                                                                            <a
                                                                                                                href="#"
                                                                                                                onClick={(e) => {
                                                                                                                    e.preventDefault();

                                                                                                                    if (!isPurchased && user?.role !== 'admin') {
                                                                                                 toast.info("first buy the course to access video");
                                                                                                                        return; // locked
                                                                                                                    }

                                                                                                                    if (!isLearnMode) {
                                                                                                                        navigate(`/course/${course._id}/learn`);
                                                                                                                        return;
                                                                                                                    }

                                                                                                                    if (lesson.videoUrl) {
                                                                                                                        handleLessonClick(lesson);
                                                                                                                    }
                                                                                                                }}
                                                                                                                className="quiz-title"
                                                                                                            >
                                                                                                                {isPurchased && isLearnMode ? (
                                                                                                                    <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                                                                                ) : (
                                                                                                                    <FontAwesomeIcon icon={faLock} className="file-icon" />
                                                                                                                )}
                                                                                                                <span>{getLangText(lesson.title, userLanguage)}</span>

                                                                                                            </a>
                                                                                                        </div>

                                                                                                        <div className="">
                                                                                                            <span className="course-time-title">
                                                                                                                {lesson.duration ? `${lesson.duration} min` : "Video"}
                                                                                                            </span>

                                                                                                            {/* {lesson.isPreview && (
<span className="badge bg-success ms-2">Preview</span>
)} */}
                                                                                                        </div>

                                                                                                    </div>

                                                                                                    {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                                                                        <div className="mt-2">

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

                                                                                                                                if (!isPurchased && user?.role !== 'admin') {
                                                                                                                 toast.info("first buy the course to access video");
                                                                                                                 return;
                                                                                                             }

                                                                                                                                // ❌ quiz only allowed in learning page
                                                                                                                                if (!isLearnMode) {
                                                                                                                                    navigate(`/course/${course._id}/learn`);
                                                                                                                                    return;
                                                                                                                                }

                                                                                                                                const cId = course?._id || course?.id;
                                                                                                                                const lId = lesson?._id || lesson?.id;
                                                                                                                                const qId = quiz?._id || quiz?.id;

                                                                                                                                if (!cId || !lId || !qId) return;

                                                                                                                                navigate(`/course/${cId}/lesson/${lId}/quiz/${qId}`);
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            <MdQuiz className="file-icon me-2" />
                                                                                                                            Quiz {quizIndex + 1} : {getLangText(quiz.question, userLanguage) || "Quiz"}
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
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Review Tab */}
                                                <div
                                                    className="tab-pane fade"
                                                    id="review"
                                                    role="tabpanel"
                                                >
                                                    <div className="col-lg-12">
                                                        <div className="d-flex align-items-center justify-content-between mb-3 mt-2">
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

                                                        {reviewsLoading ? (
                                                            <p>Loading reviews...</p>
                                                        ) : reviews.length === 0 ? (
                                                            <p className="text-muted">No reviews yet.</p>
                                                        ) : (
                                                            (() => {
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
                                                                
                                                                return sortedReviews.map((review, index) => {
                                                                    const reviewer = review.userId;
                                                                const firstName = reviewer?.profile?.firstName || "";
                                                                const lastName = reviewer?.profile?.lastName || "";
                                                                const displayName = (firstName + " " + lastName).trim() || reviewer?.username || "Anonymous";
                                                                const profileImg = reviewer?.profile?.profileImage;
                                                                const avatarSrc = profileImg && !profileImg.includes("boy.png")
                                                                    ? (profileImg.startsWith("http") ? profileImg : `${getBackendBaseUrl()}${profileImg}`)
                                                                    : "/boy.png";

                                                                return (
                                                                    <div className="quiz-card mb-3" key={index}>
                                                                        <div className="cart-details-bx mb-2">
                                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                                <img
                                                                                    src={avatarSrc}
                                                                                    alt={displayName}
                                                                                    onError={(e) => { e.target.src = "/boy.png"; }}
                                                                                    style={{
                                                                                        width: "40px",
                                                                                        height: "40px",
                                                                                        borderRadius: "50%",
                                                                                        objectFit: "cover",
                                                                                        border: "2px solid #eee"
                                                                                    }}
                                                                                />
                                                                                <div>
                                                                                    <h5 className="mb-0">{displayName}</h5>
                                                                                    <h6 className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>{reviewer?.profile?.phone || ""}</h6>
                                                                                </div>
                                                                            </div>

                                                                            <ul className="rating-list">
                                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                                    <li key={star} className="rating-item">
                                                                                        {star <= review.rating ? (
                                                                                            <IoIosStar />
                                                                                        ) : (
                                                                                            <IoIosStarOutline />
                                                                                        )}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>

                                                                            <p className="mt-2">
                                                                                {review.comment}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            });
                                                        })()
                                                        )}

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
                                                                            <h2 className="accordion-header" id={`faqHeadingSecond${index}`}>
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
                                                                                id={`faqCollapseSecond${index}`} 
                                                                                className={`accordion-collapse collapse ${activeFaq === index ? 'show' : ''}`} 
                                                                                aria-labelledby={`faqHeadingSecond${index}`}
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
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4">
                            <div className="course-card mb-3">
                                <div className="udemy-price-box mb-3">
                                    <h4 className="course-price">
                                        ${course?.discountedPrice || course?.price || "24.92"}
                                    </h4>
                                </div>

                                <div className="purchase-box">
                                    <button
                                        className="thm-btn w-100 btn-lg btn-success fw-bold py-3 px-5"
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                openLoginModal();
                                                return;
                                            }
                                            navigate(`/buy/${course._id}`);
                                        }}
                                    >
                                        Buy Now
                                    </button>

                                    <div className="d-flex align-items gap-3 mt-3">
                                        <button
                                            className="thm-btn w-100 outline"
                                            onClick={() => {
                                                if (!isLoggedIn) {
                                                    openLoginModal();
                                                    return;
                                                }
                                                addToCart();
                                            }}
                                        >
                                            Add to Cart
                                        </button>

                                        <button
                                            className="thm-btn w-100 outline"
                                            onClick={() => {
                                                if (!isLoggedIn) {
                                                    openLoginModal();
                                                    return;
                                                }
                                                addToWishlist();
                                            }}
                                            disabled={wishlistLoading}
                                        >
                                            {wishlistLoading ? "Adding..." : "Add to Wishlist"}
                                        </button>
                                    </div>
                                </div>

                                <div className="udemy-all-box mt-4">
                                    <ul className="udemy-all-list">
                                        <li className="udemy-course-item">
                                            <span><PiCardsThreeFill className="udemy-list-icon" /></span>
                                            {course?.sections?.length || 0} Section
                                        </li>
                                        <li className="udemy-course-item">
                                            <span><MdDesktopWindows className="udemy-list-icon" /></span>
                                            {getTotalLessons()} Lecture
                                        </li>
                                        <li className="udemy-course-item">
                                            <span><IoMdVideocam className="udemy-list-icon" /></span>
                                            {getTotalDuration()} Video length
                                        </li>
                                        <li className="udemy-course-item">
                                            <span><IoLanguage className="udemy-list-icon" /></span>
                                            {course?.language || "English"}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="course-master-card">
                                <div className="webinar-content">
                                    <span className="webinar-title">WEBINAR</span>
                                    <h6>Ana Kursova</h6>
                                    <h3>Masterclass in Design Thinking, Innovation & Creativity</h3>
                                    <div>
                                        <a href="#" className="course-more-btn">Learn More</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* Review Modal */}
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
                                <div className="col-md-12">
                                    <h5 className="text-center">Review Submitted Successfully</h5>
                                    <p>Your review has been submitted successfully.</p>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3">
                            <button className="thm-btn px-5" data-bs-dismiss="modal" aria-label="Close">Ok</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CourseDetailsContentSecond;
