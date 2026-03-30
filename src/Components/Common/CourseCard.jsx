import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { BiSolidBadgeCheck } from 'react-icons/bi';
import config from '../../config/config';
import { useAuth } from '../../contexts/AuthContext';
import { getLangText } from '../../utils/languageUtils';

const normalizeMediaUrl = (url) => {
    if (!url) return "/course_01.png";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Normalize path: replace backslashes, extract only the part after 'uploads' or root
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

const CourseCard = ({ course, variant = 'default', isVertical = false }) => {
    const cardClass = 'udemy-cards';
    const pictureClass = 'udemy-picture';
    // Check if this is for continue learning (grid) - horizontal layout
    const isContinueLearning = variant === 'continue-learning';
    const isMyCourse = variant === "my-course";
    const { isAuthenticated, user } = useAuth();
    const userLanguage = user?.profile?.language || 'English';
    const progress = course.progressPercentage || 0;

    const renderContent = () => (
        <div className={`udemy-content ${isVertical ? '' : 'top-course-list-box'}`}>
            <div className='udemy-course-top'>
                <h4 className={isVertical ? 'fz-16 mb-1' : ''}>{getLangText(course.title, userLanguage)}</h4>
                <span className={isVertical ? 'pb-1 fz-12' : 'pb-2'}>
                    <FontAwesomeIcon icon={faUser} className="udemy-course-icon" />
                    <span className="udemy-user">
                        {course.instructor?.username || 'Instructor'}
                    </span>
                </span>
                <p 
                    className={`course-desc ${isVertical ? 'fz-12 mb-2 line-clamp-2' : ''}`}
                    style={{ whiteSpace: 'pre-line' }}
                >
                    {getLangText(course.description, userLanguage)
                        ? (getLangText(course.description, userLanguage).length > (isVertical ? 50 : 100)
                            ? getLangText(course.description, userLanguage).substring(0, isVertical ? 50 : 100) + '...'
                            : getLangText(course.description, userLanguage))
                        : 'Course description not available'
                    }
                </p>
            </div>

            <div>
                {variant !== 'simple' && (
                    <>
                        <ul className="rating-list">
                            {[...Array(5)].map((_, index) => {
                                const starValue = index + 1;
                                const rating = course.averageRating || 0;
                                return (
                                    <li key={index} style={{ color: '#ffc107' }}>
                                        <FontAwesomeIcon
                                            icon={
                                                rating >= starValue
                                                    ? faStar
                                                    : rating >= starValue - 0.5
                                                    ? faStarHalf
                                                    : faStar
                                            }
                                            style={{ 
                                                color: rating >= starValue ? '#ffc107' : rating >= starValue - 0.5 ? '#ffc107' : '#e4e5e9' 
                                            }}
                                        />
                                    </li>
                                );
                            })}
                            <li className="rating-item ps-1">
                                <span className="rating-number">
                                    {course.averageRating?.toFixed(1) || "0.0"}
                                </span>
                            </li>
                        </ul>

                        <div className={isVertical ? 'udemy-course-price mt-1' : 'udemy-course-price'}>
                            <h5 className={isVertical ? 'fz-16' : ''}>₹{course.price || '999'} <del className="udemy-sale">₹{course.originalPrice || '1999'}</del></h5>
                        </div>

                        {isAuthenticated && (isMyCourse || course.isPurchased) && (
                            <div className="course-progress progress-wrapper mt-1">
                                <div className="course-progress-top d-flex align-items-center justify-content-between udemy-progress">
                                    <span className="udemy-complete-video fz-12">
                                        {progress === 100 ? 'Completed' : `(${course.completedLessonsCount || 0}/${course.totalLessonsCount || 0})`}
                                    </span>
                                    <span className="progress-label fz-10 fw-500">{progress}%</span>
                                </div>
                                <div className="course-progress-bar progress custom-progress" style={{ height: isVertical ? '4px' : '6px' }}>
                                    <div
                                        className={`course-progress-fill progress-bar ${progress === 100 ? 'complete-bar' : ''}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    const targetLink = `/course/${course._id}`;

    return (
        <NavLink to={targetLink} className="text-decoration-none">
            <div className={`udemy-cards ${isVertical ? 'vertical-card' : ''}`} >
                {isVertical ? (
                    <>
                        <div className="udemy-picture" style={{ height: '160px' }}>
                            <img
                                src={normalizeMediaUrl(course.thumbnail || course.courseImage)}
                                alt={getLangText(course.title, userLanguage)}
                                style={{ height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        {renderContent()}
                    </>
                ) : (
                    <div className='row'>
                        <div className='col-lg-6'>
                            <div className="udemy-picture" >
                                <img
                                    src={normalizeMediaUrl(course.thumbnail || course.courseImage)}
                                    alt={getLangText(course.title, userLanguage)}
                                />
                                <div className="udemy-category-box" >
                                    <span className="udemy-seller" > Best Seller </span>
                                    <span className="udemy-offer" > 20% OFF </span>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6'>
                            {renderContent()}
                        </div>
                    </div>
                )}
            </div>
        </NavLink>
    );
};

export default CourseCard;
