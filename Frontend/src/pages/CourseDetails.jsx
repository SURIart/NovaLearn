import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/CourseDetails.css';
import { GET_CURRICULUM_URL, SET_CURRICULUM_URL } from '../api';
import { GET_USER_CURRICULUM_URL } from '../api';
import { SET_USER_CURRICULUM_URL } from '../api';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFromUserLessons = location.state?.fromUserLessons;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(GET_CURRICULUM_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        const data = await response.json();
        const courseData = data.Items.find(item => item.PathId === courseId);
        if (courseData) {
          setCourse(courseData);
          // Check if course is already added
          checkIfCourseAdded(courseData.PathId);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const checkIfCourseAdded = async (pathId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.UserId) return;

      const response = await fetch(GET_USER_CURRICULUM_URL,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.UserId
        })
      });  
      if (!response.ok) return;

      const data = await response.json();
      console.log("in course details user enrolled courses");
      console.log(data);
      console.log(data.Items);
      // console.log("in course details"+data[0].PathId);
      const isAdded = data.some(item => String(item.PathId) === String(pathId));
      console.log("is added"+isAdded);
      setIsAlreadyAdded(isAdded);
    } catch (err) {
      console.error('Error checking course status:', err);
    }
  };

  const handleAddToCourse = async () => {
    try {
      setIsAdding(true);
      setAddError(null);
      
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.UserId) {
        throw new Error('User not logged in');
      }

      const response = await fetch(SET_USER_CURRICULUM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.UserId,
          curriculum: course.Title,
          pathId: course.PathId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      setIsAlreadyAdded(true);
      alert('Course added successfully!');
      navigate('/user-lessons');
    } catch (err) {
      setAddError(err.message);
      console.error('Error adding course:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/lesson/${courseId}/${lessonId}`, { 
      state: { fromUserLessons: isFromUserLessons,pathId:course.PathId }
    });
  };

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="course-details">
      <div className="course-header">
        <h1>{course.Title}</h1>
        {!isFromUserLessons && (
          <button 
            className={`add-course-btn ${isAlreadyAdded ? 'already-added' : ''}`}
            onClick={handleAddToCourse}
            disabled={isAdding || isAlreadyAdded}
          >
            {isAdding ? 'Adding...' : isAlreadyAdded ? 'Already Added' : 'Add to your course'}
          </button>
        )}
        {addError && <div className="error-message">{addError}</div>}
        <div className="course-meta">
          {/* {<span>⏱ {course.EstimatedDurations} hours</span>} */}
          <span>📚 {course.Lessons.length} lessons</span>
        </div>
        <div className="course-description">
          {course.Description.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="lessons-list">
        <div className="roadmap-button-container">
          <button 
            className="roadmap-button"
            onClick={() => navigate(`/roadmap/${course.PathId}`)}
          >
            <span>🗺️</span>
            View Course Roadmap
          </button>
        </div>
        <h2>Course Lessons</h2>
        <div className="lessons-grid">
          {course.Lessons.map((lesson) => (
            <div 
              key={lesson.LessonId} 
              className="lesson-card"
              onClick={() => handleLessonClick(lesson.LessonId)}
            >
              <h3>{lesson.LessonName}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails; 