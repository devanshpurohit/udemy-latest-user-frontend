import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faClose, faEnvelope, faEye, faPhone, faTimes, faUser, faShoppingCart, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";
import { FaUser, FaComments } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { BsCreditCardFill } from "react-icons/bs";
import { IoInformationCircle } from "react-icons/io5";
import { useAuth } from '../../contexts/AuthContext';
import { login, forgotPassword as authForgotPassword, resendOTP as authResendOtp, verifyOtp as authVerifyOtp, resetPassword as authResetPassword, verifyAICard, register as authRegister } from '../../services/authService';
import { useSettings } from "../../contexts/SettingsContext";



const Header = () => {
    const { isAuthenticated, user, logout: authLogout, login: authLogin } = useAuth();
    const { settings } = useSettings();
    const [menuOpen, setMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOTP, setForgotOTP] = useState(['', '', '', '']);
    const [forgotNewPassword, setForgotNewPassword] = useState('');
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');

    // Registration State
    const [regStep, setRegStep] = useState(1);
    const [regCardNumber, setRegCardNumber] = useState('');
    const [regCvv, setRegCvv] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regLanguage, setRegLanguage] = useState('English');
    const [regOtp, setRegOtp] = useState(['', '', '', '']);
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');
    
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    // Load cart items from localStorage
    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
    }, []);

    // Listen for cart updates
    useEffect(() => {
        const handleStorageChange = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(cart);
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check on focus
        const handleFocus = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(cart);
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const dropdownRef = useRef(null);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        setCatOpen(false);
    };

    const closeMenu = () => {
        setMenuOpen(false);
        setCatOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setCatOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [isFixed, setIsFixed] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('🔍 Header login attempt:', { username, passwordLength: password?.length });
            const result = await login(username, password);
            console.log('🔍 Header login result:', result);

            if (result.success) {
                console.log('🔍 Header login successful, updating auth context...');
                const user = result.data.user || result.data.data?.user;
                console.log('🔍 User role:', user?.role);

                // Update auth context
                authLogin(user);

                // Close the modal
                const modal = document.getElementById('loginModal');
                if (modal) {
                    const bsModal = window.bootstrap?.Modal?.getInstance(modal) || new window.bootstrap.Modal(modal);
                    bsModal.hide();
                }

                // Clear form
                setUsername('');
                setPassword('');

                // Navigate to home
                navigate('/');
            } else {
                if (result.error && (result.error.toLowerCase().includes('device') || result.error.toLowerCase().includes('approval'))) {
                    toast.warning(result.error);
                } else {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotLoading(true);
        try {
            const result = await authForgotPassword(forgotEmail);
            if(result.success) {
                // Close current modal
                const forgotModal = window.bootstrap?.Modal?.getInstance(document.getElementById('forgotPasswordModal'));
                if(forgotModal) forgotModal.hide();
                // Open OTP modal
                const otpModal = new window.bootstrap.Modal(document.getElementById('otpModal'));
                otpModal.show();
            } else {
                setForgotError(result.error);
            }
        } catch (err) {
            setForgotError('Request failed');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotLoading(true);
        const otpString = forgotOTP.join('');
        if (otpString.length !== 4) {
            setForgotError('Please enter a valid 4-digit OTP');
            setForgotLoading(false);
            return;
        }
        try {
            const result = await authVerifyOtp(forgotEmail, otpString);
            if(result.success) {
                // Close current modal
                const otpModalEl = document.getElementById('otpModal');
                const otpModal = window.bootstrap?.Modal?.getInstance(otpModalEl);
                if(otpModal) otpModal.hide();
                // Open Set Password Modal
                const setPasswordModal = new window.bootstrap.Modal(document.getElementById('setPasswordModal'));
                setPasswordModal.show();
            } else {
                setForgotError(result.error);
            }
        } catch (err) {
            setForgotError('Verification failed');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...forgotOTP];
        newOtp[index] = element.value.substring(0, 1);
        setForgotOTP(newOtp);
        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };
    
    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!forgotOTP[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        if(forgotNewPassword !== forgotConfirmPassword) {
            setForgotError("Passwords do not match");
            return;
        }
        setForgotLoading(true);
        try {
            const result = await authResetPassword(forgotEmail, forgotNewPassword);
            if(result.success) {
                // Close current modal
                const setPasswordModalEl = document.getElementById('setPasswordModal');
                const setPasswordModal = window.bootstrap?.Modal?.getInstance(setPasswordModalEl);
                if(setPasswordModal) setPasswordModal.hide();
                // Open Login Modal
                const loginModal = new window.bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                setForgotEmail('');
                setForgotOTP(['', '', '', '']);
                setForgotNewPassword('');
                setForgotConfirmPassword('');
            } else {
                setForgotError(result.error);
            }
        } catch (err) {
            setForgotError('Reset failed');
        } finally {
            setForgotLoading(false);
        }
    };

    // Registration Step 1: Basic Info
    const handleBasicInfoSubmit = (e) => {
        e.preventDefault();
        setRegError('');
        
        if (regPassword !== regConfirmPassword) {
            setRegError('Passwords do not match');
            return;
        }
        
        if (regPassword.length < 6) {
            setRegError('Password must be at least 6 characters long');
            return;
        }

        setRegStep(2);
        hideModal('register');
        showModal('registerProfile');
    };

    // Registration Step 2: Profile Registration (Card Details or Skip)
    const handleRegistration = async (e, skipCard = false) => {
        if (e) e.preventDefault();
        setRegError('');
        setRegLoading(true);
        try {
            const userData = {
                email: regEmail,
                password: regPassword,
                language: regLanguage,
                ...(skipCard ? {} : { cardNumber: regCardNumber, cvv: regCvv })
            };
            const result = await authRegister(userData);
            if (result.success) {
                setRegStep(3);
                hideModal('registerProfile');
                showModal('otpModal');
            } else {
                setRegError(result.error);
            }
        } catch (err) {
            setRegError('Registration failed');
        } finally {
            setRegLoading(false);
        }
    };

    // Registration Step 3: OTP Verification
    const handleRegistrationOtpVerify = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegLoading(true);
        const otpString = regOtp.join('');
        try {
            const result = await authVerifyOtp(regEmail, otpString);
            if (result.success) {
                hideModal('otpModal');
                toast.success("You are Verified!");
                
                // Get user data for auto-login
                const userData = result.data?.user || result.data?.data?.user;
                if (userData) {
                    authLogin(userData);
                }

                setRegStep(1);
                setRegCardNumber('');
                setRegCvv('');
                setRegLanguage('English');
                setRegConfirmPassword('');
                setRegUsername('');
                setRegEmail('');
                setRegPhone('');
                setRegPassword('');
                setRegOtp(['', '', '', '']);
                navigate('/');
            } else {
                setRegError(result.error);
            }
        } catch (err) {
            setRegError('Verification failed');
        } finally {
            setRegLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const email = regEmail || forgotEmail;
        if (!email) {
            toast.error("Email not found. Please start again.");
            return;
        }

        setRegLoading(true);
        setForgotLoading(true);
        setRegError('');
        setForgotError('');

        try {
            const result = await authResendOtp(email);
            if (result.success) {
                toast.success("New OTP sent successfully!");
                // Optionally start a timer here
            } else {
                const errMsg = result.error || "Failed to resend OTP";
                if (regEmail) setRegError(errMsg);
                else setForgotError(errMsg);
                toast.error(errMsg);
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setRegLoading(false);
            setForgotLoading(false);
        }
    };

    const hideModal = (id) => {
        const modalEl = document.getElementById(id);
        if (modalEl) {
            const modal = window.bootstrap?.Modal?.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
            modal.hide();
        }
    };

    const showModal = (id) => {
        const modalEl = document.getElementById(id);
        if (modalEl) {
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
        }
    };

    const handleRegOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...regOtp];
        newOtp[index] = element.value.substring(0, 1);
        setRegOtp(newOtp);
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleRegOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!regOtp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleLogout = () => {
        // redirect before clearing so protected routes don’t bounce
        navigate('/');
        authLogout();
    };

    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, []);



    // Mobile view no scroll
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [menuOpen]);

    //   const [open, setOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 70);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);




    return (
        <>
            {/* <nav className="navbar navbar-expand-lg navbar-light-box"> */}
            <header className={`tp-header-section ${isSticky ? "tp-header-sticky" : ""}`}>
                <nav ref={headerRef}
                    className="navbar navbar-expand-lg navbar-light-box">
                    <div className="container">
                        <NavLink className="navbar-brand me-0" to="/">
                            <img src={settings.logoUrl || "/Logo.png"} alt={settings.siteName || "Logo"} className="logo-img" />
                        </NavLink>

                        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                            <span className="navbar-toggler-icon" />
                        </button>

                        <div
                            className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
                            id="navbarSupportedContent"
                        >
                            <div className="mobile-close-btn d-lg-none">
                                <FontAwesomeIcon icon={faTimes} onClick={closeMenu} />
                            </div>

                            <ul className="navbar-nav mx-auto mb-2 navbar-menu-list">
                                <li className="nav-item">
                                    <NavLink to="/" end className="nav-link" onClick={closeMenu}>
                                        Home
                                    </NavLink>
                                </li>




                                <li className="nav-item">
                                    <NavLink to="/available-courses" className="nav-link" href="#" onClick={closeMenu}>
                                        Courses
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/faq" className="nav-link" href="#" onClick={closeMenu}>
                                        FAQ
                                    </NavLink>
                                </li>

                                {/* <li className="nav-item">
                                    <NavLink to="/feedback" className="nav-link" onClick={closeMenu}>
                                        Feedback
                                    </NavLink>
                                </li> */}

                                <li className="nav-item">
                                    <NavLink to="/contact-us" className="nav-link" href="#" onClick={closeMenu}>
                                        Contact
                                    </NavLink>
                                </li>
                            </ul>

                            <div className="d-flex align-items-center gap-2 flex-wrap mobile-side-box">



                                {isAuthenticated ? (
                                    <>
                                        <span className="text-dark me-3">
                                            <FaUser className="me-1" /> {user?.username || 'User'}
                                        </span>
                                        <button className="thm-btn outline" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="thm-btn" data-bs-toggle="modal" data-bs-target="#loginModal" onClick={closeMenu}>
                                            <FaUser className="me-1" /> Login
                                        </button>
                                        <button className="thm-btn outline" data-bs-toggle="modal" data-bs-target="#register" onClick={closeMenu}>
                                            Register Here
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>


            {/* Mobile overlay */}
            {menuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}

            {/*Login Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#loginModal" */}
            <div className="modal step-modal fade" id="loginModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ zIndex: 9999 }}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content custom-modal-box p-0 rounded-0">
                        <div className="text-end">
                        </div>
                        <div className="modal-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="admin-picture-box">
                                        <img src="/auth_banner.png" alt="" />
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="text-end pe-3 pt-3">
                                        <button type="button" className="modal-close-btn text-black fz-18" data-bs-dismiss="modal" aria-label="Close">
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>

                                    <div className="login-container">
                                        <div className="login-header-content">
                                            <div className="lg_sub_content">
                                                <h4>Log in to your {settings.siteName || "Udemy Clone"} Account</h4>
                                            </div>

                                            <form onSubmit={handleLogin}>
                                                {error && (
                                                    <div className="alert alert-danger mb-3">
                                                        {error}
                                                    </div>
                                                )}
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="email"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter Email ID"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEnvelope} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="custom-frm-bx">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter Password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button
                                                            type="button"
                                                            className="pass-eye-btn"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className='col-lg-12'>
                                                    <div className='d-flex align-items-start justify-content-between'>
                                                        <div className='term-check-box'>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <input type="checkbox" id="check1" className="custom-checkbox" />
                                                                <label htmlFor="check1" className='remember-title mb-0'>Remember Me</label>
                                                            </div>
                                                        </div>
 
                                                        <div className=''>
                                                            <NavLink to="/forgot-password" className='reset-pass-btn' data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">Forgot Password?</NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="my-4">
                                                    <div>
                                                        <button
                                                            type="submit"
                                                            className="nw-thm-btn w-100"
                                                            disabled={loading}
                                                        >
                                                            {loading ? "Logging in..." : "Login"}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="udemy-tp-line">

                                                    <p>Don't have an account?
                                                        <button
                                                            type="button"
                                                            className="udemy-back-login"
                                                            data-bs-dismiss="modal"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#register"
                                                        >
                                                            Sign-up
                                                        </button>
                                                    </p>
                                                </div>


                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Set Password End */}

            {/*Forgot Password Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#forgotPasswordModal" */}
            <div className="modal step-modal fade" id="forgotPasswordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ zIndex: 9999 }}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content custom-modal-box p-0 rounded-0">
                        <div className="text-end">
                        </div>
                        <div className="modal-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="admin-picture-box">
                                        <img src="/auth_banner.png" alt="" />
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="text-end pe-3 pt-3">
                                        <button type="button" className="modal-close-btn text-black fz-18" data-bs-dismiss="modal" aria-label="Close">
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>

                                    <div className="login-container">
                                        <div className="login-header-content">
                                            <div className="lg_sub_content">
                                                <h6>Forgot Password</h6>
                                                <h4>Enter your Email Address for Verification</h4>
                                            </div>

                                            <form onSubmit={handleForgotPassword}>
                                                {forgotError && <div className="alert alert-danger">{forgotError}</div>}
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="email"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter Email Id"
                                                        required
                                                        value={forgotEmail}
                                                        onChange={(e) => setForgotEmail(e.target.value)}
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEnvelope} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="my-4">
                                                    <div>
                                                        <button type="submit" className="nw-thm-btn w-100" disabled={forgotLoading}>
                                                            {forgotLoading ? 'Loading...' : "Continue"}
                                                        </button>
                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#loginModal">Back</a>
                                                        </div>
                                                    </div>
                                                </div>


                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Forgot Password End */}


            {/*Register Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#register" */}
            <div className="modal step-modal fade" id="register" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ zIndex: 9999 }}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content custom-modal-box p-0 rounded-0">
                        <div className="text-end">

                        </div>
                        <div className="modal-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="admin-picture-box">
                                        <img src="/auth_banner.png" alt="" />
                                    </div>

                                </div>
                                <div className="col-lg-6">

                                    <div className="text-end pe-3 pt-3">
                                        <button type="button" className="modal-close-btn text-black fz-18" data-bs-dismiss="modal" aria-label="Close">
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>

                                    <div className="login-container">
                                        <div className="login-header-content">
                                            <div className="lg_sub_content">
                                                <h4>Register to your {settings.siteName || "Udemy Clone"} Account</h4>
                                            </div>

                                            <form onSubmit={handleBasicInfoSubmit}>
                                                {regError && <div className="alert alert-danger">{regError}</div>}
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="email"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Email Address"
                                                        required
                                                        value={regEmail}
                                                        onChange={(e) => setRegEmail(e.target.value)}
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEnvelope} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Create Password"
                                                        required
                                                        value={regPassword}
                                                        onChange={(e) => setRegPassword(e.target.value)}
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button
                                                            type="button"
                                                            className="pass-eye-btn"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Confirm Password"
                                                        required
                                                        value={regConfirmPassword}
                                                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button
                                                            type="button"
                                                            className="pass-eye-btn"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="custom-frm-bx">
                                                    <select
                                                        className="form-control profile-control"
                                                        value={regLanguage}
                                                        onChange={(e) => setRegLanguage(e.target.value)}
                                                        required
                                                        style={{ appearance: 'auto' }}
                                                    >
                                                        <option value="English">English</option>
                                                        <option value="Kannada">Kannada</option>
                                                    </select>
                                                </div>

                                                <div className="mt-4">
                                                    <div>
                                                        <button type="submit" className="nw-thm-btn w-100">
                                                            Continue
                                                        </button>
                                                    </div>

                                                    <div className="my-3 text-center">
                                                        <a href="#" className="card-back-btn" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#loginModal">Back</a>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Register Popup End */}

            {/*Register Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#registerProfile" */}
            <div className="modal step-modal fade" id="registerProfile" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ zIndex: 9999 }}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content custom-modal-box p-0 rounded-0">
                        <div className="text-end">

                        </div>
                        <div className="modal-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="admin-picture-box">
                                        <img src="/auth_banner.png" alt="" />
                                    </div>

                                </div>
                                <div className="col-lg-6">

                                    <div className="text-end pe-3 pt-3">
                                        <button type="button" className="modal-close-btn text-black fz-18" data-bs-dismiss="modal" aria-label="Close">
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>

                                    <div className="login-container">
                                        <div className="login-header-content">
                                            <div className="lg_sub_content">
                                                <h4>AI Card Details (Optional)</h4>
                                                <p className="text-muted fz-14 mt-1">If you have an AI card, enter details below. Otherwise, you can skip this step.</p>
                                            </div>

                                            <form onSubmit={(e) => handleRegistration(e, false)}>
                                                {regError && <div className="alert alert-danger">{regError}</div>}
                                                <div className='row'>
                                                    <div className='col-lg-12'>
                                                        <div className="custom-frm-bx">
                                                            <input
                                                                type="text"
                                                                className="form-control profile-control"
                                                                placeholder="Card Number"
                                                                value={regCardNumber}
                                                                onChange={(e) => setRegCardNumber(e.target.value)}
                                                            />
                                                            <div className="pass-toggle-box">
                                                                <button type="button" className="pass-eye-btn"> <BsCreditCardFill />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='col-lg-12'>
                                                        <div className="custom-frm-bx">
                                                            <input
                                                                type="text"
                                                                className="form-control profile-control"
                                                                placeholder="CVV"
                                                                value={regCvv}
                                                                onChange={(e) => setRegCvv(e.target.value)}
                                                            />
                                                            <div className="pass-toggle-box">
                                                                <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faLock} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div className="d-flex gap-3">
                                                            <button 
                                                                type="button" 
                                                                className="nw-thm-btn outline w-100" 
                                                                onClick={(e) => handleRegistration(e, true)}
                                                                disabled={regLoading}
                                                            >
                                                                Skip
                                                            </button>
                                                            <button type="submit" className="nw-thm-btn w-100" disabled={regLoading}>
                                                                {regLoading ? 'Processing...' : 'Verify & Continue'}
                                                            </button>
                                                        </div>

                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#register">Back</a>
                                                        </div>
                                                    </div>




                                                </div>





                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Register Popup End */}


            {/*Otp Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#otpModal" */}
            <div className="modal step-modal fade" id="otpModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ zIndex: 9999 }}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content custom-modal-box p-0 rounded-0">
                        <div className="text-end">
                        </div>
                        <div className="modal-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="admin-picture-box">
                                        <img src="/auth_banner.png" alt="" />
                                    </div>
                                </div>
                                <div className="col-lg-6">

                                    <div className="text-end pe-3 pt-3">
                                        <button type="button" className="modal-close-btn text-black fz-18" data-bs-dismiss="modal" aria-label="Close">
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>

                                    <div className="login-container">
                                        <div className="login-header-content">
                                            <div className="lg_sub_content">
                                                <h6>Enter Verification</h6>
                                                <h4>Enter the OTP sent to <span className="verify-email-title"> {regEmail || forgotEmail || 'your email'}</span> to continue.</h4>

                                            </div>

                                            <form onSubmit={regEmail ? handleRegistrationOtpVerify : handleVerifyOtp}>
                                                <div className='row'>
                                                    {(forgotError || regError) && (
                                                        <div className="alert alert-danger mb-3">
                                                            {forgotError || regError}
                                                        </div>
                                                    )}
                                                    <div className="col-lg-12">
                                                        <div className="otp-wrapper custom-frm-bx">
                                                            {(regEmail ? regOtp : forgotOTP).map((data, index) => {
                                                                return (
                                                                    <input
                                                                        className="otp-input"
                                                                        type="text"
                                                                        name="otp"
                                                                        maxLength="1"
                                                                        key={index}
                                                                        value={data}
                                                                        onChange={e => regEmail ? handleRegOtpChange(e.target, index) : handleOtpChange(e.target, index)}
                                                                        onFocus={e => e.target.select()}
                                                                        onKeyDown={e => regEmail ? handleRegOtpKeyDown(e, index) : handleOtpKeyDown(e, index)}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div>
                                                            <button type="submit" className="nw-thm-btn w-100" disabled={regLoading || forgotLoading}>
                                                                {regLoading || forgotLoading ? 'Verifying...' : 'Continue'}
                                                            </button>
                                                        </div>

                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target={regEmail ? "#registerProfile" : "#forgotPasswordModal"} >Back</a>
                                                        </div>
                                                    </div>

                                                    <div className="udemy-tp-line border-top-0">

                                                        <p>Didn't receive the code? <button type="button" onClick={handleResendOtp} className="udemy-back-login border-0 bg-transparent">Resend</button> </p>
                                                    </div>

                                                </div>
                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Otp Popup End */}

            {/*Set Password Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#setPasswordModal" */}
            <div className="modal step-modal fade" id="setPasswordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ zIndex: 9999 }}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content custom-modal-box p-0 rounded-0">
                        <div className="text-end">
                        </div>
                        <div className="modal-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="admin-picture-box">
                                        <img src="/auth_banner.png" alt="" />
                                    </div>
                                </div>
                                <div className="col-lg-6">

                                    <div className="text-end pe-3 pt-3">
                                        <button type="button" className="modal-close-btn text-black fz-18" data-bs-dismiss="modal" aria-label="Close">
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>

                                    <div className="login-container">
                                        <div className="login-header-content">
                                            <div className="lg_sub_content">
                                                <h6>Set Your Login Details</h6>
                                                <h4>Create a username and password to securely access your AI course.</h4>

                                            </div>

                                            <form onSubmit={handleResetPassword}>
                                                {forgotError && <div className="alert alert-danger">{forgotError}</div>}
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter New Password (min 6 chars)"
                                                        required
                                                        value={forgotNewPassword}
                                                        onChange={(e) => setForgotNewPassword(e.target.value)}
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button
                                                            type="button"
                                                            className="pass-eye-btn"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="custom-frm-bx mb-1" >
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Confirm Password"
                                                        required
                                                        value={forgotConfirmPassword}
                                                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button
                                                            type="button"
                                                            className="pass-eye-btn"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                        </button>
                                                    </div>
                                                </div>


                                                <div className="mt-4">
                                                    <div>
                                                        <button type="submit" className="nw-thm-btn w-100" disabled={forgotLoading}>
                                                            {forgotLoading ? "Loading..." : "Continue"}
                                                        </button>
                                                    </div>

                                                </div>


                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Set Password End */}







        </>
    );
};

export default Header;
