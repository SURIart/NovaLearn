import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Lesson.css';

import { GET_CURRICULUM_URL } from '../api';
import {GET_USER_ENROLL_LESSONS_URL} from '../api';
const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFromUserLessons = location.state?.fromUserLessons;
  const [lessonContent, setLessonContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("path id in lesson page "+location.state.pathId);
 
  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        // Get user data
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.UserId;

        // Fetch course data to get lesson name
        const courseResponse = await fetch(GET_CURRICULUM_URL);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course details');
        }
        const courseData = await courseResponse.json();
        const course = courseData.Items.find(item => item.PathId === courseId);
        
        if (course) {
          const lesson = course.Lessons.find(l => l.LessonId === lessonId);
          const lessonName = lesson?.LessonName || 'Unknown Lesson';

          // Make API call to get lesson details
          const response = await fetch(GET_USER_ENROLL_LESSONS_URL, { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              lessonId: lessonId  
            })
          }); 

          if (!response.ok) {
            throw new Error('Failed to fetch lesson details');
          }

          const data = await response.json();
          console.log('Lesson API Response:', data);

          setLessonContent({
            title: lessonName,
            ...data
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonContent();
  }, [lessonId, courseId]);

  const handleGridItemClick = (path) => {
    if(path === 'roadmapPage'){
      const pathId = location.state.pathId;
      localStorage.setItem('pathId', pathId);
      console.log("path id in lesson page "+pathId);
      navigate(`/lesson/${courseId}/${lessonId}/${path}`,{
        state: {
          pathId: pathId
        }
      });
    }

    if (path === 'saved-boards') {
      navigate(`/lesson/${courseId}/${lessonId}/${path}`,{
        state: {
          lessonContent: lessonContent  
        }
      });
    } else if (path === 'doubtbot') {
      navigate(`/lesson/${courseId}/${lessonId}/${path}`, {
        state: {
          lessonContent: lessonContent
        }
      });
    } else if (path === 'personalised-notes') {
      navigate(`/lesson/${courseId}/${lessonId}/${path}`, {
        state: {
          lessonContent: lessonContent,
          doubtSolvingIds: lessonContent.DoubtSolvingIds
        }
      });
    } else {
      navigate(`/lesson/${courseId}/${lessonId}/${path}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading lesson content...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <h1>{lessonContent.title}</h1>
        {isFromUserLessons && (
          <div className="lesson-buttons">
            <button onClick={() => handleGridItemClick('mindmap')} className="lesson-btn">
              <span className="btn-icon">🧠</span>
              <span className="btn-text">Mind Map</span>
            </button>
            <button onClick={() => handleGridItemClick('doubtbot')} className="lesson-btn">
              <span className="btn-icon">❓</span>
              <span className="btn-text">Doubt Bot</span>
            </button>
            <button onClick={() => handleGridItemClick('whiteboard')} className="lesson-btn">
              <span className="btn-icon">✏️</span>
              <span className="btn-text">Whiteboard</span>
            </button>
            <button className="lesson-btn" onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}/notes`,{
              state: {
                lessonContent: lessonContent
              }
      
            })}> 
              <span className="btn-icon">📝</span>
              <span className="btn-text">Notes</span>
            </button>
            <button onClick={() => handleGridItemClick('personalised-notes')} className="lesson-btn">
              <span className="btn-icon">📓</span>
              <span className="btn-text">Saved Doubts</span>
            </button>
            <button onClick={() => handleGridItemClick('saved-boards')} className="lesson-btn">
              <span className="btn-icon">🎯</span> 
              <span className="btn-text">Saved Boards</span>
            </button>
            
          </div> 
        )}
      </div>

      <div className="lesson-content">
        <div className="lesson-section">
          <h2>Description</h2>
          <p>{lessonContent.Description}</p>
        </div>

        <div className="lesson-section">
          <h2>Applications</h2>
          <ul>
            {lessonContent.Applications.map((app, index) => (
              <li key={index}>{app}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-section">
          <h2>Prerequisites</h2>
          <ul>
            {lessonContent.Prerequisites.map((prereq, index) => (
              <li key={index}>{prereq}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-section">
          <h2>Next Lessons</h2>
          <ul>
            {lessonContent.NextLessons.map((next, index) => (
              <li key={index}>{next}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-section">
          <h2>Difficulty Level</h2>
          <p className="difficulty">{lessonContent.DifficultyLevel}</p>
        </div>
      </div>
    </div>
  );
};

export default Lesson; 