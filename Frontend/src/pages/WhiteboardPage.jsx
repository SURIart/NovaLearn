import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import '../styles/WhiteboardPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { SAVE_WHITEBOARD_URL, GENERATE_WHITEBOARD_URL } from '../api';

const WhiteboardPage = () => {
  const [notification, setNotification] = useState({ show: false, message: '', type: '', action: null });
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [showViewButton, setShowViewButton] = useState(false);
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message, type = 'success', action = null) => {
    setNotification({ show: true, message, type, action });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '', action: null });
    }, 5000);
  };

  // Prevent default scrolling behavior
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

      const preventDefault = (e) => e.preventDefault();

      const events = ['touchstart', 'touchmove', 'touchend', 'wheel'];
      events.forEach((event) => {
        container.addEventListener(event, preventDefault, { passive: false });
      });

      return () => {
        events.forEach((event) => {
          container.removeEventListener(event, preventDefault);
        });
      };
    }
  }, []);

  // Handle whiteboard state change
  const handleWhiteboardChange = useCallback((editor) => {
    if (editor) {
      editorRef.current = editor;
      console.log('Whiteboard is ready.');
    }
  }, []);

  // Handle analyze button click
  const handleAnalyzeClick = () => {
    setShowPromptInput(true);
    setAnalysisData(null);
    setShowViewButton(false);
  };

  // Handle prompt submission
  const handlePromptSubmit = async () => {
    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    if (!editorRef.current) return;

    setIsSubmitting(true);

    try {
      // Get user data
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.UserId) {
        throw new Error('User not logged in');
      }

      // Get all shape IDs from the current page
      const shapeIds = editorRef.current.getCurrentPageShapeIds();
      if (shapeIds.size === 0) {
        showNotification('No content to analyze', 'error');
        return;
      }

      // Convert Set to Array for toImage method
      const shapeIdsArray = Array.from(shapeIds);
      const { blob } = await editorRef.current.toImage(shapeIdsArray, { 
        format: 'png', 
        background: true 
      });

      // Convert blob to File
      const file = new File([blob], `whiteboard_${Date.now()}.png`, { type: 'image/png' });

      // Create FormData and append all required fields
      const formData = new FormData();
      formData.append('userId', userData.UserId);
      formData.append('lessonId', lessonId);
      formData.append('image', file);
      formData.append('prompt', prompt);

      // Log the request body
      console.log('Request Body:', {
       
        prompt: prompt,
        image: file
      });

      // Upload to API
      const response = await fetch(GENERATE_WHITEBOARD_URL, {  
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('Upload Response:', data);

      if (data.message === 'success') {
        setAnalysisData(data);
        showNotification('Analysis completed successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      showNotification(error.message || 'Failed to analyze image', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save whiteboard
  const handleSave = async () => {
    if (!analysisData) return;

    setIsSaving(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.UserId) {
        throw new Error('User not logged in');
      }

      const response = await fetch(SAVE_WHITEBOARD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.UserId,
          lessonId: lessonId,
          imageUrl: analysisData.imageUrl,
          prompt: analysisData.prompt,
          response: analysisData.response
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save whiteboard');
      }

      const data = await response.json();
      if (data.message === 'saved successfully') {
        setShowViewButton(true);
        showNotification('Whiteboard saved successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to save whiteboard');
      }
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      showNotification(error.message || 'Failed to save whiteboard', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close prompt input
  const handleClosePrompt = () => {
    setShowPromptInput(false);
    setPrompt('');
    setAnalysisData(null);
    setShowViewButton(false);
    setIsSubmitting(false);
    setIsSaving(false);
  };

  return (
    <div className="whiteboard-page">
      <div className="whiteboard-container" ref={containerRef}>
        <Tldraw
          showMenu
          showPages={false}
          showStyles
          showUI
          showToolbar
          onMount={handleWhiteboardChange}
        />
      </div>
      <div className="controls">
        <button onClick={handleAnalyzeClick} className="extract-btn">Analyze Image</button>
      </div>

      {showPromptInput && (
        <div className="prompt-overlay">
          <div className="prompt-container">
            <h3>Enter your prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
              disabled={!!analysisData}
            />
            {analysisData && (
              <div className="analysis-response">
                <h4>Analysis Response:</h4>
                <p>{analysisData.response}</p>
              </div>
            )}
            <div className="prompt-buttons">
              {!analysisData ? (
                <>
                  <button 
                    onClick={handlePromptSubmit} 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button 
                    onClick={handleClosePrompt} 
                    className="cancel-btn"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </>
              ) : !showViewButton ? (
                <>
                  <button 
                    onClick={handleSave} 
                    className="submit-btn"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleClosePrompt} 
                    className="cancel-btn"
                    disabled={isSaving}
                  >
                    Cancel
                  </button> 
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate(-1)} 
                    className="submit-btn"
                  >
                    View Saved Boards
                  </button>
                  <button 
                    onClick={handleClosePrompt} 
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          {notification.action && (
            <span 
              className="notification-action"
              onClick={notification.action}
            >
              Go to Save Page
            </span>
          )}
        </div> 
      )}
    </div>
  );
};

export default WhiteboardPage;
