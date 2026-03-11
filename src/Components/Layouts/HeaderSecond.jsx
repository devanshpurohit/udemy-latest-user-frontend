import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightToBracket, faBell, faBorderAll, faCheck, faChevronDown, faChevronUp, faClose, faEnvelope, faEye, faKitMedical, faLocationCrosshairs, faLocationDot, faPhone, faSearch, faTimes, faUser, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FaUser } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { BsCreditCardFill } from "react-icons/bs";
import { IoInformationCircle } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { IoBook } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { isLoggedIn, getStoredUser, logout, login as authLogin, forgotPassword as authForgotPassword, verifyOtp as authVerifyOtp, resetPassword as authResetPassword } from "../../services/authService";
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from "react-router-dom";


const HeaderSecond = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const { logout: authLogout, user: authUser, isAuthenticated } = useAuth();
    const location = useLocation();

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOTP, setForgotOTP] = useState(['', '', '', '']);
    const [forgotNewPassword, setForgotNewPassword] = useState('');
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotLoading(true);
        try {
            const result = await authForgotPassword(forgotEmail);
            if(result.success) {
                const forgotModal = window.bootstrap?.Modal?.getInstance(document.getElementById('htmlForgotPasswordModal'));
                if(forgotModal) forgotModal.hide();
                const otpModal = new window.bootstrap.Modal(document.getElementById('otpEmailModal'));
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
                const otpModalEl = document.getElementById('otpEmailModal');
                const otpModal = window.bootstrap?.Modal?.getInstance(otpModalEl);
                if(otpModal) otpModal.hide();
                const setPasswordModal = new window.bootstrap.Modal(document.getElementById('NewPasswordModal'));
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
                const setPasswordModalEl = document.getElementById('NewPasswordModal');
                const setPasswordModal = window.bootstrap?.Modal?.getInstance(setPasswordModalEl);
                if(setPasswordModal) setPasswordModal.hide();
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
    useEffect(() => {
        setUserDropdownOpen(false);
    }, [location]);

    // Load cart items from localStorage
    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
    }, []);
useEffect(() => {

    const updateCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
    };

    window.addEventListener("cartUpdated", updateCart);

    return () => {
        window.removeEventListener("cartUpdated", updateCart);
    };

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
    const userDropdownRef = useRef(null);
    const headerRef = useRef(null);



    useEffect(() => {

        // Check if user is logged in

        if (isLoggedIn()) {
            const userData = getStoredUser();
            setUser(userData);
            console.log('👤 User loaded in HeaderSecond:', userData);
        }

    }, []);

    // Sync with AuthContext changes
    useEffect(() => {
        if (!isAuthenticated) {
            setUser(null);
            setUserDropdownOpen(false);
        } else if (authUser) {
            setUser(authUser);
        }
    }, [isAuthenticated, authUser]);



    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        setCatOpen(false);
        setUserDropdownOpen(false);
    };



    const closeMenu = () => {

        setMenuOpen(false);

        setCatOpen(false);

        setUserDropdownOpen(false);

    };



    const handleLogout = () => {
        console.log("🚪 Logout clicked");
        // navigate first so ProtectedRoute won’t trigger a redirect to /login
        navigate("/", { replace: true });  // Redirect to home page
        // then clear auth state
        authLogout();     // Update AuthContext state
        setUser(null);    // state reset
        setUserDropdownOpen(false);
    };



    useEffect(() => {

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setCatOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };


        document.addEventListener("mousedown", handleClickOutside);

        return () => {

            document.removeEventListener("mousedown", handleClickOutside);

        };

    }, []);



    const [open, setOpen] = useState(false);

    const [isFixed, setIsFixed] = useState(false);
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





    // Get user data for display

    const getUserDisplayName = () => {

        if (!user) return 'Guest';



        // Try different ways to get user name

        if (user.name) return user.name;

        if (user.email) {

            const emailParts = user.email.split('@');

            return emailParts[0]; // Return part before @

        }

        if (user.id) return `User ${user.id}`;

        return 'User';

    };

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

                                    <NavLink className="nav-link" to="/faq" onClick={closeMenu}>

                                        FAQ

                                    </NavLink>

                                </li>



                                <li className="nav-item">

                                    <NavLink className="nav-link" to="/contact-us" onClick={closeMenu}>

                                        Contact Us

                                    </NavLink>

                                </li>

                            </ul>



                            <div className="d-flex align-items-center flex-wrap gap-2">
                                {user ? (

                                    <>
                                        <div>
                                            <NavLink to="/add-cart" className="nw-custom-btn nw-bell-btn position-relative">
                                                <FaCartShopping />
                                                {cartItems.length > 0 && (
                                                    <div className="cart-box">
                                                        <span className="cart-title">{cartItems.length}</span>
                                                    </div>
                                                )}
                                            </NavLink>
                                        </div>

                                        <div>
                                            <div className="d-flex align-items-center gap-2 tp-right-admin-bx">
                                                <div className="d-flex align-items-centet gap-2">
                                                    <div className="dropdown">
                                                        <a
                                                            href="#"
                                                            className="nw-custom-btn"
                                                            id="acticonMenu"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >

                                                            <FontAwesomeIcon icon={faBell} />

                                                            <div className="cart-box">
                                                                <span className="cart-title">1</span>
                                                            </div>

                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>




                                        <div
                                            ref={userDropdownRef}
                                            className="header-user dropdown tp-right-admin-details d-flex align-items-center"
                                            style={{ position: 'relative' }}
                                        >
                                            <a
                                                href="#"
                                                className="user-toggle d-flex align-items-center"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log("👤 User dropdown clicked, current state:", userDropdownOpen);
                                                    setUserDropdownOpen((prev) => {
                                                        console.log("👤 Setting user dropdown to:", !prev);
                                                        return !prev;
                                                    });
                                                }}
                                            >
                                                <div className="admn-icon me-2">
                                                    {user?.profile?.profileImage ? (
                                                        <img
                                                            src={
                                                                user.profile.profileImage.startsWith("data:")
                                                                    ? user.profile.profileImage
                                                                    : `${user.profile.profileImage}?t=${Date.now()}`
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="generic-user-icon">
                                                            <FontAwesomeIcon icon={faUser} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="profile-info me-1">
                                                    <h4 className="profile-name">Welcome</h4>
                                                    <p className="profile-id">{getUserDisplayName()}</p>
                                                </div>
                                                <FontAwesomeIcon
                                                    icon={userDropdownOpen ? faChevronUp : faChevronDown}
                                                    className="location-active-icon"
                                                />
                                            </a>

                                            <ul className={`dropdown-menu dropdown-menu-end user-dropdown sallr-drop-box  hp-dropdown-box p-0 ${userDropdownOpen ? "show" : ""}`}
                                                style={{
                                                    display: userDropdownOpen ? 'block' : 'none',
                                                    position: 'absolute',
                                                    top: 'calc(100% + 5px)',
                                                    right: '0',
                                                    zIndex: '1050',
                                                    minWidth: '200px',
                                                    transform: 'translateX(0)'
                                                }}
                                            >
                                                <li className="prescription-item">
                                                    <NavLink
                                                        to="/my-account"
                                                        className="dropdown-item prescription-nav"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        My Account
                                                    </NavLink>
                                                </li>
                                                <li className="prescription-item">
                                                    <NavLink
                                                        to="/my-dashboard"
                                                        className="dropdown-item prescription-nav"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        My Dashboard
                                                    </NavLink>
                                                </li>
                                                <li className="prescription-item">
                                                    <NavLink
                                                        to="/my-wishlist"
                                                        className="dropdown-item prescription-nav"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        Wishlist
                                                    </NavLink>
                                                </li>
                                                {/* logout now handled via modal to confirm */}
                                                {/* keep only modal trigger below, not immediate logout */}
                                                <li className="prescription-item">
                                                    <a href="#" className="dropdown-item prescription-nav" data-bs-toggle="modal" data-bs-target="#logout">
                                                        Logout
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    // Not logged in - show login/register buttons and cart
                                    <>
                                        <div>
                                            {/* <NavLink to="/add-cart" className="nw-custom-btn nw-bell-btn position-relative me-2">
                                            <FaCartShopping />
                                            {cartItems.length > 0 && (
                                                <div className="cart-box">
                                                    <span className="cart-title">{cartItems.length}</span>
                                                </div>
                                            )}
                                        </NavLink> */}
                                        </div>
                                        <NavLink to="/login" className="thm-btn">
                                            <FaUser className="me-1" />   Login
                                        </NavLink>
                                        <NavLink to="/register" className="thm-btn outline">
                                            Register Here
                                        </NavLink>
                                    </>
                                )}
                            </div>

                        </div>

                    </div>

                </nav>
                {menuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
            </header>







            {/*Login Popup Start  */}

            {/* data-bs-toggle="modal" data-bs-target="#loginModal" */}

            <div className="modal step-modal fade" id="loginModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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



                                            <form action="">

                                                <div className="custom-frm-bx">

                                                    <input

                                                        type="text"

                                                        className="form-control profile-control pe-5"

                                                        placeholder="Enter Username"

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



                                                <div className='col-lg-12'>

                                                    <div className='d-flex align-items-start justify-content-between'>

                                                        <div className='term-check-box'>

                                                            <div className="d-flex align-items-center gap-2">

                                                                <input type="checkbox" id="check1" className="custom-checkbox" />

                                                                <label htmlFor="check1" className='remember-title mb-0'>Remember Me</label>

                                                            </div>

                                                        </div>



                                                        <div className=''>

                                                            <NavLink to="/htmlForgot-password" className='reset-pass-btn' data-bs-toggle="modal" data-bs-target="#htmlForgotPasswordModal">Forgot Password?</NavLink>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="my-4">

                                                    <div>

                                                        <button className="nw-thm-btn w-100">Login</button>

                                                    </div>

                                                </div>

                                                <div className="udemy-tp-line">



                                                    <p>Don't have an account? <a href="#" className="udemy-back-login" data-bs-toggle="modal" data-bs-target="#login">Sign-up</a> </p>

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

            {/* data-bs-toggle="modal" data-bs-target="#htmlForgotPasswordModal" */}

            <div className="modal step-modal fade" id="htmlForgotPasswordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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

                                                <h4>Enter your Email Address htmlFor Verification</h4>

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
                                                            {forgotLoading ? 'Loading...' : 'Continue'}
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









            {/*Login Popup Start  */}

            {/* data-bs-toggle="modal" data-bs-target="#login" */}

            <div className="modal step-modal fade" id="login" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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

                                                    <span className="card-info-title">

                                                        <IoInformationCircle /> Check your AI Card for these details.

                                                    </span>                                            </div>



                                                <div className="my-5">

                                                    <button type="button" className="nw-thm-btn w-100" data-bs-toggle="modal" data-bs-target="#registerProfile">Continue</button>

                                                </div>



                                                <div className="udemy-tp-line">

                                                    <p>Already registered your AI Card? <a href="#" className="udemy-back-login" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a> </p>

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

            <div className="modal step-modal fade" id="register" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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

                                                    <p>Already registered your AI Card? <a href="#" className="udemy-back-login">Login</a> </p>

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

            <div className="modal step-modal fade" id="registerProfile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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

                                                                type="email"

                                                                className="form-control profile-control"

                                                                placeholder="Email Address"



                                                            />



                                                            <div className="pass-toggle-box">

                                                                <button type="button" className="pass-eye-btn">  <FontAwesomeIcon icon={faEnvelope} />

                                                                </button>

                                                            </div>

                                                        </div>

                                                    </div>



                                                    <div className='col-lg-12'>

                                                        <div className="custom-frm-bx">

                                                            <div className="login-custm-bx">

                                                                <select

                                                                    name="countryCode"

                                                                    id="countryCode"

                                                                    className="country-code "

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

                                                                    className="form-control border-0 px-0 profile-control"



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

            <div className="modal step-modal fade" id="otpModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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

            <div className="modal step-modal fade" id="setPasswordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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

            <div className="modal step-modal fade" id="otpEmailModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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



                                            <form onSubmit={handleVerifyOtp}>
                                                <div className='row'>
                                                    {forgotError && <div className="alert alert-danger">{forgotError}</div>}
                                                    <div className="col-lg-12">
                                                        <div className="otp-wrapper custom-frm-bx">
                                                            {forgotOTP.map((data, index) => {
                                                                return (
                                                                    <input
                                                                        className="otp-input"
                                                                        type="text"
                                                                        name="otp"
                                                                        maxLength="1"
                                                                        key={index}
                                                                        value={data}
                                                                        onChange={e => handleOtpChange(e.target, index)}
                                                                        onFocus={e => e.target.select()}
                                                                        onKeyDown={e => handleOtpKeyDown(e, index)}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div>
                                                            <button type="submit" className="nw-thm-btn w-100" disabled={forgotLoading}>
                                                                {forgotLoading ? 'Verifying...' : 'Continue'}
                                                            </button>
                                                        </div>

                                                        <div className="my-3 text-center">
                                                            <a href="#" className="card-back-btn" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#htmlForgotPasswordModal" >Back</a>
                                                        </div>
                                                    </div>

                                                    <div className="udemy-tp-line border-top-0">
                                                        <p>Didn't receive the code? <button type="button" onClick={handleForgotPassword} className="udemy-back-login border-0 bg-transparent">Resend</button> </p>
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

            <div className="modal step-modal fade" id="NewPasswordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

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



                                            <form onSubmit={handleResetPassword}>
                                                {forgotError && <div className="alert alert-danger">{forgotError}</div>}
                                                <div className="custom-frm-bx">
                                                    <input
                                                        type="password"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Enter New Password (min 6 chars)"
                                                        required
                                                        value={forgotNewPassword}
                                                        onChange={(e) => setForgotNewPassword(e.target.value)}
                                                    />
                                                    <div className="pass-toggle-box">
                                                        <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="custom-frm-bx mb-1">
                                                    <input
                                                        type="password"
                                                        className="form-control profile-control pe-5"
                                                        placeholder="Confirm Password"
                                                        required
                                                        value={forgotConfirmPassword}
                                                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="mt-4">
                                                    <div>
                                                        <button type="submit" className="nw-thm-btn w-100" disabled={forgotLoading}>
                                                            {forgotLoading ? "Loading..." : "Continue"}
                                                        </button>
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









            {/*Logout Popup Start  */}

            {/* data-bs-toggle="modal" data-bs-target="#logout" */}

            <div className="modal step-modal fade" id="logout" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"

                aria-labelledby="staticBackdropLabel" aria-hidden="true">

                <div className="modal-dialog modal-dialog-centered modal-md">

                    <div className="modal-content custom-modal-box">

                        <div className="text-end">

                            <button type="button" className="modal-close-btn" data-bs-dismiss="modal" aria-label="Close">

                                <FontAwesomeIcon icon={faClose} />

                            </button>

                        </div>

                        <div className="modal-body pt-0">

                            <div className="row">

                                <div className="col-lg-12">

                                    <div className="logout-bx text-center" >

                                        <span className="logout-icon"><FiLogOut /></span>

                                        <p className="py-2">Are you sure you want to log out of your account?</p>



                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3">

                                            <button className="thm-lg-dg-btn outline" data-bs-dismiss="modal" aria-label="Close">Cancel</button>

                                            <button className="thm-lg-dg-btn" data-bs-dismiss="modal" aria-label="Close" onClick={handleLogout}>Logout</button>

                                        </div>



                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/*  Logout Popup End */}


        </>

    );

};



export default HeaderSecond;

