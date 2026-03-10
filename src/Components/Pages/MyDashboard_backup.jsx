import { faDownload, faEye, faSearch, faStar, faStarHalf, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FaMoneyBill } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { MdBook } from "react-icons/md";

import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../../services/authService';

function MyDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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
        const userData = getStoredUser();
        if (userData) {
            setUser(userData);
            loadDashboardData();
        }
        setLoading(false);
    }, []);

    const loadDashboardData = async () => {
        try {
            // Mock data for now - will be replaced with API calls
            const mockData = {
                enrolledCourses: [
                    {
                        id: 1,
                        title: "Vue JS Scratch Course",
                        instructor: "Kitani Studio",
                        description: "More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...",
                        image: "/course_01.png",
                        rating: 4.5,
                        totalRatings: 1200,
                        progress: 100,
                        completedVideos: 10,
                        totalVideos: 10,
                        status: "completed"
                    },
                    {
                        id: 2,
                        title: "React Advanced Course",
                        instructor: "Kitani Studio",
                        description: "Master React with advanced concepts and real-world projects...",
                        image: "/course_02.png",
                        rating: 4.5,
                        totalRatings: 1200,
                        progress: 60,
                        completedVideos: 4,
                        totalVideos: 10,
                        status: "active"
                    },
                    {
                        id: 3,
                        title: "JavaScript Fundamentals",
                        instructor: "Kitani Studio",
                        description: "Learn JavaScript from scratch with practical examples...",
                        image: "/course_01.png",
                        rating: 4.5,
                        totalRatings: 1200,
                        progress: 60,
                        completedVideos: 4,
                        totalVideos: 10,
                        status: "active"
                    }
                ],
                completedCourses: [
                    {
                        id: 1,
                        title: "Vue JS Scratch Course",
                        instructor: "Kitani Studio",
                        image: "/course_01.png",
                        completedDate: "2024-01-15",
                        certificate: true
                    }
                ],
                activeCourses: [
                    {
                        id: 2,
                        title: "React Advanced Course",
                        instructor: "Kitani Studio",
                        image: "/course_02.png",
                        progress: 60,
                        lastAccessed: "2024-01-20"
                    },
                    {
                        id: 3,
                        title: "JavaScript Fundamentals",
                        instructor: "Kitani Studio",
                        image: "/course_01.png",
                        progress: 60,
                        lastAccessed: "2024-01-19"
                    }
                ],
                certificates: [
                    {
                        id: 1,
                        courseTitle: "Vue JS Scratch Course",
                        instructor: "Kitani Studio",
                        issueDate: "2024-01-15",
                        certificateId: "CERT-2024-001",
                        downloadUrl: "#"
                    }
                ],
                invoices: [
                    {
                        id: 1,
                        invoiceNumber: "#1456",
                        courseTitle: "Build Responsive Real World Websites",
                        amount: "$5698",
                        status: "Published",
                        date: "2024-01-15",
                        courseImage: "/pic_01.jpg"
                    },
                    {
                        id: 2,
                        invoiceNumber: "#1457",
                        courseTitle: "Vue JS Scratch Course",
                        amount: "$2999",
                        status: "Published",
                        date: "2024-01-10",
                        courseImage: "/pic_01.jpg"
                    },
                    {
                        id: 3,
                        invoiceNumber: "#1458",
                        courseTitle: "React Advanced Course",
                        amount: "$3999",
                        status: "Published",
                        date: "2024-01-05",
                        courseImage: "/pic_01.jpg"
                    },
                    {
                        id: 4,
                        invoiceNumber: "#1459",
                        courseTitle: "JavaScript Fundamentals",
                        amount: "$1999",
                        status: "Published",
                        date: "2024-01-01",
                        courseImage: "/pic_01.jpg"
                    }
                ],
                stats: {
                    totalEnrolled: 13,
                    totalActive: 13,
                    totalCompleted: 10,
                    totalQuizzes: 30
                }
            };

            setDashboardData(mockData);
        } catch (error) {
            console.error('Dashboard data loading error:', error);
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
                                                {dashboardData.enrolledCourses.map((course) => (
                                                    <div key={course.id} className="col-lg-4 col-md-6 col-sm-12 mb-3">
                                                        <div className="udemy-cards">
                                                            <div className="udemy-picture">
                                                                <img src={course.image} alt={course.title} />
                                                            </div>
                                                            <div className="udemy-content">
                                                                <h4>{course.title}</h4>
                                                                <span className="pb-2">
                                                                    <FontAwesomeIcon icon={faUser} className="udemy-course-icon" />
                                                                    <a href="#" className="udemy-user">{course.instructor}</a>
                                                                </span>
                                                                <p>{course.description}</p>
                                                                <ul className="rating-list">
                                                                    {renderStars(course.rating)}
                                                                    <li className="rating-item"><span className="rating-number">({course.totalRatings})</span></li>
                                                                </ul>

                                                                <div className="progress-wrapper mt-1">
                                                                    <div className="progress-item">
                                                                        <div className="d-flex align-items-center justify-content-between udemy-progress">
                                                                            <span className="udemy-complete-video">
                                                                                {course.status === 'completed' ? 'Completed' : `(${course.completedVideos}/${course.totalVideos})Video Completed`}
                                                                            </span>
                                                                            <span className="complete-label fz-12 fw-500">{course.progress}%</span>
                                                                        </div>

                                                                        <div className="progress custom-progress">
                                                                            <div
                                                                                className={course.status === 'completed' ? 'complete-bar' : 'progress-bar'}
                                                                                style={{ width: `${course.progress}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
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
                                                                    {dashboardData.invoices.map((invoice, index) => (
                                                                        <tr key={invoice.id}>
                                                                            <td>{String(index + 1).padStart(2, '0')}.</td>
                                                                            <td>{invoice.invoiceNumber}</td>
                                                                            <td>
                                                                                <div className="admin-table-bx">
                                                                                    <div className="admin-table-sub-bx">
                                                                                        <img src={invoice.courseImage} alt={invoice.courseTitle} />
                                                                                        <div className="admin-table-sub-details doctor-title">
                                                                                            <h6>{invoice.courseTitle}</h6>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td>{invoice.amount}</td>
                                                                            <td>
                                                                                <span className="public-title">{invoice.status}</span>
                                                                            </td>
                                                                            <td>
                                                                                <span>
                                                                                    <a href={invoice.downloadUrl || "javascript:void(0)"} className="dw-btn"> <FontAwesomeIcon icon={faDownload} /> </a>
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
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
                                                {dashboardData.enrolledCourses.map((course) => (
                                                    <div key={course.id} className="col-lg-4 col-md-6 col-sm-12 mb-3">
                                                        <div className="udemy-cards">
                                                            <div className="udemy-picture">
                                                                <img src={course.image} alt={course.title} />
                                                            </div>
                                                            <div className="udemy-content">
                                                                <h4>{course.title}</h4>
                                                                <span className="pb-2">
                                                                    <FontAwesomeIcon icon={faUser} className="udemy-course-icon" />
                                                                    <a href="#" className="udemy-user">{course.instructor}</a>
                                                                </span>
                                                                <p>{course.description}</p>
                                                                <ul className="rating-list">
                                                                    {renderStars(course.rating)}
                                                                    <li className="rating-item"><span className="rating-number">({course.totalRatings})</span></li>
                                                                </ul>

                                                                <div className="progress-wrapper mt-1">
                                                                    <div className="progress-item">
                                                                        <div className="d-flex align-items-center justify-content-between udemy-progress">
                                                                            <span className="udemy-complete-video">
                                                                                {course.status === 'completed' ? 'Completed' : `(${course.completedVideos}/${course.totalVideos})Video Completed`}
                                                                            </span>
                                                                            <span className="progress-label fz-12 fw-500">{course.progress}%</span>
                                                                        </div>

                                                                        <div className="progress custom-progress">
                                                                            <div
                                                                                className={course.status === 'completed' ? 'complete-bar' : 'progress-bar'}
                                                                                style={{ width: `${course.progress}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
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
                                                                        <th>Date</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dashboardData.certificates.map((certificate, index) => (
                                                                        <tr key={certificate.id}>
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
                                                                    ))}
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

                                            <div className="col-lg-3">
                                                <div className="dropdown text-end">
                                                    <a
                                                        href="#"
                                                        className="vertical-btn dropdown-toggle"
                                                        id="acticonMenu2"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        Status
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
                                        </div>

                                        <div className="course-card">
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="table-section">
                                                        <h5 className="innr-title mb-0">Recent Order</h5>
                                                        <div className="table table-responsive mb-0">
                                                            <table className="table mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>S.No</th>
                                                                        <th>Order Id</th>
                                                                        <th>Course</th>
                                                                        <th>Amount</th>
                                                                        <th>Payment Method</th>
                                                                        <th>Status</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dashboardData.invoices.map((invoice, index) => (
                                                                        <tr key={invoice.id}>
                                                                            <td>{String(index + 1).padStart(2, '0')}.</td>
                                                                            <td>{invoice.invoiceNumber}</td>
                                                                            <td>
                                                                                <div className="admin-table-bx">
                                                                                    <div className="admin-table-sub-bx">
                                                                                        <img src={invoice.courseImage} alt={invoice.courseTitle} />
                                                                                        <div className="admin-table-sub-details doctor-title">
                                                                                            <h6>{invoice.courseTitle}</h6>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td>{invoice.amount}</td>
                                                                            <td>UPI</td>
                                                                            <td>
                                                                                <span className="public-title">Paid</span>
                                                                            </td>
                                                                            <td>
                                                                                <span>
                                                                                    <a href={invoice.downloadUrl || "javascript:void(0)"} className="dw-btn"> <FontAwesomeIcon icon={faDownload} /> </a>
                                                                                    <a href={invoice.downloadUrl || "javascript:void(0)"} className="dw-btn"> <FontAwesomeIcon icon={faEye} /> </a>
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
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
    )
}

export default MyDashboard
