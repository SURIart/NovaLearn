import React from 'react';
import '../../styles/Assessment.css';
import { comprehensionQuestions } from '../../pages/dummyData';

const ComprehensionQuestions = ({ onAnswerSelect, onPrevious, currentQuestionIndex, answers, selectedAnswer }) => {
  const questions = comprehensionQuestions.questions;
  const currentQ = questions[currentQuestionIndex];
  const passage = comprehensionQuestions.paragraph;

  console.log('ComprehensionQuestions render:', {
    currentQuestionIndex,
    totalQuestions: questions.length,
    currentQuestion: currentQ,
    passage,
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
        <p className="passage">{passage}</p>
        <p className="question">{currentQ.question}</p>
        
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

export default ComprehensionQuestions; 