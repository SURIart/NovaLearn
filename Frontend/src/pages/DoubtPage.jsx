import React, { useState } from "react";
import "../styles/DoubtPage.css";

const DoubtPage = () => {
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

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
      const response = await fetch(`http://192.168.0.108:8000/questions/${inputMessage}`);

      const data = await response.json();
      
      
      console.log("lolololololololololololol")
      
      // Process the first 5 questions
      const questionsList = data[inputMessage].slice(0, 5).map((item, index) => {
          return `Question ${index + 1}: ${item.question}\n`
              //    `Choices: ${item.choices.map((choice)=>choice.join(" - ")).join(", ")}\n` +
              //    `Difficulty Level: ${item.difficulty}\n`;
      }).join('\n\n');

      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        text: questionsList || "I couldn't find any relevant questions for your query.",
        time: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("API Error:", error); // For debugging
      const errorMessage = {
        id: messages.length + 2,
        type: "ai",
        text: `Error: ${error.message}. Please try again.`,
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  return (
    <div className="doubt-container">
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
