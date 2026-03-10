import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import CourseCard from '../Common/CourseCard';

const SecondLearningSlider = ({ courses, loading, error, onRetry, splideRef }) => {
    return (
        <div className="zs-splide-wrapper">
            <Splide
                ref={splideRef}
                options={{
                    type: "loop",
                    perPage: 2,
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
                ) : courses.length === 0 ? (
                    <div className="text-center py-5">
                        <h3>No courses available</h3>
                        <p>Check back later for new courses.</p>
                    </div>
                ) : (
                    courses.slice(5, 10).map((course) => (
                        <SplideSlide key={course._id}>
                            <CourseCard course={course} variant="top" />
                        </SplideSlide>
                    ))
                )}
            </Splide>
        </div>
    );
};

export default SecondLearningSlider;
