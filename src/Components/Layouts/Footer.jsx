import React, { useState } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaLinkedinIn } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { FiTwitter } from "react-icons/fi";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";



function Footer() {
    const { settings } = useSettings();
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email) {
            toast.error("Please enter email address");
            return;
        }

        if (!user || email !== user.email) {
            toast.error("please enter your login mail");
            return;
        }

        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
            const response = await axios.post(`${apiUrl}/newsletter/subscribe`, { email });
            
            if (response.data.success) {
                toast.success(response.data.message || "Subscribed successfully!");
                setEmail("");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to subscribe");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <footer className="footer-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <a href="#"><img src={settings.logoUrl || "/white-Logo.png"} alt={settings.siteName || "Logo"} className="footer-logo" /></a>
                            </div>

                            <div className="footer-text">
                                <p>
                                    {settings.footerContent || "We are committed to delivering clear, reliable, and student-friendly educational content through structured digital courses."}
                                </p>
                            </div>

                            <div className="footer-social mt-3">
                                <ul className="social-icon-list">
                                    <li><a href="#" className="social-nav-link"><FaFacebookF className="social-nav-icon" /> Facebook </a></li>
                                    <li><a href="#" className="social-nav-link"><FiTwitter className="social-nav-icon" /> Twitter </a></li>
                                    <li><a href="#" className="social-nav-link"><FaInstagram className="social-nav-icon" /> Instagram </a></li>
                                </ul>


                            </div>
                        </div>

                        <div className="col-lg-2 col-md-6 col-sm-12  mb-4">
                            <h5 className="sub-title">Quick company</h5>
                            <ul className="footer-links">
                                <li className="footer-item"> <NavLink to="/" className="footer-nav-link">Home</NavLink></li>
                            <li className="footer-item"> <NavLink to="/my-course" className="footer-nav-link">Courses</NavLink> </li>

                            </ul>
                        </div>

                        <div className="col-lg-2 col-md-6 col-sm-12 mb-4">
                            <div className="mb-3">
                                <h5 className="sub-title">Other Link</h5>
                                <ul className="footer-links">
                                    <li className="footer-item"> <NavLink to="/contact-us" className="footer-nav-link">Contact Us</NavLink> </li>
                                    <li className="footer-item"> <NavLink to="/faq" className="footer-nav-link">FAQs</NavLink> </li>
                                </ul>
                            </div>

                            <h5 className="sub-title">Legal</h5>
                            <ul className="footer-links">
                                <li className="footer-item"> <NavLink to="/term-condition" className="footer-nav-link">Terms and conditions</NavLink> </li>
                                <li className="footer-item"> <NavLink to="/privacy-policy" className="footer-nav-link">Privacy policy</NavLink> </li>
                                <li className="footer-item"> <NavLink to="/cookies-policy" className="footer-nav-link">Cookies policy</NavLink> </li>
                                <li className="footer-item"> <NavLink to="/license-agreement" className="footer-nav-link">License agreement</NavLink> </li>
                            </ul>
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-12 mb-lg-4 mb-sm-0">
                            <div className="subscribe-content">
                                <h5 className="sub-title">Subscribe US</h5>
                                <p>Subscribe to the free newsletter and stay <span className="d-lg-block d-sm-inline">up to date</span> </p>

                                <div className="email-footer-box">
                                    <div className="custom-frm-bx">
                                        <input 
                                            type="email" 
                                            className="form-control email-frm-control" 
                                            placeholder="Your email address" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                        <div className="email-footer-send-box">
                                            <button 
                                                className="email-ftr-btn" 
                                                onClick={handleSubscribe}
                                                disabled={loading}
                                            >
                                                {loading ? "..." : "Send"}
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>


                </div>

                <div className="footer-bottom">
                    <p className=" mb-0">© Copyright {settings.siteName || "AI"} @2026</p>
                </div>

            </footer>
        </>
    )
}

export default Footer