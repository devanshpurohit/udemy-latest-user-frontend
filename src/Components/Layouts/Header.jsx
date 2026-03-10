import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faClose, faEnvelope, faEye, faPhone, faTimes, faUser, faShoppingCart, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FaUser } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { BsCreditCardFill } from "react-icons/bs";
import { IoInformationCircle } from "react-icons/io5";
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../services/authService';



const Header = () => {
    const { isAuthenticated, user, logout: authLogout, login: authLogin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

                // Navigate to dashboard
                navigate('/home-second');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
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

    useEffect(() => {
        const handleScroll = () => {
            setIsFixed(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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
                            <img src="/Logo.png" alt="Logo" className="logo-img" />
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
                                    <NavLink to="/" className="nav-link" onClick={closeMenu}>
                                        Home
                                    </NavLink>
                                </li>




                                <li className="nav-item">
                                    <NavLink to="/my-course" className="nav-link" href="#" onClick={closeMenu}>
                                        Course
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/faq" className="nav-link" href="#" onClick={closeMenu}>
                                        FAQ
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/contact-us" className="nav-link" href="#" onClick={closeMenu}>
                                        Contact Us
                                    </NavLink>
                                </li>
                            </ul>

                            <div className="d-flex align-items-center gap-2 flex-wrap">



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
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                                <h4>Log in to your websitename Account</h4>
                                            </div>

                                            <form onSubmit={handleLogin}>
                                                {error && (
                                                    <div className="alert alert-danger mb-3">
                                                        {error}
                                                    </div>
                                                )}
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="text"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter Username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faUser} />
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
                                                            {loading ? 'Logging in...' : 'Login'}
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
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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

                                            <form action="">
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="email"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter Email Id"
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEnvelope} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="my-4">
                                                    <div>
                                                        <button type="button" className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#otpEmailModal" >Continue</button>
                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-toggle="modal" data-bs-target="#loginModal">Back</a>
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

            {/*Login Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#login" */}
            <div className="modal step-modal fade" id="login" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                                <h4>Register your AI Card and unlock a smarter way to learn</h4>
                                            </div>

                                            <form action="">
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="number"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter 12 Digit Card Number"
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <BsCreditCardFill />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="password"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="CVV Number"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="card-info-title"><IoInformationCircle />  Check your AI Card for these details.</span>
                                                </div>

                                                <div className="my-5">
                                                    <button type="button" className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#registerProfile">Continue</button>
                                                </div>

                                                <div className="udemy-tp-line">
                                            <button
  type="button"
  className="udemy-back-login"
  data-bs-dismiss="modal"
  data-bs-toggle="modal"
  data-bs-target="#loginModal"
>
  Login
</button>
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
            {/*  Login Popup End */}

            {/*Register Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#register" */}
            <div className="modal step-modal fade" id="register" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                                <h4>Register to your website name Account</h4>
                                            </div>

                                            <form action="">
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="number"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter 12 Digit Card Number"
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <BsCreditCardFill />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="custom-frm-bx mb-2">
                                                    <input
                                                        type="password"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="CVV Number"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <span className="card-already-title">Your AI Card is already registered. Log in to continue.</span>
                                                </div>

                                                <div className="mt-5">
                                                    <div>
                                                        <button className="nw-thm-btn w-100 udemy-not-btn">Continue</button>
                                                    </div>

                                                    <div className="my-3 text-center">
                                                        <a href="#" className="card-back-btn">Back</a>
                                                    </div>
                                                </div>

                                                <div className="udemy-tp-line">
                                                    <p>Already registered your AI Card? <button
type="button"
className="udemy-back-login"
data-bs-dismiss="modal"
data-bs-toggle="modal"
data-bs-target="#loginModal"
>
Login
</button> </p>
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
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                                <h4>Complete Your Profile</h4>
                                            </div>

                                            <form action="">
                                                <div className='row'>
                                                    <div className='col-lg-6'>
                                                        <div className="custom-frm-bx">
                                                            <input
                                                                type="text"
                                                                className="form-control profile-control"
                                                                placeholder="First Name"
                                                            />

                                                        </div>
                                                    </div>

                                                    <div className='col-lg-6'>
                                                        <div className="custom-frm-bx">
                                                            <input
                                                                type="text"
                                                                className="form-control profile-control"
                                                                placeholder="Last Name"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='col-lg-12'>
                                                        <div className="custom-frm-bx">
                                                            <input
                                                                type="enail"
                                                                className="form-control profile-control"
                                                                placeholder="Country"
                                                            />

                                                            <div className="pass-toggle-box">
                                                                <button type="button" className="pass-eye-btn">  <FontAwesomeIcon icon={faEnvelope} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='col-lg-12'>
                                                        <div class="custom-frm-bx">
                                                            <div class="login-custm-bx">
                                                                <select
                                                                    name="countryCode"
                                                                    id="countryCode"
                                                                    class="country-code "
                                                                >
                                                                    <option value="+91">+91</option>
                                                                    <option value="+1">+1</option>
                                                                    <option value="+44">+44</option>
                                                                    <option value="+971">+971</option>
                                                                </select>

                                                                <input
                                                                    type="tel"
                                                                    id="mobileNumber"
                                                                    placeholder="Mobile Number"
                                                                    class="form-control border-0 px-0 profile-control"

                                                                />
                                                            </div>

                                                            <div className="pass-toggle-box">
                                                                <button type="button" className="pass-eye-btn">  <FontAwesomeIcon icon={faPhone} />
                                                                </button>
                                                            </div>

                                                        </div>

                                                    </div>

                                                    <div className="mt-4">
                                                        <div>
                                                            <button type="button" className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#otpModal">Continue</button>
                                                        </div>

                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-toggle="modal" data-bs-target="#login">Back</a>
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
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                                <h4>Enter the OTP sent to <span className="verify-email-title"> xyz@gmail.com</span> to continue.</h4>

                                            </div>

                                            <form action="">
                                                <div className='row'>
                                                    <div className="col-lg-12">
                                                        <div className="otp-wrapper custom-frm-bx">
                                                            <input type="number" className="otp-input" />
                                                            <input type="number" className="otp-input" />
                                                            <input type="number" className="otp-input" />
                                                            <input type="number" className="otp-input" />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div>
                                                            <button className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#setPasswordModal">Continue</button>
                                                        </div>

                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-toggle="modal" data-bs-target="#registerProfile" >Back</a>
                                                        </div>
                                                    </div>

                                                    <div className="udemy-tp-line border-top-0">

                                                        <p>Didn't receive the code? <a href="#" className="udemy-back-login">Resend</a> <span className="resend-title">in 30s</span> </p>
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
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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

                                            <form action="">

                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="text"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="XYZ"
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faUser} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="text"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter 6 digit Password"
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="custom-frm-bx mb-1" >
                                                    <input
                                                        type="text"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Confirm Password"
                                                    />

                                                </div>

                                                <div className="text-end">
                                                    <span className="verify-title">Password Verified</span>
                                                </div>


                                                <div className="mt-4">
                                                    <div>
                                                        <button type="button" className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#login">Continue</button>
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

            {/*Otp Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#otpEmailModal" */}
            <div className="modal step-modal fade" id="otpEmailModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                                <h4>Enter the OTP sent to <span className="verify-email-title"> xyz@gmail.com</span> to continue.</h4>

                                            </div>

                                            <form action="">
                                                <div className='row'>
                                                    <div className="col-lg-12">
                                                        <div className="otp-wrapper custom-frm-bx">
                                                            <input type="number" className="otp-input" />
                                                            <input type="number" className="otp-input" />
                                                            <input type="number" className="otp-input" />
                                                            <input type="number" className="otp-input" />
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <div>
                                                            <button type="button" className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#NewPasswordModal">Continue</button>
                                                        </div>

                                                        <div className="my-2 text-center">
                                                          <button
type="button"
className="card-back-btn"
data-bs-dismiss="modal"
data-bs-toggle="modal"
data-bs-target="#loginModal"
>
Back
</button>
                                                        </div>
                                                    </div>

                                                    <div className="udemy-tp-line border-top-0">

                                                        <p>Didn't receive the code? <a href="#" className="udemy-back-login">Resend</a> <span className="resend-title">in 30s</span> </p>
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

            {/*Forgot Password Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#NewPasswordModal" */}
            <div className="modal step-modal fade" id="NewPasswordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                                                <h6>Secure Your Account</h6>
                                                <h4>Set a new password to keep your learning safe.</h4>
                                            </div>

                                            <form action="">
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="email"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter New Password"
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="email"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Confirm Password"
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="my-4">
                                                    <div>
                                                        <button type="button" className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#loginModal">Continue</button>
                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-toggle="modal" data-bs-target="#otpEmailModal" >Back</a>
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






        </>
    );
};

export default Header;
