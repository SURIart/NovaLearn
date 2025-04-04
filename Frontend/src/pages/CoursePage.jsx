import React from 'react';
import { useParams, Routes, Route } from 'react-router-dom';
import CourseSidebar from '../components/CourseSidebar';
import VideoPage from './VideoPage';
import DoubtPage from './DoubtPage';
import Whiteboard from './Whiteboard';
import AssessmentPage from './AssessmentPage';
import MindMapPage from './MindMapPage';

const CourseLessons = () => {
  const { courseId } = useParams();
  
  // Sample lessons data - replace with your actual data
  const lessons = [
    {
      id: 1,
      title: "Introduction to the Course",
      duration: "45 mins",
      completed: true
    },
    {
      id: 2,
      title: "Basic Concepts",
      duration: "1 hour",
      completed: false
    },
    {
      id: 3,
      title: "Advanced Topics",
      duration: "1.5 hours",
      completed: false
    },
    {
      id: 4,
      title: "Practical Examples",
      duration: "2 hours",
      completed: false
    }
  ];

  return (
    <div className="course-lessons">
      <h1>Course Lessons</h1>
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card">
            <div className="lesson-content">
              <h3>{lesson.title}</h3>
              <p>Duration: {lesson.duration}</p>
              <span className={`status ${lesson.completed ? 'completed' : 'pending'}`}>
                {lesson.completed ? '✓ Completed' : '○ Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CoursePage = () => {
  const { courseId } = useParams();

  return (
    <div className="course-container">
      <CourseSidebar courseId={courseId} />
      <div className="course-content">
        <Routes>
          <Route index element={<CourseLessons />} />
          <Route path="video" element={<VideoPage />} />
          <Route path="doubt" element={<DoubtPage />} />
          <Route path="whiteboard" element={<Whiteboard />} />
          <Route path="assessment" element={<AssessmentPage />} />
          <Route path="mindmap" element={<MindMapPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default CoursePage; 