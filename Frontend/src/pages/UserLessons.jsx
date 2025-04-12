import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/App.css";
import { GET_USER_CURRICULUM_URL } from '../api';
import icon from "./brain.png" 


const UserLessons = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.UserId) {
          throw new Error('User not logged in');
        }

        const response = await fetch(GET_USER_CURRICULUM_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.UserId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user courses');
        }

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`, { state: { fromUserLessons: true } });
  };

  if (loading) {
    return <div className="loading">Loading your courses...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>My Courses</h1>
      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="no-lessons">
            <p>You haven't enrolled in any courses yet.</p>
            <button onClick={() => navigate('/all-lessons')} className="browse-courses-btn">
              Browse Available Courses
            </button>
          </div>
        ) : (
          courses.map((course) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default UserLessons; 