import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../../config/config";
import CourseDetailsContent from "./CourseDetailsContent";

function CourseDetails() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(
                    `${config.API_BASE_URL}/public/courses/${id}` 
                );

                const data = await response.json();

                if (response.ok) {
                    setCourse(data.data || data.course || data);
                }

            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id]);

    if (loading) return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">Loading Course...</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    if (!course) return (
        <>
            <section className="main-tp-section">
                <div className="main-shape"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <h3 className="lg_title text-center mb-2">Course Not Found</h3>
                                    <p className="text-center">The course you're looking for doesn't exist.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    return (
        <>
            <CourseDetailsContent course={course} />
        </>
    )
}

export default CourseDetails