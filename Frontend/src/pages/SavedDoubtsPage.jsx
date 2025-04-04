import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../styles/Lesson.css';
import { GET_DOUBT_DETAILS_URL } from '../api';

const SavedDoubtsPage = () => {
  const { courseId, lessonId } = useParams();
  const location = useLocation();  
  const lessonContent = location.state?.lessonContent;
  const doubtSolvingIds = location.state?.doubtSolvingIds;
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.UserId;
        console.log("doubtSolvingIds "+doubtSolvingIds)

        if (!doubtSolvingIds || doubtSolvingIds.length === 0) {
          setLoading(false);
          return;
        }

        const requestBody = {
          userId: userId,
          lessonId: lessonId,
          doubtIds: doubtSolvingIds.map(id => ({ "S": id }))
        };

        console.log('Fetch Doubts Request Body:', requestBody);

        const response = await fetch(GET_DOUBT_DETAILS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch doubts');
        }

        const data = await response.json();
        console.log('Fetch Doubts Response:', data);

        if (data.success) {
          setDoubts(data.doubts);
        }
      } catch (err) {
        console.error('Error fetching doubts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, [lessonId, doubtSolvingIds]);

  if (loading) {
    return <div className="loading">Loading saved doubts...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="doubt-container">
      <h1>Saved Doubts</h1>
      <div className="chat-container">
        <div className="chat-messages">
          {doubts.map((doubt, index) => (
            <div key={doubt.DoubtId} className="message-group">
              <div className="message user">
                <div className="message-avatar">👤</div>
                <div className="message-content">
                  <div className="message-text">{doubt.Prompt}</div>
                  <div className="message-time">
                    {new Date(doubt.AddedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="message ai">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
                    {doubt.AIResponse}
                  </div>
                  <div className="message-time">
                    {new Date(doubt.AddedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {doubts.length === 0 && (
            <div className="no-doubts">
              No saved doubts found for this lesson.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedDoubtsPage; 