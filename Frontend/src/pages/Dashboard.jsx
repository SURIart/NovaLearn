import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/App.css";

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample course data - replace with your actual data
  const courses = [
    {
      id: 1,
      title: "Introduction to React",
      description: "Learn the fundamentals of React development",
      image: "https://placehold.co/600x400/007bff/white?text=React",
      duration: "8 weeks",
      lessons: 24
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      description: "Master JavaScript concepts and patterns",
      image: "https://placehold.co/600x400/28a745/white?text=JavaScript",
      duration: "10 weeks",
      lessons: 32
    },
    {
      id: 3,
      title: "CSS & Sass Mastery",
      description: "Modern CSS techniques and Sass framework",
      image: "https://placehold.co/600x400/dc3545/white?text=CSS",
      duration: "6 weeks",
      lessons: 18
    },
    {
      id: 4,
      title: "Node.js Backend",
      description: "Build scalable backend applications",
      image: "https://placehold.co/600x400/ffc107/white?text=Node.js",
      duration: "12 weeks",
      lessons: 36
    }
  ];

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="dashboard-container">
      <h1>Your Courses</h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="course-tile"
            onClick={() => handleCourseClick(course.id)}
          >
            <img
              src={course.image}
              alt={course.title}
              className="course-image"
            />
            <div className="course-content">
              <h2 className="course-title">{course.title}</h2>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>⏱ {course.duration}</span>
                <span>📚 {course.lessons} lessons</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
