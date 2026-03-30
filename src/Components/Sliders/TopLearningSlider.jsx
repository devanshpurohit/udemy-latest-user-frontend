import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getLangText } from '../../utils/languageUtils';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const TopLearningSlider = ({ topLearningCourses = [], loading, error, onRetry, splideRef }) => {
    const { user } = useAuth();
    const userLanguage = user?.profile?.language || 'English';
    const goPrev = () => {
        splideRef.current?.splide.go("<");
    };

    const goNext = () => {
        splideRef.current?.splide.go(">");
    };

    return (
        <>
            <div className="zs-splide-wrapper" style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
            <Splide
                ref={splideRef}
                options={{
                    type: "loop",
                    perPage: 4,
                    gap: "20px",
                    pagination: false,
                    arrows: false,
                    drag: true,
                    breakpoints: {
                        1400: { perPage: 4 },
                        1200: { perPage: 4 },
                        992: { perPage: 3 },
                        768: { perPage: 2 },
                        576: { perPage: 1 },
                    },
                    classes: {
                        slide: 'splide__slide equal-height-slide'
                    }
                }}
            >
                {loading ? (
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
                            <button className="btn btn-primary" onClick={onRetry}>
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
                    (topLearningCourses || []).map((course) => (
                        <SplideSlide key={course._id}>
                            <NavLink to={`/course/${course._id}`} className="text-decoration-none">
                                <div className="udemy-cards">
                                   <div className='udemy-picture'>
                                     <img 
                                        src={course.thumbnail || course.courseImage || "/course_01.png"} 
                                        alt={getLangText(course.title, userLanguage)}
                                    />
                                   </div>
                                    <div className="card-body">
                                        <h6>{getLangText(course.title, userLanguage)}</h6>
                                        <p>{getLangText(course.description, userLanguage) ? (getLangText(course.description, userLanguage).length > 100 ? getLangText(course.description, userLanguage).substring(0, 100) + '...' : getLangText(course.description, userLanguage)) : 'Course description not available'}</p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faUser} className="me-1" />
                                                {course.instructor?.username || 'Instructor'}
                                            </small>
                                            <span className="badge bg-primary">Best Seller</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <span >₹{course.price || '999'}</span>
                                            <div className="rating-stars">
                                                {[...Array(5)].map((_, index) => {
                                                    const starValue = index + 1;
                                                    const rating = course.averageRating || 0;
                                                    return (
                                                        <FontAwesomeIcon
                                                            key={index}
                                                            icon={rating >= starValue ? faStar : rating >= starValue - 0.5 ? faStarHalf : faStar}
                                                            style={{ 
                                                                color: rating >= starValue ? '#ffc107' : rating >= starValue - 0.5 ? '#ffc107' : '#e4e5e9',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                    );
                                                })}
                                                <small className="ms-1" style={{ fontSize: '11px' }}>
                                                    {course.averageRating?.toFixed(1) || "0.0"}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        </SplideSlide>
                    ))
                )}
            </Splide>

           
            <div className="zs-bottom-arrows" >
                <button className="zs-arrow-btn" onClick={goPrev}>
                    <FaArrowLeft />
                </button>
                <button className="zs-arrow-btn"  onClick={goNext}>
                    <FaArrowRight />
                </button>
            </div>
        </div>
        </>
    );
};

export default TopLearningSlider;
