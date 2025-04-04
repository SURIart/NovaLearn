import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../styles/DoubtPage.css";
import { SAVE_DOUBT_URL } from "../api";
import { GET_DOUBT_SOLVING_URL } from "../api";

const DoubtPage = () => {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const lessonContent = location.state?.lessonContent;
  const doubtSolvingIds = location.state?.doubtSolvingIds;
  
  console.log('DoubtSolvingIds:', doubtSolvingIds);
  console.log('Lesson Content:', lessonContent);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Hello! I'm your AI learning assistant. How can I help you today?",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastResponseId, setLastResponseId] = useState(null);

  const handleSaveDoubt = async (question, answer) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userId = userData?.UserId;

      const requestBody = {
        userId: userId,
        lessonId: lessonId,
        question: question,
        aiResponse: answer,
      };

      console.log('Save Doubt Request Body:', requestBody);

      const response = await fetch(SAVE_DOUBT_URL, {    
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to save doubt');
      }

      const data = await response.json();
      console.log('Doubt saved:', data);
      alert('Doubt saved successfully!');
    } catch (error) {
      console.error('Error saving doubt:', error);
      alert('Failed to save doubt. Please try again.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Get user data
    const userData = JSON.parse(localStorage.getItem('user'));
    const userId = userData?.UserId;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const requestBody = {
        userId: userId,
        topic: lessonContent?.Title || "General",
        question: inputMessage
      };

      console.log('Request Body:', requestBody);

      const response = await fetch(GET_DOUBT_SOLVING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      console.log('Response Data:', data);
      
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        text: data.AIResponse.response,
        time: new Date().toLocaleTimeString(),
        question: inputMessage // Store the question for saving
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setLastResponseId(aiMessage.id); // Update the last response ID
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        type: "ai",
        text: "Sorry, I encountered an error. Please try again.",
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  return (
    <div className="doubt-container">
      <h1>Doubt Bot</h1>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === "ai" ? "🤖" : "👤"}
              </div>
              <div className="message-content">
                <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
                  {message.text}
                </div>
                <div className="message-time">{message.time}</div>
                {message.type === "ai" && message.id === lastResponseId && (
                  <button 
                    className="save-doubt-btn"
                    onClick={() => handleSaveDoubt(message.question, message.text)}
                  >
                    Save this to your doubts
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">🤖</div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your question here..."
            autoFocus
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputMessage.trim() || isTyping}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoubtPage;
