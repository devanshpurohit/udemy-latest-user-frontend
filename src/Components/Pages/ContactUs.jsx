import React, { useState, useEffect } from 'react';
import { createQuestion, isAuthenticated } from '../../services/apiService';
import { toast } from 'react-toastify';
import { FaSpinner, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

function ContactUs() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const isUserLoggedIn = isAuthenticated();

    useEffect(() => {
        if (isUserLoggedIn) {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        firstName: user.profile?.firstName || user.username?.split(' ')[0] || '',
                        lastName: user.profile?.lastName || user.username?.split(' ')[1] || '',
                        email: user.email || '',
                        contactNumber: user.profile?.phone || ''
                    }));
                }
            } catch (error) {
                console.error("Error parsing user data for pre-fill:", error);
            }
        }
    }, [isUserLoggedIn]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message.trim() || submitting) return;

        setSubmitting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
            const response = await axios.post(`${apiUrl}/complaints`, formData);
            
            if (response.data.success) {
                toast.success("Thank you for your message! Our team will get back to you soon.");
                setFormData(prev => ({ ...prev, message: '' }));
            }
        } catch (error) {
            console.error("Contact Us submission error:", error);
            toast.error(error.response?.data?.message || "Network error. Please try again.");
        } finally {
            setSubmitting(false);
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
                                    <h3 className="lg_title text-center mb-2">Contact Us</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <NavLink to="/" className="breadcrumb-link">
                                                        Home
                                                    </NavLink>
                                                </li>



                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Contact Us
                                                </li>
                                            </ol>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
      </section>


   <section className='contact-section'>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className='contact-card'>
                        <form onSubmit={handleSubmit}>
                            <h4 className='contact-title'>Contact Us</h4>
                            <p className='contact-para'>Reach out to us or raise a complaint</p>
                            
                            <div className='row'>
                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="firstName">First Name</label>
                                        <input 
                                            type="text" 
                                            name="firstName" 
                                            id="firstName" 
                                            className='form-control' 
                                            placeholder='Enter First Name'
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="lastName">Last Name</label>
                                        <input 
                                            type="text" 
                                            name="lastName" 
                                            id="lastName" 
                                            className='form-control' 
                                            placeholder='Enter Last Name'
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="email">Email Address</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            id="email" 
                                            className='form-control' 
                                            placeholder='Enter Email Address'
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="contactNumber">Contact Number</label>
                                        <input 
                                            type="number" 
                                            name="contactNumber" 
                                            id="contactNumber" 
                                            className='form-control' 
                                            placeholder='+91 | 000 000 0000'
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='custom-frm-bx'>
                                        <label htmlFor="message">Message for us?</label>
                                        <textarea 
                                            name="message" 
                                            id="message" 
                                            className='form-control' 
                                            placeholder='Write Message'
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                <div className='col-lg-12 mt-3'>
                                    <button 
                                        className='thm-btn w-100 d-flex align-items-center justify-content-center gap-2'
                                        disabled={submitting || !formData.message.trim()}
                                    >
                                        {submitting ? <FaSpinner className="fa-spin" /> : <FaPaperPlane />}
                                        {submitting ? "Sending..." : "Submit"}
                                    </button>
                                </div>
                            </div>
                        </form>

                    </div>

                </div>
            </div>
        </div>

      </section>
   </>
  )
}

export default ContactUs