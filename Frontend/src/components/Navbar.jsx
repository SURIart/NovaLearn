import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav>
      <h2>The Ultimate Learner</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/schedule">Schedule</Link></li>
        <li><Link to="/notes">All Notes</Link></li>
        <li><Link to="/lessons">Available Lessons</Link></li>
        <li><Link to="/mindmap">Mindmap</Link></li>
        <li><Link to="/roadmap">Roadmap</Link></li>
        <li><Link to="/analysis">Analysis</Link></li>
        <li><Link to="/whiteboard">Whiteboard</Link></li>
        <li><Link to="/assessment">Today’s Assessment</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
