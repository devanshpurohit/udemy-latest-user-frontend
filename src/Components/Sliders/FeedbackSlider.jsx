import React, { useEffect, useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FaQuoteRight } from 'react-icons/fa';
import config from '../../config/config';

const FeedbackSlider = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/feedback/approved`);
                const data = await response.json();
                if (data.success) {
                    setFeedbacks(data.data);
                }
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    const renderStars = (rating) => {
        return (
            <>
                <li className="rating-item">
                    <span className="rating-number fz-16 fw-500">{rating}</span>
                </li>
                {[1, 2, 3, 4, 5].map((star) => (
                    <li key={star} className="rating-item">
                        <span className={`rating-text feedback-star ${star <= rating ? 'active' : ''}`}>
                            <FontAwesomeIcon icon={faStar} color={star <= rating ? "#ffc107" : "#e4e5e9"} />
                        </span>
                    </li>
                ))}
            </>
        );
    };

    if (loading) {
        return <div className="text-center py-5">Loading feedback...</div>;
    }

    if (feedbacks.length === 0) {
        return null; // Or show a default message
    }

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
                {feedbacks.map((feedback) => (
                    <SplideSlide key={feedback._id}>
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
                                <p>{feedback.comment}</p>
                            </div>

                            <div className='feedback-user'>
                                <div className='feedback-pic'>
                                    {(() => {
                                        const rawImage = feedback.userImage;
                                        const defaultAvatar = "/boy.png";
                                        
                                        if (!rawImage || rawImage.includes('picsum.photos')) {
                                            return <img src={defaultAvatar} alt={feedback.name} onError={(e) => { e.target.src = defaultAvatar }} />;
                                        }

                                        let imageUrl = defaultAvatar;
                                        if (rawImage.includes('boy.png')) {
                                            imageUrl = defaultAvatar;
                                        } else if (rawImage.startsWith("data:") || rawImage.startsWith("http")) {
                                            imageUrl = rawImage;
                                        } else {
                                            const baseUrl = config?.API_BASE_URL?.replace('/api', '') || ''; 
                                            imageUrl = `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
                                        }
                                        
                                        return <img src={imageUrl} alt={feedback.name} onError={(e) => { e.target.src = defaultAvatar }} />;
                                    })()}
                                </div>
                                <div className='feedback-details'>
                                    <h6>{feedback.name}</h6>
                                    <p>{feedback.userRole || 'Student'}</p>
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
