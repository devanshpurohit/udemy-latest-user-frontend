import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { BiSolidBadgeCheck } from 'react-icons/bi';

const CourseCard = ({ course, variant = 'default' }) => {
    const cardClass = 'udemy-cards';
    const pictureClass = 'udemy-picture';
    // Check if this is for continue learning (grid) - horizontal layout
    const isContinueLearning = variant === 'continue-learning';
    const isMyCourse = variant === "my-course";
    const progress = course.progress || 40;

    return (
        <NavLink to={`/course/${course._id}`} className="text-decoration-none">
            <div className="udemy-cards mb-3" >

                <div className='row'>
                    <div className='col-lg-6'>
                        <div className="udemy-picture" >
                            <img
                                src={course.thumbnail || course.courseImage || "/course_01.png"}
                                alt={course.title}

                            />
                            <div className="udemy-category-box" >
                                <span className="udemy-seller" > Best Seller </span>
                                <span className="udemy-offer" > 20% OFF </span>
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <div className="udemy-content top-course-list-box">
                            <div className='udemy-course-top'>
                                <h4 >{course.title}</h4>
                                <span className='pb-2'>
                                    <FontAwesomeIcon icon={faUser} className="udemy-course-icon" />
                                    <span className="udemy-user">
                                        {course.instructor?.username || 'Instructor'}
                                    </span>
                                </span>
                                <p >
                                    {course.description
                                        ? course.description.substring(0, isContinueLearning ? 60 : 100) + '...'
                                        : 'Course description not available'
                                    }
                                </p>
                            </div>

                            <div>
                                {variant !== 'simple' && (
                                    <>
                                        <ul className="rating-list" >
                                            <li style={{ color: '#ffc107' }}>
                                                <FontAwesomeIcon icon={faStar} />
                                            </li>
                                            <li style={{ color: '#ffc107' }}>
                                                <FontAwesomeIcon icon={faStar} />
                                            </li>
                                            <li style={{ color: '#ffc107' }}>
                                                <FontAwesomeIcon icon={faStar} />
                                            </li>
                                            <li style={{ color: '#ffc107' }}>
                                                <FontAwesomeIcon icon={faStar} />
                                            </li>
                                            <li style={{ color: '#ffc107' }}>
                                                <FontAwesomeIcon icon={faStarHalf} />
                                            </li>
                                        </ul>





                                        <div className='udemy-course-price'>
                                            <h5 >₹{course.price || '999'} <del className="udemy-sale">₹{course.originalPrice || '1999'}</del></h5>
                                        </div>

                                        {isMyCourse && (
                                            <div className="course-progress progress-wrapper mt-1">

                                                <div className="course-progress-top d-flex align-items-center justify-content-between udemy-progress">
                                                    <span className="udemy-complete-video">(4/10)Video Completed</span>
                                                    <span className="progress-label fz-12 fw-500">{progress}%</span>
                                                </div>

                                                <div className="course-progress-bar progress custom-progress">
                                                    <div
                                                        className="course-progress-fill progress-bar"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>

                                            </div>
                                        )}
                                    </>
                                )}
                            </div>




                        </div>
                    </div>

                </div>





            </div>
        </NavLink>
    );
};

export default CourseCard;
