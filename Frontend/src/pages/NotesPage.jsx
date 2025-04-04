import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../styles/Lesson.css';
import { useLocation } from 'react-router-dom';
import { GET_LESSON_CONTENT_URL } from '../api';
import { GET_CURRICULUM_URL } from '../api';
import { GET_PERSONALISED_NOTES_URL } from '../api';

const user_pref = [
    "Concise", "Step-by-Step", "In-depth", "Technical", "Simplified", "Formal", 
    "Casual", "Neutral", "Persuasive", "Descriptive", "Young Students", 
    "High school", "Expert", "Universal", "Bullet Points", "Paragraph", 
    "Code and Example", "Question and Answer", "More Engaging", "More Objective", 
    "More Visual", "More Direct", "Short Paragraphs", "Long-form Content", 
    "Dialog Format", "Table or Chart", "Real-world Comparison", "Humorous", 
    "Analytical", "Motivational", "Optimistic", "Professional", "Case Study", 
    "Historical Narrative", "Story-Telling", "Minimalist", "References"
];

const NotesPage = () => {
  const { courseId, lessonId } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const lessonContent = location.state?.lessonContent;
  const [lessonData, setLessonData] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        // Get user data
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.UserId;

        // Fetch course data to get lesson name and curriculum
        const courseResponse = await fetch(GET_CURRICULUM_URL);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course details');
        }
        const courseData = await courseResponse.json();
        const course = courseData.Items.find(item => item.PathId === courseId);
        
        if (course) {
          const lesson = course.Lessons.find(l => l.LessonId === lessonId);
          const lessonName = lesson?.LessonName || 'Unknown Lesson';

          // Make API call to get lesson content
          const response = await fetch(GET_LESSON_CONTENT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              lessonId: lessonId,
              lessonName: lessonName,
              curriculum: course.Title
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch lesson content');
          }

          const data = await response.json();
          console.log('Lesson Content Response:', data);
          setLessonData(data);

          // Fetch the content from the document URL
          const contentResponse = await fetch(data.document_url);
          if (!contentResponse.ok) {
            throw new Error('Failed to fetch document content');
          }
          const textContent = await contentResponse.text();
          setContent(textContent);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonContent();
  }, [lessonId, courseId]);

  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const handlePreferenceChange = (pref) => {
    setSelectedPreferences(prev => {
      if (prev.includes(pref)) {
        return prev.filter(p => p !== pref);
      } else if (prev.length < 6) {
        return [...prev, pref];
      }
      return prev;
    });
  };

  const handlePersonaliseClick = () => {
    setShowPreferences(true);
  };

  const handleSubmitPreferences = async () => {
    if (selectedPreferences.length < 3) {
      alert('Please select at least 3 preferences');
      return;
    }

    setIsPersonalizing(true);
    const userData = JSON.parse(localStorage.getItem('user'));
    const userId = userData?.UserId;
    const userEmail = userData?.Email;

    if (lessonData) {
      const personalisedData = {
        userId: userId,
        lessonId: lessonId,
        Subject: lessonContent.Subject,
        LessonContent: lessonData.document_url,
        title: lessonContent.Title,
        Email: userEmail,
        UserPreference: selectedPreferences
      };

      console.log('Personalised Data:', personalisedData);

      try {
        const response = await fetch(GET_PERSONALISED_NOTES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(personalisedData)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch personalized notes');
        }

        const data = await response.json();
        console.log('Personalized Notes Response:', data);

        // Fetch the personalized content
        const contentResponse = await fetch(data.Attributes.LessonContent.document_url);
        if (!contentResponse.ok) {
          throw new Error('Failed to fetch personalized content');
        }
        const personalizedContent = await contentResponse.text();

        // Update the lesson data and content
        setLessonData({
          ...lessonData,
          LessonContent: {
            document_url: data.Attributes.LessonContent.document_url
          }
        });
        setContent(personalizedContent);

        // Reload the page
        window.location.reload();
      } catch (error) {
        console.error('Error fetching personalized notes:', error);
      } finally {
        setIsPersonalizing(false);
        setShowPreferences(false);
      }
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-content">
        <button id="personalise-btn" onClick={handlePersonaliseClick}>
          <span className="btn-icon">🎯</span>
          <span>Personalise</span>
        </button>
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      {showPreferences && (
        <div className="preferences-modal">
          <div className="preferences-content">
            <h2>Select Your Preferences (3-6 options)</h2>
            <div className="preferences-grid">
              {user_pref.map((pref) => (
                <label key={pref} className="preference-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPreferences.includes(pref)}
                    onChange={() => handlePreferenceChange(pref)}
                    disabled={selectedPreferences.length >= 6 && !selectedPreferences.includes(pref)}
                  />
                  {pref}
                </label>
              ))}
            </div>
            <div className="preferences-actions">
              <button onClick={() => setShowPreferences(false)}>Cancel</button>
              <button 
                onClick={handleSubmitPreferences}
                disabled={selectedPreferences.length < 3 || isPersonalizing}
              >
                {isPersonalizing ? 'Personalizing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage; 