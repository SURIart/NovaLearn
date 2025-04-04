import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Lesson.css';

const GeneralNotesPage = () => {
  const { courseId, lessonId } = useParams();

  useEffect(() => {
    console.log('General Notes Page - Course ID:', courseId);
    console.log('General Notes Page - Lesson ID:', lessonId);
  }, [courseId, lessonId]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>General Notes</h1>
        <div className="page-indicator">
          <span className="indicator-dot"></span>
          <span className="indicator-text">General Notes Page</span>
        </div>
      </div>
      <div className="page-content">
        <p>General notes content will be displayed here.</p>
      </div>
    </div>
  );
};

export default GeneralNotesPage; 