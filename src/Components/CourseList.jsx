import React, { useState, useEffect } from 'react';
import { getAllCourses, getTopCourses, searchCourses } from '../services/apiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faClock, faUsers, faDollarSign, faSearch } from '@fortawesome/free-solid-svg-icons';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('all');

    const categories = [
        { value: 'all', label: 'All Courses' },
        { value: 'Development', label: 'Development' },
        { value: 'Business', label: 'Business' },
        { value: 'Design', label: 'Design' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Data Science', label: 'Data Science' }
    ];

    useEffect(() => {
        loadCourses();
    }, [activeTab, selectedCategory]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            let result;
            
            if (activeTab === 'top') {
                result = await getTopCourses();
            } else if (searchQuery) {
                result = await searchCourses(searchQuery, selectedCategory === 'all' ? '' : selectedCategory);
            } else {
                result = await getAllCourses();
            }

            if (result.success && Array.isArray(result.data)) {
                setCourses(result.data);
            } else {
                console.error('Failed to load courses:', result.error);
                setCourses([]); // Ensure courses is always an array
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            setCourses([]); // Ensure courses is always an array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadCourses();
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" />);
        }

        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key="half" icon={faStar} className="text-warning" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="text-muted" />);
        }

        return stars;
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-4">Explore Courses</h2>
                    
                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-4">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All Courses
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'top' ? 'active' : ''}`}
                                onClick={() => setActiveTab('top')}
                            >
                                Top Courses
                            </button>
                        </li>
                    </ul>

                    {/* Search and Filter */}
                    <form onSubmit={handleSearch} className="row g-3 mb-4">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FontAwesomeIcon icon={faSearch} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select 
                                className="form-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary w-100">
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Course Grid */}
            <div className="row">
                {courses.length === 0 ? (
                    <div className="col-12 text-center">
                        <p className="text-muted">No courses found.</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <div key={course._id} className="col-lg-4 col-md-6 mb-4">
                            <div className="card h-100 course-card">
                                <div className="position-relative">
                                    <img 
                                        src={course.thumbnail || '/placeholder-course.jpg'} 
                                        className="card-img-top" 
                                        alt={course.title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    {course.isBestSeller && (
                                        <span className="badge bg-warning position-absolute top-0 start-0 m-2">
                                            Bestseller
                                        </span>
                                    )}
                                </div>
                                
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{course.title}</h5>
                                    <p className="card-text text-muted small">
                                        {course.instructor?.name || 'Instructor'}
                                    </p>
                                    <p className="card-text flex-grow-1">
                                        {course.description?.substring(0, 100)}...
                                    </p>
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center">
                                            <div className="me-2">
                                                {renderStars(course.rating || 0)}
                                            </div>
                                            <small className="text-muted">
                                                {course.rating || 0} ({course.reviewsCount || 0})
                                            </small>
                                        </div>
                                        <span className="badge bg-secondary">
                                            {course.level}
                                        </span>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <span className="h5 mb-0 text-primary">
                                                ${course.price || 0}
                                            </span>
                                            {course.originalPrice && course.originalPrice > course.price && (
                                                <span className="text-muted text-decoration-line-through ms-2">
                                                    ${course.originalPrice}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-muted small">
                                            <FontAwesomeIcon icon={faUsers} className="me-1" />
                                            {course.studentsCount || 0} students
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                                        <span>
                                            <FontAwesomeIcon icon={faClock} className="me-1" />
                                            {course.duration || 0} hours
                                        </span>
                                        {course.hasCertificate && (
                                            <span className="badge bg-success">
                                                Certificate
                                            </span>
                                        )}
                                    </div>

                                    <button className="btn btn-primary w-100">
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseList;
