import React, { useEffect, useState } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import CourseDetailsContent from "./CourseDetailsContent";
import CourseDetailsContentSecond from "./CourseDetailsContentSecond";
import { getBackendBaseUrl } from "../../config/backendConfig";

const CourseAccess = () => {
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isPurchased, setIsPurchased] = useState(false);
    const [error, setError] = useState(null);
    const [courseData, setCourseData] = useState(null);
    const [purchaseChecked, setPurchaseChecked] = useState(false);
    
    // Check if we're in learn mode
    const isLearnMode = location.pathname.includes('/learn');

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            await fetchCourseData();
            await checkPurchase();
            setPurchaseChecked(true);
            setLoading(false);
        };
        initializeData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const res = await fetch(`${getBackendBaseUrl()}/api/public/courses/${id}`);
            const data = await res.json();
            
            if (data.success) {
                setCourseData(data.data);
            } else {
                setError('Course not found');
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            setError('Failed to load course data');
        }
    };

    const checkPurchase = async () => {
        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                setIsPurchased(false);
                return;
            }

            // First try the dedicated course access endpoint
            let res = await fetch(`${getBackendBaseUrl()}/api/user/course-access/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            // If course-access endpoint doesn't exist, fallback to dashboard check
            if (!res.ok) {
                console.log('Course-access endpoint not found, falling back to dashboard check...');
                res = await fetch(`${getBackendBaseUrl()}/users/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            const data = await res.json();
            console.log('🔍 Course access check response:', data);

            if (res.ok) {
                if (data.isPurchased !== undefined) {
                    // Direct course-access endpoint response
                    setIsPurchased(data.isPurchased);
                } else if (data.success && data.orders) {
                    // Dashboard fallback response
                    const orders = data.orders;
                    const purchased = orders.some(
                        order => {
                            const orderCourseId = order.courseId?._id || order.courseId;
                            return orderCourseId.toString() === id.toString();
                        }
                    );
                    setIsPurchased(purchased);
                } else {
                    setIsPurchased(false);
                }
            } else {
                setIsPurchased(false);
            }
        } catch (error) {
            console.error('Error checking course access:', error);
            setIsPurchased(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mt-3">Checking Course Access...</h4>
                    <p className="text-muted">Please wait while we verify your access.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h4 className="text-danger">Error Checking Access</h4>
                    <p className="text-muted">{error}</p>
                    <button 
                        className="btn btn-primary mt-3"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // If course data is still null after loading, show error
    if (!loading && !courseData) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h4 className="text-danger">Course Not Found</h4>
                    <p className="text-muted">The course you're looking for doesn't exist.</p>
                    <button 
                        className="btn btn-primary mt-3"
                        onClick={() => window.location.href = '/courses'}
                    >
                        Browse Courses
                    </button>
                </div>
            </div>
        );
    }

    // If in learn mode, always show the learning page (assuming user has access)
    if (isLearnMode) {
        return <CourseDetailsContent course={courseData} />;
    }

    // Otherwise, check purchase status and show appropriate page
    return isPurchased
        ? <CourseDetailsContent course={courseData} />
        : <CourseDetailsContentSecond course={courseData} />;
};

export default CourseAccess;
