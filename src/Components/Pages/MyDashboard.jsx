import { faDownload, faEye, faSearch, faStar, faStarHalf, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FaMoneyBill } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { MdBook, MdChevronLeft, MdChevronRight } from "react-icons/md";

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { getDashboardData } from '../../services/apiService';
import { getCurrentUser } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { getBackendBaseUrl } from '../../config/backendConfig';
import certificateService from "../../services/certificateService";
import { toast } from "react-toastify";
import { faClose } from "@fortawesome/free-solid-svg-icons";

function MyDashboard() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allCourses, setAllCourses] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        enrolledCourses: [],
        completedCourses: [],
        activeCourses: [],
        certificates: [],
        invoices: [],
        stats: {
            totalEnrolled: 0,
            totalActive: 0,
            totalCompleted: 0,
            totalQuizzes: 0
        }
    });

    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [viewingCertificate, setViewingCertificate] = useState(null);
    const [certificateLoading, setCertificateLoading] = useState(false);

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);

    const [currentCoursePage, setCurrentCoursePage] = useState(1);
    const [currentOrderPage, setCurrentOrderPage] = useState(1);
    const itemsPerPage = 8;

    // Search and Sort states
    const [certSearch, setCertSearch] = useState("");
    const [orderSearch, setOrderSearch] = useState("");

    useEffect(() => {
        // Use auth user instead of localStorage
        if (authUser) {
            console.log('🔍 Dashboard - User from auth context:', authUser);
            console.log('🔍 Dashboard - Profile image from auth context:', authUser?.profile?.profileImage);
            
            setUser(authUser);
            loadDashboardData();
            loadAllCourses();
        }
        setLoading(false);
    }, [authUser]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentOrderPage(1);
    }, [orderSearch]);

    useEffect(() => {
        setCurrentCoursePage(1);
    }, [certSearch]);

    const loadDashboardData = async () => {
        try {
            console.log('🔍 Loading dashboard data...');
            
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${getBackendBaseUrl()}/api/users/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            console.log('🔍 Dashboard API result:', data);
            
            if (data.success) {
                console.log('🔍 Setting dashboard data:', data);
                
                // DEBUG: Check image fields
                console.log('=== DEBUG: Frontend Courses ===');
                data.activeCourses.forEach((course, index) => {
                    console.log(`Course ${index + 1}:`, {
                        _id: course._id,
                        title: course.title,
                        image: course.image,
                        thumbnail: course.thumbnail,
                        courseImage: course.courseImage
                    });
                });
                
                // DEBUG: Check orders data
                console.log('=== DEBUG: Orders Data ===');
                console.log('Orders length:', data.orders?.length || 0);
                if (data.orders && data.orders.length > 0) {
                    data.orders.forEach((order, index) => {
                        console.log(`Order ${index + 1}:`, {
                            _id: order._id,
                            orderId: order.orderId,
                            courseId: order.courseId,
                            amount: order.amount,
                            paymentStatus: order.paymentStatus
                        });
                    });
                }
                
                // Use real data from API
                const realData = data;
                
                // Calculate stats from real data
                const stats = {
                    totalEnrolled: realData.enrolledCourses?.length || 0,
                    totalActive: realData.activeCourses?.length || 0,
                    totalCompleted: realData.allCourses?.length || 0,
                    totalQuizzes: data.stats?.totalQuizzes || 0
                };
                
                setDashboardData({
                    enrolledCourses: realData.enrolledCourses || [],
                    completedCourses: realData.allCourses || [],
                    activeCourses: realData.activeCourses || [],
                    certificates: realData.certificates || [],
                    orders: realData.orders || [],
                    stats: stats
                });
            } else {
                console.error('Dashboard data loading error:', data.message);
                // Set empty state
                setDashboardData({
                    enrolledCourses: [],
                    completedCourses: [],
                    activeCourses: [],
                    certificates: [],
                    orders: [],
                    stats: {
                        totalEnrolled: 0,
                        totalActive: 0,
                        totalCompleted: 0,
                        totalQuizzes: 0
                    }
                });
            }
        } catch (error) {
            console.error('Dashboard data loading error:', error);
            // Set empty state
            setDashboardData({
                enrolledCourses: [],
                completedCourses: [],
                activeCourses: [],
                certificates: [],
                orders: [],
                stats: {
                    totalEnrolled: 0,
                    totalActive: 0,
                    totalCompleted: 0,
                    totalQuizzes: 0
                }
            });
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<li key={`full-${i}`} className="rating-item"><a href="#" className="rating-text"> <FontAwesomeIcon icon={faStar} /> </a></li>);
        }

        if (hasHalfStar) {
            stars.push(<li key="half" className="rating-item"><a href="#" className="rating-text"> <FontAwesomeIcon icon={faStarHalf} /> </a></li>);
        }

        return stars;
    };

    const loadAllCourses = async () => {
        try {
            console.log('🔍 Loading all courses...');
            
            const res = await fetch(
                `${getBackendBaseUrl()}/api/public/courses`
            );

            const data = await res.json();

            if (data.success) {
                console.log('✅ All courses loaded:', data.data.length);
                setAllCourses(data.data);
            }
        } catch (error) {
            console.error('❌ Error loading courses:', error);
        }
    };

    const filteredCertificates = useMemo(() => {
        let result = [...(dashboardData.certificates || [])];
        
        // Search filter
        if (certSearch) {
            result = result.filter(cert => 
                cert.courseTitle?.toLowerCase().includes(certSearch.toLowerCase()) ||
                cert.certificateId?.toLowerCase().includes(certSearch.toLowerCase())
            );
        }

        // Default Sorting (Newest First)
        result.sort((a, b) => {
            const dateA = new Date(a.completedAt || a.issuedAt);
            const dateB = new Date(b.completedAt || b.issuedAt);
            return dateB - dateA;
        });

        return result;
    }, [dashboardData.certificates, certSearch]);

    const filteredOrders = useMemo(() => {
        let result = [...(dashboardData.orders || [])];

        // Search filter
        if (orderSearch) {
            result = result.filter(order => 
                order.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                order.courseId?.title?.toLowerCase().includes(orderSearch.toLowerCase())
            );
        }

        // Default Sorting (Newest First)
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });

        return result;
    }, [dashboardData.orders, orderSearch]);

    const paginatedCourses = useMemo(() => {
        const startIndex = (currentCoursePage - 1) * itemsPerPage;
        return allCourses.slice(startIndex, startIndex + itemsPerPage);
    }, [allCourses, currentCoursePage]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentOrderPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentOrderPage]);

    const totalCoursePages = Math.ceil(allCourses.length / itemsPerPage);
    const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handleViewOrder = (order) => {
        setViewingOrder(order);
        setShowOrderModal(true);
    };

    const handleCoursePageChange = (page) => {
        setCurrentCoursePage(page);
    };

    const handleOrderPageChange = (page) => {
        setCurrentOrderPage(page);
    };

    const handleViewCertificate = async (certificateId) => {
        try {
            setCertificateLoading(true);
            const response = await certificateService.getCertificate(certificateId);
            if (response.success) {
                setViewingCertificate(response.data.certificate);
                setShowCertificateModal(true);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to fetch certificate details");
        } finally {
            setCertificateLoading(false);
        }
    };

    const handleDownloadCertificate = async (certificateId) => {
        try {
            setCertificateLoading(true);
            const response = await certificateService.getCertificate(certificateId);
            if (response.success) {
                // If the backend returns a URL or we need to print, 
                // for now we'll just open the view modal and let them print
                // or if there's a specific download logic, implement it here.
                setViewingCertificate(response.data.certificate);
                setShowCertificateModal(true);
                toast.info("Opening certificate for download/print");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to download certificate");
        } finally {
            setCertificateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">My Dashboard</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="#" className="breadcrumb-link">
                                                        Home
                                                    </a>
                                                </li>
                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    My Dashboard
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

            <section className="dashboard-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 mb-3">
                            <div className="course-card card-space">
                                <div className="dashboard-tab">
                                    <ul
                                        className="nav nw-dashbard-tab-nav"
                                        id="myTab"
                                        role="tablist"
                                    >
                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link dash-nav-link active"
                                                id="home-tab"
                                                data-bs-toggle="tab"
                                                href="#home"
                                                role="tab"
                                            >
                                                Dashboard
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link dash-nav-link"
                                                id="profile-tab"
                                                data-bs-toggle="tab"
                                                href="#profile"
                                                role="tab"
                                            >
                                                All Courses
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link dash-nav-link"
                                                id="review-tab"
                                                data-bs-toggle="tab"
                                                href="#review"
                                                role="tab"
                                            >
                                                My Certificate
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link dash-nav-link"
                                                id="history-tab"
                                                data-bs-toggle="tab"
                                                href="#history"
                                                role="tab"
                                            >
                                                Order History
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-9">
                            <div className="dashboard-tab">
                                <div className="tab-content" id="myTabContent">
                                    <div
                                        className="tab-pane fade show active"
                                        id="home"
                                        role="tabpanel"
                                    >
                                        <div className="course-card card-space">
                                            <div className="row">
                                                <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                                    <div className="udemy-enroll-card">
                                                        <div>
                                                            <span className="udemy-price-icon"> <FaMoneyBill /></span>
                                                        </div>

                                                        <div className="udemy-enroll-content">
                                                            <p>Enrolled Course</p>
                                                            <h5>{dashboardData.stats.totalEnrolled}</h5>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                                    <div className="udemy-enroll-card">
                                                        <div>
                                                            <span className="udemy-price-icon udemy-book-icon"> <FaBookOpen />
                                                            </span>
                                                        </div>

                                                        <div className="udemy-enroll-content">
                                                            <p>Active Course</p>
                                                            <h5>{dashboardData.stats.totalActive}</h5>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                                    <div className="udemy-enroll-card">
                                                        <div>
                                                            <span className="udemy-price-icon udemy-star-icon"> <FontAwesomeIcon icon={faStar} />
                                                            </span>
                                                        </div>

                                                        <div className="udemy-enroll-content">
                                                            <p>Complete Course</p>
                                                            <h5>{dashboardData.stats.totalCompleted}</h5>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                                    <div className="udemy-enroll-card">
                                                        <div>
                                                            <span className="udemy-price-icon udemy-cms-icon"> <MdBook />
                                                            </span>
                                                        </div>

                                                        <div className="udemy-enroll-content">
                                                            <p>Total Quiz Complete</p>
                                                            <h5>{dashboardData.stats.totalQuizzes}</h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="subtitle text-black fw-600">Recent Enrolled Course</h3>

                                            <div className="row">
                                                {dashboardData.enrolledCourses.length > 0 ? (
                                                    dashboardData.enrolledCourses.map((course) => (
                                                        <div key={course._id} className="col-lg-4 col-md-6 col-sm-12 mb-3">
                                                            <div 
                                                              className="udemy-cards"
                                                              style={{ cursor: "pointer" }}
                                                              onClick={() => navigate(`/course/${course._id}`)}
                                                            >
                                                                <div className="udemy-picture">
                                                                  <img src={course.courseImage || course.thumbnail || course.image || "/course_01.png"} alt={course.title} />
                                                                </div>
                                                                <div className="udemy-content">
                                                                    <h4>{course.title}</h4>
                                                                    <span className="pb-2">
                                                                        <FontAwesomeIcon icon={faUser} className="udemy-course-icon" />
                                                                        <a href="#" className="udemy-user">{typeof course.instructor === 'object' ? (course.instructor?.name || course.instructor?.username || "Instructor") : (course.instructor || "Instructor")}</a>
                                                                    </span>
                                                                    <p>{course.description}</p>
                                                                    <ul className="rating-list">
                                                                        {renderStars(course.rating || 0)}
                                                                        <li className="rating-item"><span className="rating-number">({course.reviewsCount || course.totalRatings || 0})</span></li>
                                                                    </ul>

                                                                    <div className="progress-wrapper mt-1">
                                                                        <div className="progress-item">
                                                                            <div className="d-flex align-items-center justify-content-between udemy-progress">
                                                                                <span className="udemy-complete-video">
                                                                                    {course.status === 'completed' ? 'Completed' : `(${course.completedVideos || 0}/${course.totalVideos || 0})Video Completed`}
                                                                                </span>
                                                                                <span className="complete-label fz-12 fw-500">{course.progress || 0}%</span>
                                                                            </div>

                                                                            <div className="progress custom-progress">
                                                                                <div
                                                                                    className={course.status === 'completed' ? 'complete-bar' : 'progress-bar'}
                                                                                    style={{ width: `${course.progress || 0}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-12">
                                                        <div className="text-center py-5">
                                                            <div className="mb-3">
                                                                <MdBook size={48} className="text-muted" />
                                                            </div>
                                                            <h4 className="text-muted">No Enrolled Courses Yet</h4>
                                                            <p className="text-muted">Start learning by enrolling in your first course!</p>
                                                            <button 
                                                                className="btn btn-primary"
                                                                onClick={() => window.location.href = '/courses'}
                                                            >
                                                                Browse Courses
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="table-section">
                                                        <h5 className="innr-title mb-0">Recent Invoices</h5>
                                                        <div className="table table-responsive mb-0">
                                                            <table className="table mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>S.No</th>
                                                                        <th>Invoice Number </th>
                                                                        <th>Course</th>
                                                                        <th>Amount</th>
                                                                        <th>Payment Method</th>
                                                                        <th>Status</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dashboardData.orders && dashboardData.orders.length > 0 ? (
                                                                        dashboardData.orders.map((order, index) => (
                                                                            <tr key={order._id}>
                                                                                <td>{String(index + 1).padStart(2, '0')}.</td>
                                                                                <td>{order.orderId}</td>
                                                                                <td>
                                                                                    <div className="admin-table-bx">
                                                                                        <div className="admin-table-sub-bx">
                                                                                            <img src={order.courseId?.courseImage || order.courseId?.thumbnail || order.courseId?.image || "/pic_01.jpg"} alt={order.courseId?.title} />
                                                                                            <div className="admin-table-sub-details doctor-title">
                                                                                                <h6>{order.courseId?.title}</h6>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td>₹{order.amount}</td>
                                                                                <td>
                                                                                    {order.paymentMethod === 'bank_transfer' || order.paymentMethod === 'Bank Transfer' ? 'Bank Transfer' : (order.paymentMethod === 'upi' || order.paymentMethod === 'UPI' ? 'UPI' : 'UPI')}
                                                                                </td>
                                                                                <td>
                                                                                    <span className={order.paymentStatus === 'completed' ? 'public-title' : 'pending-title'}>
                                                                                         {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                                                                     </span>
                                                                                </td>
                                                                                <td>
                                                                                    <div className="d-flex gap-2">
                                                                                        <button type="button" className="dw-btn" onClick={() => handleViewOrder(order)} title="View Order">
                                                                                            <FontAwesomeIcon icon={faEye} />
                                                                                        </button>
                                                                                        <button type="button" className="dw-btn" onClick={() => handleViewOrder(order)} title="Download Receipt">
                                                                                            <FontAwesomeIcon icon={faDownload} />
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="6" className="text-center">
                                                                                <p className="text-muted">No orders found</p>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="tab-pane fade"
                                        id="profile"
                                        role="tabpanel"
                                    >
                                        <div className="mb-3 text-end">
                                            <div className="dropdown">
                                                <a
                                                    href="#"
                                                    className="vertical-btn dropdown-toggle"
                                                    id="acticonMenu2"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    All Status
                                                </a>
                                                <ul
                                                    className="dropdown-menu dropdown-menu-end  tble-action-menu admin-dropdown-card"
                                                    aria-labelledby="acticonMenu2"
                                                >
                                                    <li className="prescription-item">
                                                        <a href="#" className="prescription-nav" >
                                                            Not Started
                                                        </a>
                                                    </li>

                                                    <li className="prescription-item">
                                                        <a href="#" className="prescription-nav">
                                                            Complete
                                                        </a>
                                                    </li>

                                                    <li className="prescription-item">
                                                        <a href="#" className="prescription-nav" >
                                                            Pending
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="course-card">
                                            <div className="row">
                                                {paginatedCourses.length > 0 ? (
                                                    paginatedCourses.map((course) => (
                                                        <div key={course._id} className="col-lg-4 col-md-6 col-sm-12 mb-3">
                                                            <div 
                                                              className="udemy-cards"
                                                              style={{ cursor: "pointer" }}
                                                              onClick={() => navigate(`/course/${course._id}`)}
                                                            >
                                                                <div className="udemy-picture">
                                                                   <img src={course.courseImage || course.thumbnail || course.image || "/course_01.png"} alt={course.title} />
                                                                </div>
                                                                <div className="udemy-content">
                                                                    <h4>{course.title}</h4>
                                                                    <span className="pb-2">
                                                                        <FontAwesomeIcon icon={faUser} className="udemy-course-icon" />
                                                                        <a href="#" className="udemy-user">{typeof course.instructor === 'object' ? (course.instructor?.name || course.instructor?.username || "Instructor") : (course.instructor || "Instructor")}</a>
                                                                    </span>
                                                                    <p className="line-clamp-2">{course.description}</p>
                                                                    <ul className="rating-list">
                                                                        {renderStars(course.rating || 0)}
                                                                        <li className="rating-item"><span className="rating-number">({course.reviewsCount || course.totalRatings || 0})</span></li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-12">
                                                        <div className="text-center py-5">
                                                            <div className="mb-3">
                                                                <MdBook size={48} className="text-muted" />
                                                            </div>
                                                            <h4 className="text-muted">No Courses Available</h4>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {totalCoursePages > 1 && (
                                                <div className="row mt-4">
                                                    <div className="col-lg-12">
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            <ul className="pagination custom-pagination gap-2">
                                                                <li className={`page-item ${currentCoursePage === 1 ? 'disabled' : ''}`}>
                                                                    <button className="page-link" onClick={() => handleCoursePageChange(currentCoursePage - 1)}>
                                                                        <MdChevronLeft />
                                                                    </button>
                                                                </li>
                                                                {[...Array(totalCoursePages)].map((_, i) => (
                                                                    <li key={i} className={`page-item ${currentCoursePage === i + 1 ? 'active' : ''}`}>
                                                                        <button className="page-link" onClick={() => handleCoursePageChange(i + 1)}>
                                                                            {i + 1}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                                <li className={`page-item ${currentCoursePage === totalCoursePages ? 'disabled' : ''}`}>
                                                                    <button className="page-link" onClick={() => handleCoursePageChange(currentCoursePage + 1)}>
                                                                        <MdChevronRight />
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className="tab-pane fade"
                                        id="review"
                                        role="tabpanel"
                                    >
                                        <div className="row justify-content-between mb-3 align-items-center">
                                            <div className="col-lg-5">
                                                <div className="custom-frm-bx mb-0">
                                                    <input type="text" className="form-control ps-5 nw-search-control" placeholder="Search Certificate..." value={certSearch} onChange={(e) => setCertSearch(e.target.value)} />

                                                    <div className="dash-search-box">
                                                        <button className="dash-search-btn"> <FontAwesomeIcon icon={faSearch} /> </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="course-card">
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="table-section">
                                                        <h5 className="innr-title mb-0">My Certificate</h5>
                                                        <div className="table table-responsive mb-0">
                                                            <table className="table mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>S.No</th>
                                                                        <th>Course Name</th>
                                                                        <th>Issue Date</th>
                                                                        <th>Certificate ID</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filteredCertificates && filteredCertificates.length > 0 ? (
                                                                        filteredCertificates.map((certificate, index) => (
                                                                            <tr key={certificate._id}>
                                                                                <td>{String(index + 1).padStart(2, '0')}.</td>
                                                                                <td>
                                                                                    <div className="admin-table-bx">
                                                                                        <div className="admin-table-sub-bx">
                                                                                            <div className="admin-table-sub-details doctor-title ps-0">
                                                                                                <h6>{certificate.courseTitle}</h6>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td>{new Date(certificate.completedAt || certificate.issuedAt).toLocaleDateString()}</td>
                                                                                <td>
                                                                                    <span className="badge bg-light text-dark">{certificate.certificateId}</span>
                                                                                </td>
                                                                                <td>
                                                                                    <span>
                                                                                        <a href="#" className="dw-btn" title="Download" onClick={() => handleDownloadCertificate(certificate._id)}> <FontAwesomeIcon icon={faDownload} /> </a>
                                                                                        <a href="#" className="dw-btn" title="View" onClick={() => handleViewCertificate(certificate._id)}> <FontAwesomeIcon icon={faEye} /> </a>
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="5" className="text-center">
                                                                                <p className="text-muted">No certificates found</p>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="tab-pane fade"
                                        id="history"
                                        role="tabpanel"
                                    >
                                        <div className="row justify-content-between mb-3 align-items-center">
                                            <div className="col-lg-5">
                                                <div className="custom-frm-bx mb-0">
                                                    <input type="text" className="form-control ps-5 nw-search-control" placeholder="Search Order History..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />

                                                    <div className="dash-search-box">
                                                        <button className="dash-search-btn"> <FontAwesomeIcon icon={faSearch} /> </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="course-card">
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="table-section">
                                                        <h5 className="innr-title mb-0">Order History</h5>
                                                        <div className="table table-responsive mb-0">
                                                            <table className="table mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>S.No</th>
                                                                        <th>Order Number</th>
                                                                        <th>Course</th>
                                                                        <th>Amount</th>
                                                                        <th>Payment Method</th>
                                                                        <th>Status</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {paginatedOrders.length > 0 ? (
                                                                        paginatedOrders.map((order, index) => (
                                                                          <tr key={order._id}>
                                                                            <td>{String((currentOrderPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}.</td>
                                                                            <td>{order.orderId}</td>
                                                                            <td>
                                                                                <div className="admin-table-bx">
                                                                                    <div className="admin-table-sub-bx">
                                                                                        <img src={order.courseId?.courseImage || order.courseId?.thumbnail || order.courseId?.image || "/pic_01.jpg"} alt={order.courseId?.title} />
                                                                                        <div className="admin-table-sub-details doctor-title">
                                                                                            <h6>{order.courseId?.title}</h6>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td>₹{order.amount}</td>
                                                                            <td>{order.paymentMethod === 'bank_transfer' || order.paymentMethod === 'Bank Transfer' ? 'Bank Transfer' : (order.paymentMethod === 'upi' || order.paymentMethod === 'UPI' ? 'UPI' : 'UPI')}</td>
                                                                            <td>
                                                                                <span className={order.paymentStatus === 'completed' ? 'public-title' : 'pending-title'}>
                                                                                                                                                                     {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                                                                                                                                                 </span>
                                                                            </td>
                                                                            <td>
                                                                                <div className="d-flex gap-2">
                                                                                    <button type="button" className="dw-btn" onClick={() => handleViewOrder(order)} title="View Order">
                                                                                        <FontAwesomeIcon icon={faEye} />
                                                                                    </button>
                                                                                    <button type="button" className="dw-btn" onClick={() => handleViewOrder(order)} title="Download Receipt">
                                                                                        <FontAwesomeIcon icon={faDownload} />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                          </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="7" className="text-center">
                                                                                <p className="text-muted">No order history found</p>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        {totalOrderPages > 1 && (
                                                            <div className="d-flex align-items-center justify-content-center mt-4">
                                                                <ul className="pagination custom-pagination gap-2">
                                                                    <li className={`page-item ${currentOrderPage === 1 ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => handleOrderPageChange(currentOrderPage - 1)}>
                                                                            <MdChevronLeft />
                                                                        </button>
                                                                    </li>
                                                                    {[...Array(totalOrderPages)].map((_, i) => (
                                                                        <li key={i} className={`page-item ${currentOrderPage === i + 1 ? 'active' : ''}`}>
                                                                            <button className="page-link" onClick={() => handleOrderPageChange(i + 1)}>
                                                                                {i + 1}
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                    <li className={`page-item ${currentOrderPage === totalOrderPages ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => handleOrderPageChange(currentOrderPage + 1)}>
                                                                            <MdChevronRight />
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Certificate View Modal */}
            <div className={`modal step-modal fade ${showCertificateModal ? 'show d-block' : ''}`} style={{ display: showCertificateModal ? 'block' : 'none' }} id="view-Certificate" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden={!showCertificateModal}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-modal-box">
                        <div className="text-end">
                            <button type="button" className="modal-close-btn" onClick={() => setShowCertificateModal(false)}>
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                            <div>
                                <h6 className="lg_title mb-0" style={{ color: 'black' }}>Certificate Details</h6>
                            </div>
                        </div>
                        <div className="modal-body px-4">
                            {viewingCertificate && (
                                <div className="certificate-view">
                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <div className="certificate-content text-center p-4 border rounded bg-light">
                                                <h4 className="mb-4">CERTIFICATE OF COMPLETION</h4>
                                                <p className="mb-2">This is to certify that</p>
                                                <h2 className="mb-4 text-primary font-weight-bold">{viewingCertificate.studentName}</h2>
                                                <p className="mb-2">has successfully completed the course</p>
                                                <h3 className="mb-4">{viewingCertificate.courseTitle}</h3>
                                                <p className="mb-4">Issued on: {new Date(viewingCertificate.issuedAt).toLocaleDateString()}</p>
                                                <div className="mt-4 pt-4 border-top">
                                                    <p className="mb-0">Certificate ID: <strong>{viewingCertificate.certificateId}</strong></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12 text-center">
                                            <div className="alert alert-info py-2">
                                                <small>Verification Code: {viewingCertificate.certificateId}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer px-4">
                            <button type="button" className="sm-thm-btn outline" onClick={() => setShowCertificateModal(false)}>
                                Close
                            </button>
                            <button type="button" className="sm-thm-btn" onClick={() => window.print()}>
                                Print / Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showCertificateModal && <div className="modal-backdrop fade show"></div>}

            {/* Order Details Modal */}
            <div className={`modal step-modal fade ${showOrderModal ? 'show d-block' : ''}`} 
                 style={{ display: showOrderModal ? 'block' : 'none' }} 
                 id="view-Order" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                 aria-labelledby="orderModalLabel" aria-hidden={!showOrderModal}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-modal-box">
                        <div className="text-end">
                            <button type="button" className="modal-close-btn" onClick={() => setShowOrderModal(false)}>
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                            <div>
                                <h6 className="lg_title mb-0" style={{ color: 'black' }}>Order Details</h6>
                            </div>
                        </div>
                        <div className="modal-body px-4">
                            {viewingOrder && (
                                <div className="order-details-view">
                                    <div className="row mb-4">
                                        <div className="col-sm-6">
                                            <p className="mb-0 text-muted small">Order ID</p>
                                            <h6 className="fw-bold">#{viewingOrder.orderId}</h6>
                                        </div>
                                        <div className="col-sm-6 text-sm-end">
                                            <p className="mb-0 text-muted small">Date</p>
                                            <h6 className="fw-bold">{new Date(viewingOrder.createdAt).toLocaleDateString()}</h6>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-light p-3 rounded mb-4">
                                        <div className="row align-items-center">
                                            <div className="col-3 col-md-2">
                                                <img 
                                                    src={viewingOrder.courseId?.courseImage || viewingOrder.courseId?.thumbnail || "/pic_01.jpg"} 
                                                    alt={viewingOrder.courseId?.title} 
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '60px', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="col-9 col-md-10">
                                                <p className="mb-0 text-muted small">Purchased Course</p>
                                                <h6 className="fw-bold mb-0">{viewingOrder.courseId?.title}</h6>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <p className="mb-0 text-muted small">Payment Method</p>
                                            <h6 className="fw-bold">{viewingOrder.paymentMethod || 'UPI/Online'}</h6>
                                        </div>
                                        <div className="col-6 text-end">
                                            <p className="mb-0 text-muted small">Status</p>
                                            <span className={`badge ${viewingOrder.paymentStatus === 'completed' ? 'bg-success' : 'bg-warning'} text-white`}>
                                                {viewingOrder.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Course Price</span>
                                            <span>₹{viewingOrder.amount}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Tax & Fees</span>
                                            <span>₹0.00</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0 fw-bold">Total Amount</h5>
                                            <h5 className="mb-0 text-primary fw-bold">₹{viewingOrder.amount}</h5>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer px-4">
                            <button type="button" className="sm-thm-btn outline" onClick={() => setShowOrderModal(false)}>
                                Close
                            </button>
                            <button type="button" className="sm-thm-btn" onClick={() => window.print()}>
                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                Print / Download Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showOrderModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
}

export default MyDashboard;
