import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoIosStar, IoIosStarOutline } from "react-icons/io";
import config from '../../config/config';
import { getToken } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Feedback = () => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.username || '',
        email: user?.email || ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = getToken();
        if (!token) {
            toast.error('Please login to submit feedback');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write some feedback');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${config.API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    rating,
                    comment
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || 'Feedback submitted successfully!');
                setComment('');
                setRating(5);
            } else {
                toast.error(data.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Feedback error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">Feedback</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <NavLink to="/" className="breadcrumb-link">Home</NavLink>
                                                </li>
                                                <li className="breadcrumb-item active" aria-current="page">Feedback</li>
                                            </ol>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="contact-section py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="contact-card">
                                <div className=" mb-2">
                                    <h4 className='contact-title'>We value your feedback!</h4>
                                    <p className='contact-para'>Tell us about your experience with our platform.</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                            <div className="col-md-6 col-lg-6 col-sm-12">
                                        <div className='custom-frm-bx'>
                                            <label className="">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control feedback-input"
                                                placeholder="Your Name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        </div>

                                        <div className="col-md-6 col-lg-6 col-sm-12">
                                            <div className='custom-frm-bx'>
                                                 <label className="">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control feedback-input"
                                                placeholder="Your Email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />

                                            </div>
                                           
                                        </div>
                                    </div>

                                  <div className='col-lg-12'>
                                      <div className="custom-frm-bx">
                                        <label className="">Your Rating</label>
                                        <div className="d-flex justify-content-start gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span 
                                                    key={star} 
                                                    className="cursor-pointer"
                                                    onClick={() => setRating(star)}
                                                    style={{ fontSize: '1.5rem', cursor: 'pointer', display : "flex" }}
                                                >
                                                    {star <= rating ? (
                                                        <IoIosStar color="#ffc107" />
                                                    ) : (
                                                        <IoIosStarOutline color="#e4e5e9" />
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                  </div>

                                    <div className="custom-frm-bx">
                                        <label className="">Your Experience</label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            placeholder="Write your feedback here..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="text-center">
                                        <button 
                                            type="submit" 
                                            className="thm-btn px-5"
                                            disabled={loading}
                                        >
                                            {loading ? 'Submitting...' : 'Submit Feedback'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Feedback;
