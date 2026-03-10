import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getBackendBaseUrl } from "../../config/backendConfig";

import { MdWork } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { IoSpeedometer } from "react-icons/io5";
import { IoLanguage } from "react-icons/io5";
import { PiCertificateFill } from "react-icons/pi";
import { MdQuiz } from "react-icons/md";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { BsTelegram } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import { faVideo, faClose, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoIosStar } from "react-icons/io";
import { IoIosStarOutline } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { PiCardsThreeFill } from "react-icons/pi";
import { MdDesktopWindows } from "react-icons/md";
import { IoMdVideocam } from "react-icons/io";

function CourseDetailsContentSecond({ course: propCourse }) {
    const [isReview, setIsReview] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const location = useLocation();
    const [course, setCourse] = useState(location.state?.course || null);
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
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // 🎯 Get course ID from URL
    const { id } = useParams();

    // 🎯 Check if we're in learning mode
    const isLearnMode = location.pathname.includes('/learn');

    // 🎯 Auth Context
    const { user } = useAuth();
    const isLoggedIn = !!user;

    // 🎯 Check if user is enrolled in this course
    const isEnrolled = course?.enrolledStudents?.some(
        id => id.toString() === user?._id
    );

    // 🎯 Check if user has purchased this course
    const [isPurchased, setIsPurchased] = useState(false);
    // default to true so redirect guard doesn't run before we start checking
    const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);

    // ❌ Remove automatic redirect - let user click manually
    // useEffect(() => {
    //     if (isPurchased && course?._id) {
    //         console.log("✅ Course already purchased → redirecting to learn page");
    //         navigate(`/course/${course._id}/learn`);
    //     }
    // }, [isPurchased, course]);

    useEffect(() => {
        // don't run until we have a valid course loaded
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

                // ⚡ Optimized dashboard API with caching
                // Check cache first for purchase status
                // const purchaseCacheKey = `purchase_${course._id}`;
                // const cachedPurchaseStatus = sessionStorage.getItem(purchaseCacheKey);

                // if (cachedPurchaseStatus !== null) {
                //     setIsPurchased(JSON.parse(cachedPurchaseStatus));
                //     setIsCheckingPurchase(false);
                //     return;
                // }

                // Only fetch dashboard if not cached
                const res = await fetch(
                    `${getBackendBaseUrl()}/api/users/dashboard`,
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
                    // sessionStorage.setItem(purchaseCacheKey, JSON.stringify(purchased));
                } else {
                    setIsPurchased(false);
                    // sessionStorage.setItem(purchaseCacheKey, JSON.stringify(false));
                }
            } catch (error) {
                console.log('Error checking purchase status:', error);
                setIsPurchased(false);
            } finally {
                setIsCheckingPurchase(false);
            }
        };

        checkPurchaseStatus();
    }, [course]);


    // 🎯 Handle quiz click
    const handleQuizClick = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentLesson(null);
        setShowVideo(false);
    };

    // YouTube URL Check Function
    const isYouTube = (url) => {
        if (!url) return false;
        return url.includes("youtube.com") || url.includes("youtu.be");
    };

    // Extract video ID from YouTube URL
    const extractVideoId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
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
        setCurrentLesson(lesson);
        setCurrentQuiz(null);
        setShowVideo(true);
    };


    // Calculate total lessons from sections
    const getTotalLessons = () => {
        if (!course?.sections) return 0;
        return course.sections.reduce((total, section) => total + (section.lessons?.length || 0), 0);
    };

    // Get all lessons for pagination
    const getAllLessonsForPagination = () => {
        if (!course?.sections) return [];
        return course.sections.flatMap(section => section.lessons || []);
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

        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

        // Check if course is already in cart
        const isAlreadyInCart = existingCart.some(item => item._id === course._id);

        if (isAlreadyInCart) {
            navigate('/add-cart');
            return;
        }

        // Create course object for cart
        const courseForCart = {
            _id: course._id,
            title: course.title,
            price: course.discountedPrice || course.price,
            thumbnail: course.thumbnail || course.courseImage,
            instructor: course.instructor || 'Instructor',
            duration: getTotalDuration(),
            lessons: getTotalLessons(),
            addedAt: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify([...existingCart, courseForCart]));

        // Navigate to cart page
        navigate('/add-cart');
    };
    const addToWishlist = async () => {
        try {
            setWishlistLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first");
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
                alert("Course added to wishlist successfully");
            } else {
                alert(data.message || "Failed to add wishlist");
            }

        } catch (error) {
            console.error("Wishlist error:", error);
            alert("Failed to add wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    // 🎯 Handle course purchase
    const handleBuyCourse = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login to purchase this course");
                navigate("/");
                return;
            }

            const courseId = course._id;
            if (!courseId) {
                alert("Course ID not found");
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
                alert("Course purchased successfully!");
                setIsPurchased(true);
                // Clear purchase cache for this course
                sessionStorage.removeItem(`purchase_${courseId}`);
                navigate(`/course/${courseId}/learn`);
            } else {
                alert(data.message || "Failed to purchase course");
            }
        } catch (error) {
            console.error("❌ Purchase error:", error);
            alert("Failed to purchase course. Please try again.");
        }
    };

    // 🎯 Fetch Reviews API Call
    useEffect(() => {
        const fetchReviews = async () => {
            if (!course?._id) return;

            try {
                setReviewsLoading(true);

                const res = await fetch(
                    `${getBackendBaseUrl()}/api/reviews/${course._id}` 
                );

                const data = await res.json();

                if (data.success) {
                    setReviews(data.data);
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
                    setShowVideo(true);
                }
            }
            return;
        }

        // Otherwise fetch from API
        const fetchCourse = async () => {
            try {
                setLoading(true);
                console.log("🔍 Fetching course id:", id);

                // ⚡ Check cache first
                const cacheKey = `course_${id}`;
                const cachedCourse = sessionStorage.getItem(cacheKey);
                if (cachedCourse) {
                    const parsedCourse = JSON.parse(cachedCourse);
                    console.log("✅ Course loaded from cache:", parsedCourse.title);
                    setCourse(parsedCourse);

                    // Auto-select first lesson for learning mode
                    if (parsedCourse.sections?.length > 0) {
                        const firstLesson = parsedCourse.sections[0].lessons?.[0];
                        if (firstLesson) {
                            setCurrentLesson(firstLesson);
                            setShowVideo(true);
                        }
                    }
                    setLoading(false);
                    return;
                }

                const backendUrl = getBackendBaseUrl();
                console.log("🔍 API URL:", `${backendUrl}/api/public/courses/${id}`);

                const res = await fetch(`${backendUrl}/api/public/courses/${id}`);
                console.log("🔍 Response status:", res.status);

                const data = await res.json();
                console.log("🔍 API response:", data);

                if (data.success) {
                    setCourse(data.data);
                    // ⚡ Cache the course data
                    sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
                    console.log("✅ Course loaded successfully:", data.data.title);

                    // Auto-select first lesson for learning mode
                    if (data.data.sections?.length > 0) {
                        const firstLesson = data.data.sections[0].lessons?.[0];
                        if (firstLesson) {
                            setCurrentLesson(firstLesson);
                            setShowVideo(true);
                        }
                    }
                } else {
                    console.error("❌ API returned failure:", data.message);

                    // Try fallback
                    try {
                        console.log("🔄 Fetching all courses to check if course exists...");
                        const coursesRes = await fetch(`${backendUrl}/api/public/courses`);
                        const coursesData = await coursesRes.json();

                        if (coursesData.success) {
                            const courseExists = coursesData.data.some(c => c._id === id);
                            console.log("🔍 Does course", id, "exist in all courses?", courseExists);

                            if (courseExists) {
                                const foundCourse = coursesData.data.find(c => c._id === id);
                                console.log("🔍 Using fallback data for course:", id);
                                setCourse(foundCourse);
                                // ⚡ Cache fallback data too
                                sessionStorage.setItem(cacheKey, JSON.stringify(foundCourse));
                                console.log("✅ Course loaded via fallback:", foundCourse.title);
                            } else {
                                console.log("❌ Requested course not found in list");
                                const firstCourse = coursesData.data[0];
                                window.location.href = `/course/${firstCourse._id}`;
                            }
                        }
                    } catch (fallbackError) {
                        console.error("❌ Could not fetch available courses:", fallbackError);
                    }
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
    if (loading) {
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
                                    <h3 className="lg_title text-center mb-2">Course Details</h3>
                                    <p className="text-center text-muted">Course information and enrollment</p>
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
                                                onClick={() => setShowVideo(true)}
                                                style={{
                                                    position: "relative",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <img
                                                    src={course?.thumbnail || course?.courseImage || "/course_banner.png"}
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
                                                                src={`https://www.youtube.com/embed/${extractVideoId(currentLesson.videoUrl)}`}
                                                                title="Course Video"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            ></iframe>
                                                        ) : (
                                                            <video
                                                                controls
                                                                style={{
                                                                    width: "100%",
                                                                    height: "400px",
                                                                    borderRadius: "12px"
                                                                }}
                                                            >
                                                                <source src={currentLesson.videoUrl} type="video/mp4" />
                                                            </video>
                                                        )}
                                                    </>
                                                )}

                                                <div className="text-center mt-3">
                                                    <button
                                                        onClick={() => setShowVideo(false)}
                                                        className="btn btn-outline-secondary btn-sm"
                                                    >
                                                        <i className="fas fa-times me-1"></i>
                                                        Close Video
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="udemy-content-video">
                                            <h5>{course?.title || "Course Title"}</h5>
                                            <p>Posted {course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : ""}</p>
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
                                                        <p>
                                                            This video introduces the key concepts covered in
                                                            this lesson and explains them in a simple,
                                                            easy-to-understand way. It helps you understand how
                                                            topic connects to real-life examples and
                                                            prepares you for quiz at the end of the lesson.
                                                            Watch the full video to complete this lesson and
                                                            continue your learning progress.
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
                                                        </ul>
                                                    </div>

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
                                                                    <h6>Expert</h6>
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
                                                                    <h6>English</h6>
                                                                </div>
                                                            </div>
                                                            <div className="bid-grid-box">
                                                                <span className="bid-about-icon">
                                                                    <MdWork />
                                                                </span>
                                                                <div className="bid-about-content">
                                                                    <p>Lessons</p>
                                                                    <h6>{course?.lessons?.length || 153}</h6>
                                                                </div>
                                                            </div>
                                                            <div className="bid-grid-box">
                                                                <span className="bid-about-icon">
                                                                    <MdQuiz />
                                                                </span>
                                                                <div className="bid-about-content">
                                                                    <p>Quizzes</p>
                                                                    <h6>5</h6>
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

                                                                                            if (!isPurchased) {
                                                                                                return; // locked
                                                                                            }

                                                                                            if (!isLearnMode) {
                                                                                                navigate(`/course/${course._id}/learn`);
                                                                                                return;
                                                                                            }

                                                                                            if (lesson.videoUrl) {
                                                                                                setCurrentLesson(lesson);
                                                                                                setShowVideo(true);
                                                                                            }
                                                                                        }} className="quiz-title">
                                                                                            {isPurchased && isLearnMode ? (
                                                                                                <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                                                            ) : (
                                                                                                <FontAwesomeIcon icon={faLock} className="file-icon" />
                                                                                            )}
                                                                                            <span>{globalIndex + 1}. {lesson.title}</span>
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

if (!isPurchased) return;

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
                                                                                                <b>{sectionIndex + 1}. {section.title || `Section ${sectionIndex + 1}`}</b>

                                                                                                {!isPurchased && (
                                                                                                    <a href="#" className="preview-btn ms-2">
                                                                                                        <FontAwesomeIcon icon={faLock} />
                                                                                                    </a>
                                                                                                )}
                                                                                            </span>

                                                                                            <div className="download-notes-box accordion-actions">
                                                                                                <button className="udemy-down-btn">Download Notes</button>
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

                                                                                                    <div className="quiz-card mb-3">

                                                                                                        <div>
                                                                                                            <a
                                                                                                                href="#"
                                                                                                                onClick={(e) => {
                                                                                                                    e.preventDefault();

                                                                                                                    if (!isPurchased) {
                                                                                                                        return; // locked
                                                                                                                    }

                                                                                                                    if (!isLearnMode) {
                                                                                                                        navigate(`/course/${course._id}/learn`);
                                                                                                                        return;
                                                                                                                    }

                                                                                                                    if (lesson.videoUrl) {
                                                                                                                        setCurrentLesson(lesson);
                                                                                                                        setShowVideo(true);
                                                                                                                    }
                                                                                                                }}
                                                                                                                className="quiz-title"
                                                                                                            >

                                                                                                                {isPurchased && isLearnMode ? (
                                                                                                                    <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                                                                                ) : (
                                                                                                                    <FontAwesomeIcon icon={faLock} className="file-icon" />
                                                                                                                )}
                                                                                                                <span>{lesson.title}</span>

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

                                                                                                                                if (!isPurchased) return;

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

                                                        {reviewsLoading ? (
                                                            <p>Loading reviews...</p>
                                                        ) : reviews.length === 0 ? (
                                                            <p className="text-muted">No reviews yet.</p>
                                                        ) : (
                                                            reviews.map((review, index) => (
                                                                <div className="quiz-card mb-3" key={index}>

                                                                    <div className="cart-details-bx mb-2">
                                                                        <h5>{review.user?.name || "User"}</h5>
                                                                        <h6>{review.user?.country || "India"}</h6>

                                                                        <ul className="rating-list">
                                                                            {[1,2,3,4,5].map((star) => (
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
                                                            ))
                                                        )}

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
                                    {isLearnMode && isEnrolled ? (
                                        <h5 className="fz-20 mb-0">Your Learning Progress</h5>
                                    ) : (
                                        <h4 className="course-price">
                                            ${course?.discountedPrice || course?.price || "24.92"}
                                        </h4>
                                    )}
                                </div>

                                {isLearnMode && isEnrolled ? (
                                    <>
                                        <div className="progress-wrapper mb-3">
                                            <div className="progress-item">
                                                <div className="d-flex align-items-center justify-content-between udemy-progress">
                                                    <span className="udemy-complete-video">Course Completion</span>
                                                </div>

                                                <div className="progress custom-progress">
                                                    <div className="progress-bar" style={{ width: "40%" }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {isCheckingPurchase ? (
                                            <div className="purchase-box">
                                                <button className="thm-btn" disabled>
                                                    Checking Purchase Status...
                                                </button>
                                            </div>
                                        ) : isPurchased ? (
                                            <>
                                                <div className="purchase-box">
                                                    <button
                                                        className="thm-btn w-100"
                                                        onClick={() => navigate(`/course/${course._id}/learn`, { state: { course } })}
                                                    >
                                                        Start Learning
                                                    </button>
                                                </div>

                                                {/* Start Learning Progress Section */}
                                                <div className="progress-wrapper mt-3">
                                                    <div className="progress-item">
                                                        <div className="d-flex align-items-center justify-content-between udemy-progress">
                                                            <span className="udemy-complete-video">
                                                                Course Completion
                                                            </span>
                                                        </div>
                                                        <div className="progress custom-progress">
                                                            <div className="progress-bar" style={{ width: "5%" }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="purchase-box">
                                                    <button
                                                        className="thm-btn w-100 btn-lg btn-success fw-bold py-3 px-5"
                                                        onClick={() => navigate(`/buy/${course._id}`)}
                                                    >
                                                        Buy Now
                                                    </button>

                                                    <div className="d-flex align-items gap-3 mt-3">
                                                        <button className="thm-btn w-100 outline" onClick={addToCart}>
                                                            Add to Cart
                                                        </button>

                                                        <button
                                                            className="thm-btn w-100 outline"
                                                            onClick={addToWishlist}
                                                            disabled={wishlistLoading}
                                                        >
                                                            {wishlistLoading ? "Adding..." : "Add to Wishlist"}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* summary icons shown only when not purchased */}
                                                <div className="udemy-all-box">
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


                                            </>
                                        )}

                                    </>
                                )}

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
