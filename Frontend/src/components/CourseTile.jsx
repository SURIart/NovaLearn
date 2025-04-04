import { useNavigate } from "react-router-dom";
import "../styles/CourseTile.css";

const CourseTile = ({ course }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div className="course-tile" onClick={handleClick}>
      <img src={course.image} alt={course.title} className="course-image" />
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <div className="course-meta">
          <span>⏱ {course.duration}</span>
          <span>📚 {course.lessons} lessons</span>
        </div>
      </div>
    </div>
  );
};

export default CourseTile;
