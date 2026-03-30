import { useEffect, useState, useMemo } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { getDashboardData, getCachedDashboardData, syncCartWithPurchases } from "../../services/apiService";
import { getStoredUser } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import CourseDetailsContentSecond from "./CourseDetailsContentSecond";
import CourseDetailsContent from "./CourseDetailsContent";

function CourseGuard({ mode }) {
    const { id } = useParams();
    const { user } = useAuth();
    const location = useLocation();

    // 🎯 Synchronous initialization using sessionStorage cache to completely eliminate UI flash
    const [status, setStatus] = useState(() => {
        const storedUser = getStoredUser();
        if (storedUser?.role === 'admin') return "purchased";
        
        const cachedRes = getCachedDashboardData();
        if (cachedRes && cachedRes.success && cachedRes.data?.orders) {
            const purchased = cachedRes.data.orders.some(order => {
                const orderCourseId = order.courseId?._id || order.courseId;
                return orderCourseId.toString() === id;
            });
            return purchased ? "purchased" : "not_purchased";
        }
        
        return "checking"; // fallback if cache doesn't exist yet
    });

    // 🎯 Sync cart safely as an effect when purchased status is confirmed
    useEffect(() => {
        if (status === "purchased") {
            syncCartWithPurchases();
        }
    }, [status]);

    useEffect(() => {
        // If we already resolved the status synchronously from cache, do nothing
        if (status !== "checking") return;

        const checkPurchaseAsync = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setStatus("not_purchased");
                return;
            }

            if (user?.role === 'admin') {
                setStatus("purchased");
                return;
            }

            try {
                const res = await getDashboardData(true);
                if (res.success && res.data?.orders) {
                    const purchased = res.data.orders.some(order => {
                        const orderCourseId = order.courseId?._id || order.courseId;
                        return orderCourseId.toString() === id;
                    });
                    
                    if (purchased) {
                        syncCartWithPurchases();
                        setStatus("purchased");
                    } else {
                        setStatus("not_purchased");
                    }
                } else {
                    setStatus("not_purchased");
                }
            } catch (e) {
                setStatus("not_purchased");
            }
        };

        checkPurchaseAsync();
    }, [id, user, status, mode]);

    if (status === "checking") {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (mode === "sales") {
        if (status === "purchased") {
            // Instantly redirect to learn page if they own it
            return <Navigate to={`/course/${id}/learn`} replace />;
        }
        // If not purchased, show sales page
        return <CourseDetailsContentSecond isPurchasedProp={false} />;
    }

    if (mode === "learn") {
        if (status === "not_purchased") {
            // Kick them out if they try to access learn without buying
            return <Navigate to={`/course/${id}`} replace />;
        }
        // If purchased, show learn page and pass state (like lessonId)
        return <CourseDetailsContent isPurchasedProp={true} state={location.state} />;
    }

    return null;
}

export default CourseGuard;
