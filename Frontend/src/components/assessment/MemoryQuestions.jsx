import React, { useState, useEffect } from 'react';
import '../../styles/Assessment.css';
import { memoryQuestions } from '../../pages/dummyData';

const MemoryQuestions = ({ onAnswerSelect, onPrevious, currentQuestionIndex, answers, selectedAnswer }) => {
  const questions = memoryQuestions.questions;
  const paragraph = memoryQuestions.paragraph;
  const currentQ = questions[currentQuestionIndex];
  const [showParagraph, setShowParagraph] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);

  console.log('MemoryQuestions render:', {
    currentQuestionIndex,
    totalQuestions: questions.length,
    currentQuestion: currentQ,
    answers
  });

  useEffect(() => {
    if (showParagraph && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowParagraph(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showParagraph, timeLeft]);

  if (!questions.length) {
    console.log('No questions available');
    return <div className="error">No questions available</div>;
  }

  return (
    <div className="question-container">
      <div className="question-header">
        <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
      </div>
      
      <div className="question-content">
        {showParagraph ? (
          <div className="paragraph-display">
            <h3>Read the following paragraph carefully</h3>
            <p>{paragraph}</p>
            <div className="timer">Time remaining: {timeLeft} seconds</div>
          </div>
        ) : (
          <>
            <p>{currentQ.question}</p>
            
            <div className="options">
              {currentQ.choices.map((choice, index) => (
                <button
                  key={index}
                  className={`option ${selectedAnswer === choice[1] ? 'selected' : ''}`}
                  onClick={() => onAnswerSelect(choice[1])}
                >
                  {choice[0]}. {choice[1]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemoryQuestions; 