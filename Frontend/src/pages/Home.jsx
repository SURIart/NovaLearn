import Navbar from "../components/Navbar";
import CourseTile from "../components/CourseTile";
import "../styles/App.css";
import Assessment from "../components/assessment/Assessment";

const courses = [
  { id: 1, title: "Web Development", image: "/images/webdev.jpg" },
  { id: 2, title: "Machine Learning", image: "/images/ml.jpg" },
  { id: 3, title: "Cyber Security", image: "/images/cyber.jpg" },
  { id: 4, title: "Data Science", image: "/images/datascience.jpg" },
];

const Home = () => {
  return (
    <>
    <div>
      {/* <Navbar /> */}
      <h1>Welcome to The Ultimate Learner</h1>
      <div className="course-list">
        {courses.map((course) => (
          <CourseTile key={course.id} course={course} />
        ))}
      </div>
    </div>
    
    </>
  );
};

export default Home;
