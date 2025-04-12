import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/App.css";
import { GET_CURRICULUM_URL, SET_CURRICULUM_URL } from '../api';
import icon from "./brain.png" 

const AllLessons = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Add useEffect for logging user credentials
  // User Credentials: 
  // {"UserId":"0721ca40-3513-4d26-85f1-d0e508a1948a","Email":"aswin@gmail.com","FullName":"aswin"}

  useEffect(() => {

    const userData = JSON.parse(localStorage.getItem('user'))
    console.log('User Credentials:', userData);
    console.log(userData.UserId)
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(GET_CURRICULUM_URL); //get all lessons
      if (!response.ok) {
        throw new Error('No courses available');
      }
      const data = await response.json();
      setCourses(data.Items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // Check for new courses every 30 seconds
    const interval = setInterval(fetchCourses, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleRequestCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    setRequestError('');
    setRequestSuccess('');
    setIsSubmitting(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      const response = await fetch(SET_CURRICULUM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.UserId,
          curriculum: newCourseName.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRequestSuccess('Your course request has been accepted and will be updated in a few minutes.');
        setNewCourseName('');
        setShowRequestModal(false);
        setShowNotification(true);
        setNotificationMessage('Your requested course has been added successfully!');
        
        // Start checking for new courses
        const checkNewCourse = setInterval(async () => {
          const updatedResponse = await fetch(GET_CURRICULUM_URL);
          const updatedData = await updatedResponse.json();
          const newCourseExists = updatedData.Items.some(course => 
            course.Title.toLowerCase() === newCourseName.toLowerCase()
          );
          
          if (newCourseExists) {
            setCourses(updatedData.Items);
            clearInterval(checkNewCourse);
            setShowNotification(true);
            setNotificationMessage('Your requested course has been added successfully!');
          }
        }, 5000); // Check every 5 seconds

        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(checkNewCourse), 300000);
      } else {
        setRequestError(data.Msg || 'Failed to submit course request');
      }
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="courses-header">
        <h1 className="availabe-course-text">Available Courses</h1>
        <button 
          className="request-course-btn"
          onClick={() => setShowRequestModal(true)}
        >
          Request Course
        </button>
      </div>

      {showNotification && (
        <div className="notification-banner">
          {notificationMessage}
          <button 
            className="close-notification"
            onClick={() => setShowNotification(false)}
          >
            
          </button>
        </div>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <div 
            key={course.PathId} 
            className="course-tile"
            onClick={() => handleCourseClick(course.PathId)}
          >
            <div className='image-icon-div'>
            <img src={icon} alt="Brain " width="50" height="50"/>
            </div>

            <div className="course-content">
              <h2 className="course-title">{course.Title}</h2>
              <div className="course-meta">
                {/* <span>⏱ {course.EstimatedDurations} hours</span> */}
                <span>📚 {course.Lessons.length} lessons</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Request New Course</h2>
            <form onSubmit={handleRequestCourse}>
              {requestError && <div className="error-message">{requestError}</div>}
              {requestSuccess && <div className="success-message">{requestSuccess}</div>}
              
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  required
                  placeholder="Enter the course name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="modal-buttons">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={!newCourseName.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowRequestModal(false);
                    setNewCourseName('');
                    setRequestError('');
                    setRequestSuccess('');
                    setIsSubmitting(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLessons; 