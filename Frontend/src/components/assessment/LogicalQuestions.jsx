import React from 'react';
import '../../styles/Assessment.css';
import { logicalQuestions } from '../../pages/dummyData';

const LogicalQuestions = ({ onAnswerSelect, onPrevious, currentQuestionIndex, answers, selectedAnswer }) => {
  const questions = logicalQuestions.questions;
  const currentQ = questions[currentQuestionIndex];

  console.log('LogicalQuestions render:', {
    currentQuestionIndex,
    totalQuestions: questions.length,
    currentQuestion: currentQ,
    answers
  });

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
      </div>
    </div>
  );
};

export default LogicalQuestions; 