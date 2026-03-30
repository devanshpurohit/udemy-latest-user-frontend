import { faDownload, faEye, faSearch, faStar, faStarHalf, faUser, faFilePdf } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { FaMoneyBill } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { MdBook, MdChevronLeft, MdChevronRight } from "react-icons/md";
import config from "../../config/config";

const normalizeMediaUrl = (url) => {
    if (!url) return "/pic_01.jpg";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Normalize path: replace backslashes, extract only the part after 'uploads' or root
    let cleanPath = url.replace(/\\/g, '/');
    if (cleanPath.includes('/uploads/')) {
        cleanPath = '/uploads/' + cleanPath.split('/uploads/').pop();
    }
    
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }

    const baseUrl = config.API_BASE_URL.replace('/api', '');
    return encodeURI(`${baseUrl}${cleanPath}`.replace(/\/+/g, '/').replace(':/', '://'));
};

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { getDashboardData, getAllCourses, getCurrentUser, getCachedDashboardData, getCachedAllCourses } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { getBackendBaseUrl } from '../../config/backendConfig';
import certificateService from "../../services/certificateService";
import { toast } from "react-toastify";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import CourseCard from '../Common/CourseCard';
import { getLangText } from "../../utils/languageUtils";

function MyDashboard() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const userLanguage = authUser?.profile?.language || 'English';
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
    const [courseStatus, setCourseStatus] = useState("All");
    const [activeTab, setActiveTab] = useState("home");

    useEffect(() => {
        const initDashboard = async () => {
            if (authUser) {
                // Instant cache load
                const cachedDash = getCachedDashboardData();
                const cachedCourses = getCachedAllCourses();
                
                if (cachedDash && cachedDash.data) {
                    setDashboardData(prev => ({
                        ...prev,
                        ...cachedDash.data,
                        stats: {
                            totalEnrolled: cachedDash.data.enrolledCourses?.length || 0,
                            totalActive: cachedDash.data.activeCourses?.length || 0,
                            totalCompleted: cachedDash.data.allCourses?.length || 0,
                            totalQuizzes: cachedDash.data.stats?.totalQuizzes || 0
                        }
                    }));
                    setLoading(false);
                }
                
                if (cachedCourses && cachedCourses.data) {
                    setAllCourses(cachedCourses.data);
                }

                console.log('🔍 MyDashboard: Initializing with user:', authUser._id);
                
                // Fetch both dashboard and all courses in parallel
                await Promise.all([
                    loadDashboardData(),
                    loadAllCourses()
                ]);
                
                setLoading(false);
            } else {
                // If no authUser, we might be loading or logged out
                // the AuthContext should handle redirection if needed
                console.log('🔍 MyDashboard: No authUser yet...');
            }
        };

        if (authUser) {
            initDashboard();
        }
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
            if (!dashboardData.enrolledCourses.length) {
                setLoading(true);
            }
            console.log('🔍 MyDashboard: Fetching fresh dashboard data (cache bypassed)...');
            const response = await getDashboardData(false); // Force fresh data
            
            if (response.success && response.data) {
                const data = response.data;
                console.log('🔍 MyDashboard: Dashboard data loaded', response.fromCache ? '(from cache)' : '(from API)');

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
            if (allCourses.length === 0 && !dashboardData.enrolledCourses.length) {
                setLoading(true);
            }
            console.log('🔍 MyDashboard: Loading all courses fresh (cache bypassed)...');
            const response = await getAllCourses(false); // Force fresh data

            if (response.success && response.data) {
                console.log('✅ MyDashboard: All courses loaded:', response.data.length, response.fromCache ? '(from cache)' : '');
                setAllCourses(response.data);
            }
        } catch (error) {
            console.error('❌ MyDashboard: Error loading courses:', error);
        }
    };

    const filteredCertificates = useMemo(() => {
        let result = [...(dashboardData.certificates || [])];

        // Search filter
        if (certSearch) {
            result = result.filter(cert =>
                getLangText(cert.courseTitle, userLanguage).toLowerCase().includes(certSearch.toLowerCase()) ||
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
                getLangText(order.courseId?.title, userLanguage).toLowerCase().includes(orderSearch.toLowerCase())
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

    const filteredEnrolledCourses = useMemo(() => {
        let result = [...dashboardData.enrolledCourses];

        if (courseStatus === "Not Started") {
            result = result.filter(c => (c.progressPercentage || 0) === 0);
        } else if (courseStatus === "Complete") {
            result = result.filter(c => (c.progressPercentage || 0) === 100);
        } else if (courseStatus === "In Progress" || courseStatus === "Pending") {
            result = result.filter(c => (c.progressPercentage || 0) > 0 && (c.progressPercentage || 0) < 100);
        }

        return result;
    }, [dashboardData.enrolledCourses, courseStatus]);

    const paginatedCourses = useMemo(() => {
        const startIndex = (currentCoursePage - 1) * itemsPerPage;
        const source = activeTab === 'all' ? allCourses : filteredEnrolledCourses;
        return source.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEnrolledCourses, allCourses, activeTab, currentCoursePage]);

    const totalCoursePages = useMemo(() => {
        const source = activeTab === 'all' ? allCourses : filteredEnrolledCourses;
        return Math.ceil(source.length / itemsPerPage);
    }, [filteredEnrolledCourses, allCourses, activeTab]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentOrderPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentOrderPage]);

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
                const cert = response.data.certificate;
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                // Certificate Design
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();

                // Simple Border
                doc.setDrawColor(20, 20, 20);
                doc.setLineWidth(2);
                doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
                doc.setLineWidth(0.5);
                doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

                // Content
                doc.setFont("helvetica", "bold");
                doc.setFontSize(40);
                doc.setTextColor(33, 37, 41);
                doc.text("CERTIFICATE", pageWidth / 2, 50, { align: "center" });
                
                doc.setFontSize(20);
                doc.text("OF COMPLETION", pageWidth / 2, 65, { align: "center" });

                doc.setFont("helvetica", "normal");
                doc.setFontSize(16);
                doc.text("This is to certify that", pageWidth / 2, 90, { align: "center" });

                doc.setFont("helvetica", "bolditalic");
                doc.setFontSize(28);
                doc.setTextColor(0, 86, 179); // A nice blue
                doc.text(user?.username || "Student Name", pageWidth / 2, 110, { align: "center" });

                doc.setFont("helvetica", "normal");
                doc.setFontSize(16);
                doc.setTextColor(33, 37, 41);
                doc.text("has successfully completed the course", pageWidth / 2, 130, { align: "center" });

                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.text(getLangText(cert.courseTitle, userLanguage), pageWidth / 2, 150, { align: "center" });

                doc.setFont("helvetica", "normal");
                doc.setFontSize(12);
                const issueDate = new Date(cert.completedAt || cert.issuedAt).toLocaleDateString();
                doc.text(`Issued on: ${issueDate}`, pageWidth / 2, 170, { align: "center" });
                doc.text(`Certificate ID: ${cert.certificateId}`, pageWidth / 2, 180, { align: "center" });

                // Footer / Branding
                doc.setFontSize(14);
                doc.text("Udemy Academy", pageWidth / 2, 195, { align: "center" });

                doc.save(`Certificate_${cert.certificateId}.pdf`);
                toast.success("Certificate downloaded successfully!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to download certificate");
        } finally {
            setCertificateLoading(false);
        }
    };

    const handleDownloadOrder = (order) => {
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text("INVOICE / RECEIPT", 105, 20, { align: "center" });
            
            doc.setFontSize(10);
            doc.text("Udemy Academy", 14, 35);
            doc.text("Online Learning Platform", 14, 40);
            
            // Order Info
            doc.setFont("helvetica", "bold");
            doc.text(`Order ID: ${order.orderId}`, 14, 55);
            doc.setFont("helvetica", "normal");
            doc.text(`Date: ${new Date(order.createdAt || order.updatedAt).toLocaleDateString()}`, 14, 60);
            doc.text(`User: ${user?.username || "Student"}`, 14, 65);
            doc.text(`Email: ${user?.email || "N/A"}`, 14, 70);

            // Table
            const body = [[
                "1.",
                getLangText(order.courseId?.title, userLanguage) || "Course Details",
                order.paymentMethod || "Online",
                `INR ${order.amount}`
            ]];

            autoTable(doc, {
                startY: 80,
                head: [['S.No', 'Course Description', 'Method', 'Total Amount']],
                body: body,
                theme: 'striped',
                headStyles: { fillColor: [0, 86, 179] }
            });

            const finalY = (doc.lastAutoTable?.finalY) || 100;
            doc.setFont("helvetica", "bold");
            doc.text(`Total Paid: INR ${order.amount}`, 14, finalY + 10);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("This is an electronically generated document. No signature is required.", 105, finalY + 20, { align: "center" });

            doc.save(`Order_${order.orderId}.pdf`);
            toast.success("Order history downloaded!");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    if (loading && dashboardData.enrolledCourses.length === 0) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mt-3">Loading Your Dashboard...</h4>
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
                                                onClick={() => setActiveTab('home')}
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
                                                onClick={() => setActiveTab('all')}
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
                                                            <p>Enrolled Courses</p>
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
                                                            <p>Active Courses</p>
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
                                                            <p>Complete Courses</p>
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

                                            <h3 className="subtitle text-black fw-600">Recent Enrolled Courses</h3>

                                            <div className="row">
                                                {dashboardData.enrolledCourses.length > 0 ? (
                                                    dashboardData.enrolledCourses.map((course) => (
                                                        <div key={course._id} className="col-lg-4 col-md-6 col-sm-12 mb-3">
                                                            <CourseCard course={course} variant="my-course" isVertical={true} />
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
                                                                onClick={() => window.location.href = '/available-courses'}
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
                                                                                            <img src={normalizeMediaUrl(order.courseId?.courseImage || order.courseId?.thumbnail || order.courseId?.image)} alt={getLangText(order.courseId?.title, userLanguage)} />
                                                                                            <div className="admin-table-sub-details doctor-title">
                                                                                                <h6>{getLangText(order.courseId?.title, userLanguage)}</h6>
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
                                                                                        <button type="button" className="dw-btn" onClick={() => handleDownloadOrder(order)} title="Download Receipt">
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
                                                    href="javascript:void(0)"
                                                    className="vertical-btn dropdown-toggle"
                                                    id="acticonMenu2"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    {courseStatus === "All" ? "All Status" : courseStatus}
                                                </a>
                                                <ul
                                                    className="dropdown-menu dropdown-menu-end  tble-action-menu admin-dropdown-card"
                                                    aria-labelledby="acticonMenu2"
                                                >
                                                    <li className="prescription-item">
                                                        <a href="javascript:void(0)" className="prescription-nav" onClick={() => setCourseStatus("All")}>
                                                            All Status
                                                        </a>
                                                    </li>
                                                    <li className="prescription-item">
                                                        <a href="javascript:void(0)" className="prescription-nav" onClick={() => setCourseStatus("Not Started")}>
                                                            Not Started
                                                        </a>
                                                    </li>

                                                    <li className="prescription-item">
                                                        <a href="javascript:void(0)" className="prescription-nav" onClick={() => setCourseStatus("In Progress")}>
                                                            In Progress
                                                        </a>
                                                    </li>

                                                    <li className="prescription-item">
                                                        <a href="javascript:void(0)" className="prescription-nav" onClick={() => setCourseStatus("Complete")}>
                                                            Complete
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
                                                            <CourseCard course={course} variant="my-course" isVertical={true} />
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
                                                                                                <h6>{getLangText(certificate.courseTitle, userLanguage)}</h6>
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
                                                                                            <img src={normalizeMediaUrl(order.courseId?.courseImage || order.courseId?.thumbnail || order.courseId?.image)} alt={getLangText(order.courseId?.title, userLanguage)} />
                                                                                            <div className="admin-table-sub-details doctor-title">
                                                                                                <h6>{getLangText(order.courseId?.title, userLanguage)}</h6>
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
                                                                                        <button type="button" className="dw-btn" onClick={() => handleDownloadOrder(order)} title="Download Receipt">
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
                                                <h3 className="mb-4">{getLangText(viewingCertificate.courseTitle, userLanguage)}</h3>
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
                                                    src={normalizeMediaUrl(viewingOrder.courseId?.courseImage || viewingOrder.courseId?.thumbnail)}
                                                    alt={getLangText(viewingOrder.courseId?.title, userLanguage)}
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '60px', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="col-9 col-md-10">
                                                <p className="mb-0 text-muted small">Purchased Course</p>
                                                <h6 className="fw-bold mb-0">{getLangText(viewingOrder.courseId?.title, userLanguage)}</h6>
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
