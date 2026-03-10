import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import CourseCard from '../Common/CourseCard';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const UpcomingSlider = ({ upcomingCourses = [], loading, error, onRetry, splideRef }) => {
    const goPrev = () => {
        splideRef.current?.splide.go("<");
    };

    const goNext = () => {
        splideRef.current?.splide.go(">");
    };

    return (
        <div className="zs-splide-wrapper">
            <Splide
                ref={splideRef}
                options={{
                    type: "loop",
                    perPage: 1,
                    gap: "20px",
                    pagination: false,
                    arrows: false,
                    drag: true,
                    breakpoints: {
                      
                        1200: { perPage: 3 },
                        992: { perPage: 2 },
                        576: { perPage: 1 },
                    },
                    classes: {
                        slide: 'splide__slide equal-height-slide'
                    }
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
                            <button className="btn btn-primary" onClick={onRetry}>
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : (upcomingCourses || []).length === 0 ? (
                    <div className="text-center py-5">
                        <h3>No courses available</h3>
                        <p>Check back later for new courses.</p>
                    </div>
                ) : (
                    (upcomingCourses || []).map((course) => (
                        <SplideSlide key={course._id}>
                            <CourseCard course={course} />
                        </SplideSlide>
                    ))
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
    );
};

export default UpcomingSlider;
