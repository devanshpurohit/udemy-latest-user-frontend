import { faChevronLeft, faClose, faLock, faVideo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import videojs from "video.js";
import "video.js/dist/video-js.css";
import React, { useEffect, useRef, useState } from "react";
import { MdQuiz, MdRateReview } from "react-icons/md";
import { IoIosStar, IoIosStarOutline } from "react-icons/io";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import config from "../../config/config";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { getLangText } from "../../utils/languageUtils";
import { updateWatchTime } from "../../services/apiService";

// 🎥 YouTube detection helpers
const isYouTube = (url, language) => {
    const videoUrl = typeof url === 'object' ? getLangText(url, language) : url;
    if (!videoUrl || typeof videoUrl !== 'string') return false;
    return videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
};

const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeEmbed = (url, language) => {
    const videoUrl = typeof url === 'object' ? getLangText(url, language) : url;
    const videoId = extractVideoId(videoUrl);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : "";
};

function VideoPlayer() {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const userLanguage = user?.profile?.language || 'English';
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [watchTimeLimitReached, setWatchTimeLimitReached] = useState(false);

    // Review Modal States
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Watch Time Tracking Effect
    useEffect(() => {
        let interval;
        
        const checkWatchTime = async () => {
            if (watchTimeLimitReached) return;
            
            let isPlaying = false;
            
            // Check native videoJS player
            if (playerRef.current && !playerRef.current.paused()) {
                isPlaying = true;
            }
            
            // Check YouTube player
            if (window.YT) {
                const ytPlayer = window.YT.get("youtube-player-iframe");
                if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
                    if (ytPlayer.getPlayerState() === window.YT.PlayerState.PLAYING) {
                        isPlaying = true;
                    }
                }
            }

            if (isPlaying) {
                try {
                    const data = await updateWatchTime(10); // Check every 10 seconds
                    if (data && data.success && data.limitReached) {
                        setWatchTimeLimitReached(true);
                        
                        // Pause all players
                        if (playerRef.current) playerRef.current.pause();
                        if (window.YT) {
                            const ytP = window.YT.get("youtube-player-iframe");
                            if (ytP && typeof ytP.pauseVideo === 'function') ytP.pauseVideo();
                        }
                    }
                } catch (err) {
                    console.error("Watch time check error:", err);
                }
            }
        };

        // If not already reached the limit, set up the interval polling
        if (!watchTimeLimitReached) {
            interval = setInterval(checkWatchTime, 10000); // 10 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [watchTimeLimitReached, currentLesson]);

    // Fetch course data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`${config.API_BASE_URL}/public/courses/${courseId}`, { headers });
                const data = await response.json();

                if (data.success) {
                    setCourse(data.data);
                    // Set starting lesson
                    const allLessons = getAllLessons(data.data);
                    if (allLessons.length > 0) {
                        const targetLessonId = location.state?.lessonId;
                        const startingLesson = targetLessonId 
                            ? allLessons.find(l => l._id === targetLessonId) 
                            : allLessons[0];
                        setCurrentLesson(startingLesson || allLessons[0]);
                    }
                    
                    // Sync progress
                    let completedIds = new Set();
                    if (data.data.completedLessons) {
                        completedIds = new Set(data.data.completedLessons.map(l => 
                            typeof l === 'object' ? (l.lessonId || l._id || l.lesson) : l
                        ).filter(Boolean).map(id => id.toString()));
                    }

                    // Also check localStorage for any pending local progress
                    if (user?._id) {
                        const progressKey = `progress_${user._id}_${courseId}`;
                        const savedProgress = localStorage.getItem(progressKey);
                        if (savedProgress) {
                            try {
                                const localIds = JSON.parse(savedProgress);
                                localIds.forEach(id => completedIds.add(String(id)));
                            } catch (e) { console.error("Error parsing local progress:", e); }
                        }
                    }
                    
                    setCompletedLessons(completedIds);
                } else {
                    toast.error(data.message || "Failed to load course");
                }
            } catch (error) {
                console.error("Error fetching course:", error);
                toast.error("An error occurred while loading the course");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchCourse();
    }, [courseId]);
    
    // React to lessonId changes from navigation state
    useEffect(() => {
        if (course && location.state?.lessonId) {
            const allLessons = getAllLessons(course);
            const targetLesson = allLessons.find(l => l._id === location.state.lessonId);
            if (targetLesson) {
                setCurrentLesson(targetLesson);
            }
        }
    }, [location.state?.lessonId, course]);

    // Handle Video.js player
    useEffect(() => {
        const videoUrl = getLangText(currentLesson?.videoUrl, userLanguage);
        console.log("🔍 LOCALIZED VIDEO URL:", videoUrl, "For Language:", userLanguage);
        
        const isYT = isYouTube(videoUrl, userLanguage);

        // If it's a YouTube video, make sure a video.js player doesn't exist or is disposed
        if (isYT) {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
            // YouTube is handled by the iframe rendering in JSX
        } else if (videoRef.current && currentLesson) {
            // Initialize or update Video.js
            if (!playerRef.current) {
                playerRef.current = videojs(videoRef.current, {
                    autoplay: true,
                    muted: true, // Auto-play requires mute
                    controls: true,
                    responsive: true,
                    fluid: true,
                    preload: 'auto',
                    userActions: {
                        hotkeys: true
                    }
                });

                playerRef.current.on('ended', () => {
                    if (currentLesson?._id) {
                        markLessonCompleted(currentLesson._id);
                    }
                });

                playerRef.current.on('error', () => {
                    const error = playerRef.current.error();
                    console.error("🎥 Video.js Error:", error);
                });
            }

            // Set source
            if (videoUrl) {
                let fullUrl = videoUrl;
                if (!videoUrl.startsWith('http')) {
                    // Normalize path: replace backslashes, extract only the part after 'uploads' or root
                    let cleanPath = videoUrl.replace(/\\/g, '/');
                    
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
                
                // Only update source if it changed to prevent AbortError
                if (playerRef.current.src() !== fullUrl) {
                    const ext = fullUrl.includes('?') 
                        ? fullUrl.split('?')[0].split('.').pop().toLowerCase() 
                        : fullUrl.split('.').pop().toLowerCase();
                        
                    let videoType = 'video/mp4'; // Default fallback
                    if (ext === 'webm') videoType = 'video/webm';
                    else if (ext === 'ogg' || ext === 'ogv') videoType = 'video/ogg';
                    else if (ext === 'm3u8') videoType = 'application/x-mpegURL';

                    console.log("🎥 Video Player - Setting source:", fullUrl, "Type:", videoType);
                    playerRef.current.src({ src: fullUrl, type: videoType }); 
                    playerRef.current.load();
                }
                
                // Ensure it plays if ready
                playerRef.current.ready(() => {
                    const playPromise = playerRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("🎥 Auto-play allowed but play() failed:", error);
                        });
                    }
                });
            }
        }

        // YouTube IFrame API logic
        let ytPlayer;
        let interval;

        const loadYTPlayer = () => {
            if (!isYT || !currentLesson) return;
            
            ytPlayer = new window.YT.Player("youtube-player-iframe", {
                events: {
                    onStateChange: (event) => {
                        // 100% video complete hone par (State ENDED = 0)
                        if (event.data === window.YT.PlayerState.ENDED) {
                            console.log("🎥 YouTube Lesson completed (video ended)");
                            markLessonCompleted(currentLesson._id);
                        }
                    }
                }
            });
        };

        if (isYT && currentLesson) {
            if (!window.YT) {
                const tag = document.createElement("script");
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);
                window.onYouTubeIframeAPIReady = loadYTPlayer;
            } else {
                loadYTPlayer();
            }
        }

        return () => {
            if (interval) clearInterval(interval);
            // Don't dispose on every lesson change to avoid flickering, 
            // only when switching to YT (handled above) 
            // the actual cleanup happens in a separate effect or on unmount if needed
        };
    }, [currentLesson]);

    // Final cleanup on unmount
    useEffect(() => {
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    // Calculate progress percentage
    useEffect(() => {
        if (course) {
            const allLessons = getAllLessons(course);
            if (allLessons.length > 0) {
                const percentage = Math.round((completedLessons.size / allLessons.length) * 100);
                setProgressPercentage(percentage);
            }
        }
    }, [completedLessons, course]);

    const getAllLessons = (courseData) => {
        if (!courseData) return [];
        if (courseData.sections && courseData.sections.length > 0) {
            return courseData.sections.flatMap(section => section.lessons || []);
        } else if (courseData.lessons) {
            return courseData.lessons;
        }
        return [];
    };

    const markLessonCompleted = async (lessonId) => {
        const idStr = String(lessonId);
        
        // Only trigger completion logic if it's the first time
        if (!completedLessons.has(idStr)) {
            setCompletedLessons(prev => {
                const next = new Set(prev);
                next.add(idStr);
                
                // Save to localStorage for sync with CourseDetailsContent
                if (user?._id && courseId) {
                    const progressKey = `progress_${user._id}_${courseId}`;
                    localStorage.setItem(progressKey, JSON.stringify(Array.from(next)));
                }
                
                return next;
            });

            try {
                const token = localStorage.getItem('token');
                if (token && user?._id && courseId) {
                    // Force refresh next dashboard visit
                    sessionStorage.removeItem(`udemy_dashboard_${user._id}`);
                    sessionStorage.removeItem(`udemy_all_courses`);
                    
                    await fetch(`${config.API_BASE_URL}/students/${user._id}/courses/${courseId}/progress`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ lessonId })
                    });
                }
            } catch (err) {
                console.error("Failed to sync progress:", err);
            }
        }

        // 🎯 video complete hone par review modal open - opens every time now
        setTimeout(() => {
            openReviewModal();
        }, 800);
    };

    const openReviewModal = () => {
        const modalElement = document.getElementById("review-Add");
        if (modalElement && window.bootstrap) {
            const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login to submit a review");
                return;
            }

            const response = await fetch(`${config.API_BASE_URL}/reviews/${courseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId: courseId,
                    rating: rating,
                    comment: reviewText
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Thank you for your review!");
                setReviewText("");
                setRating(5);
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (error) {
            console.error("Review submission error:", error);
            toast.error("An error occurred during submission");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (course) {
            const allLessons = getAllLessons(course);
            if (allLessons.length > 0) {
                const percentage = Math.round((completedLessons.size / allLessons.length) * 100);
                setProgressPercentage(percentage);
            }
        }
    }, [completedLessons, course]);

    if (loading) {
        return <div className="container py-5 text-center"><h4>Loading Video Player...</h4></div>;
    }

    if (!course) {
        return <div className="container py-5 text-center"><h4>Course not found</h4></div>;
    }

    const allLessonsCount = getAllLessons(course).length;

    return (
        <>
            <section className="udemy-alert-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <div className="udemy-alert-content justify-content-start">
                                <button className="vd-back-btn" onClick={() => navigate(-1)}> 
                                    <FontAwesomeIcon icon={faChevronLeft} /> Go back
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <div className="udemy-alert-content justify-content-center">
                                <p>{getLangText(course.title, userLanguage)}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <div className="udemy-alert-content justify-content-end">
                                <p>Your Progress {completedLessons.size} of {allLessonsCount} ({progressPercentage}%)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="udemy-play-section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-8 px-0">
                            <div className="custom-video-wrapper no-radius-video" style={{ position: 'relative' }}>
                                {/* Safe Overlay Container - React can safely add/remove children here without interference from Video.js */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: watchTimeLimitReached ? 9999 : -1, pointerEvents: watchTimeLimitReached ? 'auto' : 'none' }}>
                                    {watchTimeLimitReached && (
                                        <div className="watch-limit-overlay" style={{
                                            width: '100%', height: '100%',
                                            backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex',
                                            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', textAlign: 'center'
                                        }}>
                                            <h3 className="mb-3 text-white"><FontAwesomeIcon icon={faLock} className="me-2" />Daily Limit Reached</h3>
                                            <p style={{ fontSize: '18px', maxWidth: '600px' }}>
                                                You've reached your daily learning limit for today. Great job staying consistent! 
                                                Taking time to process what you've learned is essential. Please come back tomorrow to unlock more content.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Safe Video Container */}
                                <div className="video-safe-container">
                                    {isYouTube(currentLesson?.videoUrl, userLanguage) ? (
                                        <div className="youtube-player-container" style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                                            <iframe
                                                id="youtube-player-iframe"
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '0px' }}
                                                src={getYouTubeEmbed(currentLesson.videoUrl, userLanguage) + (getYouTubeEmbed(currentLesson.videoUrl, userLanguage).includes('?') ? '&enablejsapi=1' : '?enablejsapi=1')}
                                                title={getLangText(currentLesson.title, userLanguage)}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            className="video-js vjs-big-play-centered custom-video"
                                            controls
                                            preload="auto"
                                            poster={course.thumbnail && !course.thumbnail.startsWith('http') 
                                                ? `${config.API_BASE_URL.replace('/api', '')}/${course.thumbnail.replace(/\\/g, '/')}`.replace(/\/+/g, '/').replace(':/', '://')
                                                : (course.thumbnail || course.courseImage || "/course_banner.png")}
                                        >
                                        </video>
                                    )}
                                </div>
                            </div>

                            <div className="video-details-content">
                                <div className="vd-content-space">
                                    <h5>Description</h5>
                                    <p>{getLangText(currentLesson?.description, userLanguage) || getLangText(course.description, userLanguage)}</p>
                                </div>

                                {course.whatYouWillLearn && (() => {
                                    const learnList = Array.isArray(course.whatYouWillLearn)
                                        ? course.whatYouWillLearn
                                        : (course.whatYouWillLearn[userLanguage === 'Kannada' ? 'kn' : 'en'] || course.whatYouWillLearn.en || []);
                                    return learnList.length > 0 && (
                                        <div className="vd-content-space">
                                            <h5>What I Will Learn</h5>
                                            <ul className="video-content-list">
                                                {learnList.map((item, index) => (
                                                    <li key={index} className="vd-content-item">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })()}

                                {course.requirements && (() => {
                                    const reqList = Array.isArray(course.requirements)
                                        ? course.requirements
                                        : (course.requirements[userLanguage === 'Kannada' ? 'kn' : 'en'] || course.requirements.en || []);
                                    return reqList.length > 0 && (
                                        <div className="vd-content-space">
                                            <h5>Requirements</h5>
                                            <ul className="video-content-list">
                                                {reqList.map((item, index) => (
                                                    <li key={index} className="vd-content-item pb-0">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="col-lg-4 video-player-list">
                            <div className="accordion custom-accordion" id="customAccordion">
                                {course.sections && course.sections.map((section, sIdx) => (
                                    <div key={section._id || sIdx} className="accordion-item">
                                        <h2 className="accordion-header" id={`heading${sIdx}`}>
                                            <button
                                                className={`accordion-button ${sIdx === 0 ? '' : 'collapsed'}`}
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#collapse${sIdx}`}
                                                aria-expanded={sIdx === 0 ? 'true' : 'false'}
                                                aria-controls={`collapse${sIdx}`}
                                            >
                                                <div className="accordion-title">
                                                    <span>
                                                        <b>{sIdx + 1}. {getLangText(section.title, userLanguage)}</b>
                                                    </span>
                                                    <div className="accordion-actions">
                                                        <span className="small text-muted">
                                                            {section.lessons?.length || 0} Lessons
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        </h2>

                                        <div
                                            id={`collapse${sIdx}`}
                                            className={`accordion-collapse collapse ${sIdx === 0 ? 'show' : ''}`}
                                            aria-labelledby={`heading${sIdx}`}
                                            data-bs-parent="#customAccordion"
                                        >
                                            <div className="accordion-body">
                                                {section.lessons && section.lessons.map((lesson, lIdx) => (
                                                    <div key={lesson._id || lIdx}>
                                                        <div 
                                                            className={`quiz-card cursor-pointer ${currentLesson?._id === lesson._id ? 'bg-light' : ''}`}
                                                            onClick={() => setCurrentLesson(lesson)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div>
                                                                <div className="quiz-title">
                                                                    <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                                                    <span className={currentLesson?._id === lesson._id ? 'fw-bold' : ''}>
                                                                        {getLangText(lesson.title, userLanguage)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="">
                                                                {completedLessons.has(String(lesson._id)) ? (
                                                                    <span className="course-com-title text-success">Completed</span>
                                                                ) : (
                                                                    <span className="course-time-title">{lesson.duration || 'Video'}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Quizzes under this lesson */}
                                                        {lesson.quizzes && lesson.quizzes.map((quiz, qIdx) => (
                                                            <div key={quiz._id || qIdx} 
                                                                className={`quiz-card cursor-pointer ${!completedLessons.has(String(lesson._id)) ? 'locked-quiz' : ''}`} 
                                                                onClick={() => {
                                                                    if (!completedLessons.has(String(lesson._id))) {
                                                                        toast.warning("Please first complete the video to unlock the quiz.");
                                                                        return;
                                                                    }
                                                                    navigate(`/course/${courseId}/lesson/${lesson._id}/quiz/${quiz._id}`);
                                                                }}
                                                            >
                                                                <div>
                                                                    <div className="quiz-title">
                                                                        {completedLessons.has(String(lesson._id)) ? (
                                                                            <MdQuiz className="file-icon" />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faLock} className="file-icon" />
                                                                        )}
                                                                        <span>{getLangText(quiz.title, userLanguage) || 'Quiz'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Fallback if no sections but direct lessons */}
                                {!course.sections && course.lessons && course.lessons.map((lesson, lIdx) => (
                                    <div 
                                        key={lesson._id || lIdx} 
                                        className={`quiz-card p-3 mb-2 border rounded cursor-pointer ${currentLesson?._id === lesson._id ? 'bg-light' : ''}`}
                                        onClick={() => setCurrentLesson(lesson)}
                                    >
                                        <div className="quiz-title">
                                            <FontAwesomeIcon icon={faVideo} className="file-icon" />
                                            <span>{getLangText(lesson.title, userLanguage)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="modal step-modal fade" id="review-Add" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content custom-modal-box success-modal">
                        <div className="text-end p-2">
                            <button type="button" className="modal-close-btn" data-bs-dismiss="modal" aria-label="Close">
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="modal-body px-4 pt-0">
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
                                                style={{ height: "120px" }}
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
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Submitting..." : "Submit Review"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VideoPlayer
