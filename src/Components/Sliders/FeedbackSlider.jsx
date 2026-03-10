import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FaQuoteRight } from 'react-icons/fa';

const FeedbackSlider = () => {
    const feedbackData = [
        {
            id: 1,
            rating: 5.0,
            content: "Divanex Technologies went above and beyond our expectations! From the very beginning, he supported us—even when we weren't sure what we wanted. By sharing ideas and examples from past projects, he helped us find exactly what we needed. Thank you for your hard work and speedy delivery. We look forward to collaborating again on future projects!",
            userName: "Bianca",
            userRole: "Student",
            userImage: "/feedback_01.jpg"
        },
        {
            id: 2,
            rating: 5.0,
            content: "Divanex Technologies went above and beyond our expectations! From the very beginning, he supported us—even when we weren't sure what we wanted. By sharing ideas and examples from past projects, he helped us find exactly what we needed. Thank you for your hard work and speedy delivery. We look forward to collaborating again on future projects!",
            userName: "Bianca",
            userRole: "Student",
            userImage: "/feedback_01.jpg"
        },
        {
            id: 3,
            rating: 5.0,
            content: "Divanex Technologies went above and beyond our expectations! From the very beginning, he supported us—even when we weren't sure what we wanted. By sharing ideas and examples from past projects, he helped us find exactly what we needed. Thank you for your hard work and speedy delivery. We look forward to collaborating again on future projects!",
            userName: "Bianca",
            userRole: "Student",
            userImage: "/feedback_01.jpg"
        },
        {
            id: 4,
            rating: 5.0,
            content: "Divanex Technologies went above and beyond our expectations! From the very beginning, he supported us—even when we weren't sure what we wanted. By sharing ideas and examples from past projects, he helped us find exactly what we needed. Thank you for your hard work and speedy delivery. We look forward to collaborating again on future projects!",
            userName: "Bianca",
            userRole: "Student",
            userImage: "/feedback_01.jpg"
        }
    ];

    const renderStars = (rating) => {
        return (
            <>
                <li className="rating-item">
                    <span className="rating-number fz-16 fw-500">{rating}</span>
                </li>
                {[1, 2, 3, 4, 5].map((star) => (
                    <li key={star} className="rating-item">
                        <a href="#" className="rating-text feedback-star">
                            <FontAwesomeIcon icon={faStar} />
                        </a>
                    </li>
                ))}
            </>
        );
    };

    return (
        <div className="feedback-splide-wrapper">
            <Splide
                options={{
                    type: "loop",
                    perPage: 2,
                    focus: "center",
                    gap: "20px",
                    arrows: false,
                    pagination: true,
                    autoplay: true,
                    interval: 2000,
                    pauseOnHover: false,
                    pauseOnFocus: false,
                    breakpoints: {
                        992: { perPage: 2 },
                        576: { perPage: 1 },
                    },
                }}
            >
                {feedbackData.map((feedback) => (
                    <SplideSlide key={feedback.id}>
                        <div className='feedback-card'>
                            <div className='feedback-quote-rating'>
                                <div className='feedback-quote-box'>
                                    <span className='feedback-icon'><FaQuoteRight /></span>
                                </div>
                                <div>
                                    <ul className="rating-list">
                                        {renderStars(feedback.rating)}
                                    </ul>
                                </div>
                            </div>

                            <div className='feedback-content'>
                                <p>{feedback.content}</p>
                            </div>

                            <div className='feedback-user'>
                                <div className='feedback-pic'>
                                    <img src={feedback.userImage} alt={feedback.userName} />
                                </div>
                                <div className='feedback-details'>
                                    <h6>{feedback.userName}</h6>
                                    <p>{feedback.userRole}</p>
                                </div>
                            </div>
                        </div>
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    );
};

export default FeedbackSlider;
