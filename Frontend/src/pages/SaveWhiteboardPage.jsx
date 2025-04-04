import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../styles/SaveWhiteboardPage.css';
import { GET_SAVED_WHITEBOARDS_URL } from '../api';

const SaveWhiteboardPage = () => {
  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const WhiteBoardIds = location.state?.lessonContent.WhiteBoardIds;


  useEffect(() => {
    const fetchWhiteboardDetails = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.UserId;
        console.log("white boara "+WhiteBoardIds)
        if (!userId || !lessonId || !WhiteBoardIds) {
          throw new Error('Missing required data');
        }

        const response = await fetch(GET_SAVED_WHITEBOARDS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            lessonId,
            whiteboardIds: WhiteBoardIds
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch whiteboard details');
        }

        const data = await response.json();
        if (data.success) {
          setWhiteboards(data.whiteboards);
        } else {
          throw new Error('Failed to fetch whiteboard details');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching whiteboard details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWhiteboardDetails();
  }, [lessonId, WhiteBoardIds]);

  if (loading) {
    return (
      <div className="save-whiteboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading whiteboards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="save-whiteboard-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="save-whiteboard-page">
      <h1>Saved Whiteboards</h1>
      <div className="whiteboard-grid">
        {whiteboards.map((whiteboard, index) => (
          <div key={whiteboard.WhiteBoardId} className="whiteboard-card">
            <div className="whiteboard-image-container">
              <img 
                src={whiteboard.Image} 
                alt={`Whiteboard ${index + 1}`} 
                className="whiteboard-image"
              />
            </div>
            <div className="whiteboard-content">
              <div className="whiteboard-section">
                <h3>Prompt</h3>
                <p>{whiteboard.Prompt}</p>
              </div>
              <div className="whiteboard-section">
                <h3>AI Response</h3>
                <p>{whiteboard.AIResponse}</p>
              </div>
              <div className="whiteboard-footer">
                <span className="timestamp">
                  {new Date(whiteboard.AddedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaveWhiteboardPage;  