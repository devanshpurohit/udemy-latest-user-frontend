import { faDownload, faEye, faSearch, faStar, faStarHalf, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FaMoneyBill } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { MdBook } from "react-icons/md";

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getDashboardData } from '../../services/apiService';
import { getCurrentUser } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { getBackendBaseUrl } from '../../config/backendConfig';

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
                    totalQuizzes: 0 // Will be added later
                };
                
                setDashboardData({
                    enrolledCourses: realData.enrolledCourses || [],
                    completedCourses: realData.allCourses || [],
                    activeCourses: realData.activeCourses || [],
                    certificates: [],
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
                                                                                    <span className="public-title">{order.paymentStatus}</span>
                                                                                </td>
                                                                                <td>
                                                                                    <span>
                                                                                        <a href="#" className="dw-btn"> <FontAwesomeIcon icon={faDownload} /> </a>
                                                                                    </span>
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
                                                {allCourses.length > 0 ? (
                                                    allCourses.map((course) => (
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
                                                                                <span className="progress-label fz-12 fw-500">{course.progress || 0}%</span>
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
                                        </div>
                                    </div>

                                    <div
                                        className="tab-pane fade"
                                        id="review"
                                        role="tabpanel"
                                    >
                                        <div className="row justify-content-between mb-3">
                                            <div className="col-lg-5">
                                                <div className="custom-frm-bx mb-0">
                                                    <input type="text" className="form-control ps-5 nw-search-control" placeholder="Search" />

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
                                                                        <th>Certificate Name</th>
                                                                        <th>Payment Method</th>
<th>Status</th>
<th>Actions</th>
                                                                       
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dashboardData.certificates && dashboardData.certificates.length > 0 ? (
                                                                        dashboardData.certificates.map((certificate, index) => (
                                                                            <tr key={certificate._id}>
                                                                                <td>{String(index + 1).padStart(2, '0')}.</td>
                                                                                <td>{certificate.courseTitle} Certificate</td>
                                                                                <td>{certificate.issueDate}</td>
                                                                                <td>
                                                                                    <span>
                                                                                        <a href={certificate.downloadUrl || "javascript:void(0)"} className="dw-btn"> <FontAwesomeIcon icon={faDownload} /> </a>
                                                                                        <a href={certificate.downloadUrl || "javascript:void(0)"} className="dw-btn"> <FontAwesomeIcon icon={faEye} /> </a>
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="4" className="text-center">
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
                                        <div className="row justify-content-between mb-3">
                                            <div className="col-lg-5">
                                                <div className="custom-frm-bx mb-0">
                                                    <input type="text" className="form-control ps-5 nw-search-control" placeholder="Search" />

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
                                                                    {dashboardData.orders && dashboardData.orders.length > 0 ? (
                                                                        dashboardData.orders.map((order, index) => (
                                                                          <tr key={order._id}>
  <td>{String(index + 1).padStart(2, '0')}.</td>
  <td>{order.orderId}</td>

  <td>
    <div className="admin-table-bx">
      <div className="admin-table-sub-bx">
       <img
src={order.courseId?.courseImage || "/pic_01.jpg"}
alt={order.courseId?.title}
/>
        <div className="admin-table-sub-details doctor-title">
          <h6>{order.courseId?.title}</h6>
        </div>
      </div>
    </div>
  </td>

  <td>₹{order.amount}</td>

  <td>{order.paymentMethod || "UPI"}</td>

  <td>
    <span className="public-title">{order.paymentStatus}</span>
  </td>

  <td>
    <a href="#" className="dw-btn">
      <FontAwesomeIcon icon={faDownload} />
    </a>
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
        </>
    );
}

export default MyDashboard;
