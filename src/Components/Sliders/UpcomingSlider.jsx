import React from 'react';
import CourseCard from '../Common/CourseCard';

const UpcomingSlider = ({ upcomingCourses = [], loading, error, onRetry, splideRef }) => {
    return (
        <div>
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
                    <div key={course._id}>
                        <CourseCard course={course} />
                    </div>
                ))
            )}
        </div>
    );
};

export default UpcomingSlider;
