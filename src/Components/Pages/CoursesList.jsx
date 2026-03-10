import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../../config/backendConfig';
import { Link } from 'react-router-dom';
import { faStar, faClock, faUsers, faRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(8); // Initially show 8 courses

  // Debug: Log component state with timestamp
  console.log('🔍 CoursesList render -', new Date().toISOString());
  console.log('🔍 courses type:', typeof courses, Array.isArray(courses));
  console.log('🔍 courses value:', courses);
  console.log('🔍 courses length:', courses?.length);
  console.log('🔍 Component version: 2.0 - FIXED');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting fetchCourses...');
      const apiUrl = `${config.API_BASE_URL}/public/courses`;
      console.log('🔍 Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔍 Response data:', data);
      console.log('🔍 Response data type:', typeof data);
      console.log('🔍 Response data.data:', data.data);
      console.log('🔍 Response data.data type:', typeof data.data);
      console.log('🔍 Is data.data array?:', Array.isArray(data.data));
      
      if (data.success && Array.isArray(data.data)) {
        console.log('📚 Total courses received:', data.data.length);
        console.log('📚 Course titles:', Array.isArray(data.data) ? data.data.map(c => c.title) : 'N/A');
        setAllCourses(data.data);
        setCourses(data.data.slice(0, displayCount));
        console.log('🔍 Set courses to:', data.data.slice(0, displayCount));
      } else {
        console.error('❌ Invalid data format:', data);
        setError(data.message || 'Invalid data format received');
        // Ensure courses is always an array
        setCourses([]);
        setAllCourses([]);
      }
    } catch (error) {
      console.error('❌ Network error in fetchCourses:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError('Failed to fetch courses - Network error');
      // Ensure courses is always an array even on error
      setCourses([]);
      setAllCourses([]);
    } finally {
      setLoading(false);
      console.log('🏁 fetchCourses completed, loading set to false');
    }
  };

  const loadMore = () => {
    console.log('🔍 Load more called');
    console.log('🔍 Current allCourses:', allCourses);
    console.log('🔍 Current allCourses type:', typeof allCourses);
    console.log('🔍 Is allCourses array?:', Array.isArray(allCourses));
    console.log('🔍 Current displayCount:', displayCount);
    
    if (!Array.isArray(allCourses)) return;
    
    const newCount = displayCount + 8;
    setDisplayCount(newCount);
    const newCourses = allCourses.slice(0, newCount);
    console.log('🔍 New courses to set:', newCourses);
    console.log('🔍 New courses type:', typeof newCourses);
    console.log('🔍 Is newCourses array?:', Array.isArray(newCourses));
    setCourses(newCourses);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchCourses}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-3">All Courses</h2>
          <p className="text-muted">Discover our wide range of courses and start learning today!</p>
        </div>
      </div>

      <div className="row">
        {(!courses || !Array.isArray(courses) || courses.length === 0) ? (
          <div className="col-12">
            <div className="text-center py-5">
              <h3>No Courses Available</h3>
              <p className="text-muted">Check back later for new courses.</p>
            </div>
          </div>
        ) : (
          // Final safety check before calling .map()
          Array.isArray(courses) && courses.map(course => (
            <div key={course._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 course-card">
                {/* Course Image */}
                <div className="position-relative">
                  {course.thumbnail || course.courseImage ? (
                    <img 
                      src={course.thumbnail || course.courseImage} 
                      className="card-img-top" 
                      alt={course.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="card-img-top d-flex align-items-center justify-content-center bg-light"
                      style={{ height: '200px' }}
                    >
                      <FontAwesomeIcon icon={faStar} size="3x" className="text-muted" />
                    </div>
                  )}
                  
                  {/* Course Level Badge */}
                  <span className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-primary">
                      {course.level || 'beginner'}
                    </span>
                  </span>
                </div>

                <div className="card-body d-flex flex-column">
                  {/* Course Title */}
                  <h5 className="card-title">{course.title}</h5>
                  
                  {/* Course Description */}
                  <p className="card-text text-muted flex-grow-1">
                    {course.description ? 
                      course.description.substring(0, 100) + '...' : 
                      'No description available'
                    }
                  </p>

                  {/* Course Meta */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faUsers} className="text-muted me-2" />
                      <small className="text-muted">
                        {course.totalEnrollments || 0} students enrolled
                      </small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faClock} className="text-muted me-2" />
                      <small className="text-muted">
                        {course.duration || 1} months
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
                      <small className="text-muted">
                        {course.averageRating || 0} ({course.ratings?.length || 0} reviews)
                      </small>
                    </div>
                  </div>

                  {/* Course Footer */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0 text-primary">
                        <FontAwesomeIcon icon={faRupeeSign} />
                        {course.discountedPrice || course.price}
                      </h5>
                      {course.discountedPrice && course.discountedPrice < course.price && (
                        <small className="text-muted text-decoration-line-through">
                          <FontAwesomeIcon icon={faRupeeSign} />
                          {course.price}
                        </small>
                      )}
                    </div>
                    <Link 
                      to={`/course/${course._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Course
                    </Link>
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="card-footer bg-light">
                  <div className="d-flex align-items-center">
                    <small className="text-muted">
                      Instructor: {course.instructor?.username || 'Unknown'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CoursesList;
