import { useNavigate } from "react-router-dom";
import "../styles/DashboardTiles.css";

const DashboardTiles = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-content">
      <div className="tile" onClick={() => navigate("/current-lesson")}>
        📖 Current Lesson Notes
      </div>
      <div className="tile" onClick={() => navigate("/video")}>
        🎥 Watch Lesson
      </div>
      <div className="tile" onClick={() => navigate("/doubt")}>
        ❓ Ask a Doubt
      </div>
      <div className="tile" onClick={() => navigate("/whiteboard")}>
        🖊️ Open Whiteboard
      </div>
    </div>
  );
};

export default DashboardTiles;
