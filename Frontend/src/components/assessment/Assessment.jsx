import React, { useState } from 'react';
import LogicalQuestions from './LogicalQuestions';
import MemoryQuestions from './MemoryQuestions';
import ComprehensionQuestions from './ComprehensionQuestions';
import { useNavigate } from 'react-router-dom';
import '../../styles/Assessment.css';
import { logicalQuestions, memoryQuestions, comprehensionQuestions } from '../../pages/dummyData';

import { ADD_USER_MARKS_URL } from '../../api';


const Assessment = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [sections] = useState(['logical', 'memory', 'comprehension']);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sectionScores, setSectionScores] = useState({
    logical: 0,
    memory: 0,
    comprehension: 0
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const navigate = useNavigate();

  const calculateQuestionScore = (answer, question) => {
    if (!answer || !question) return 0;
    
    const selectedOption = question.choices.find(choice => choice[1] === answer);
    if (!selectedOption) return 0;
    
    const selectedOptionLetter = selectedOption[0];
    
    if (selectedOptionLetter === question.correct_answer) {
      switch (question.difficulty) {
        case 1: return 1;
        case 3: return 3;
        case 5: return 5;
        default: return 1;
      }
    }
    return 0;
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const sendAssessmentScores = async (finalScores) => {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      console.log('User Credentials:', userData);
      console.log('User ID:', userData.UserId);

      // Calculate the ratio r for comprehension score
      const maxComprehensionScore = comprehensionQuestions.questions.reduce((sum, q) => 
        sum + (q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3), 0);
      const r = finalScores.comprehension / maxComprehensionScore;
      const adjustedComprehensionScore = 47.5 * r + 4.95;

      // Prepare the payload
      const payload = {
        userId: userData.UserId,
        logicalScore: finalScores.logical,
        memoryScore: finalScores.memory,
        comprehensionScore: adjustedComprehensionScore
      };

      console.log('Sending assessment scores:', payload);

      const response = await fetch(ADD_USER_MARKS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to send assessment scores');
      }

      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('Error sending assessment scores:', error);
    }
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const currentSectionType = sections[currentSection];
    let currentQuestion;
    let currentQuestions;

    if (currentSectionType === 'logical') {
      currentQuestions = logicalQuestions.questions;
    } else if (currentSectionType === 'memory') {
      currentQuestions = memoryQuestions.questions;
    } else {
      currentQuestions = comprehensionQuestions.questions;
    }
    
    currentQuestion = currentQuestions[currentQuestionIndex];

    // Calculate score for this question
    const questionScore = calculateQuestionScore(selectedAnswer, currentQuestion);

    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    // Update section score
    setSectionScores(prev => ({
      ...prev,
      [currentSectionType]: prev[currentSectionType] + questionScore
    }));

    // Update total score
    setTotalScore(prev => prev + questionScore);

    // Reset selected answer
    setSelectedAnswer(null);

    // Move to next question or section
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        setCurrentQuestionIndex(0);
        const nextSectionType = sections[currentSection + 1];
        const nextSectionLength = nextSectionType === 'logical' ? 
          logicalQuestions.questions.length :
          nextSectionType === 'memory' ? 
            memoryQuestions.questions.length :
            comprehensionQuestions.questions.length;
        
        setAnswers(new Array(nextSectionLength).fill(null));
      } else {
        const finalScores = {
          ...sectionScores,
          [currentSectionType]: sectionScores[currentSectionType] + questionScore
        };

        const assessmentData = {
          totalScore: totalScore + questionScore,
          sectionScores: finalScores,
          answers: newAnswers,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem('assessmentResults', JSON.stringify(assessmentData));
        
        // Send scores to API
        sendAssessmentScores(finalScores);
        
        setShowResults(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
    }
  };

  if (showResults) {
    return (
      <div className="assessment-page">
        <div className="results-container">
          <h2>Assessment Complete!</h2>
          <div className="score-display">
            <h3>Section Scores:</h3>
            <p>Logical: {sectionScores.logical}</p>
            <p>Memory: {sectionScores.memory}</p>
            <p>Comprehension: {sectionScores.comprehension}</p>
            <h3>Total Score: {totalScore}</h3>
          </div>
          <button 
            className="nav-btn"
            onClick={() => navigate('/all-lessons')}
          >
            Return to Lessons
          </button>
        </div>
      </div>
    );
  }

  const CurrentSection = sections[currentSection] === 'logical' ? 
    LogicalQuestions : 
    sections[currentSection] === 'memory' ? 
      MemoryQuestions : 
      ComprehensionQuestions;

  return (
    <div className="assessment-page">
      <div className="assessment-header">
        <h1>Assessment</h1>
        <div className="section-progress">
          {sections.map((section, index) => (
            <div 
              key={index}
              className={`section-indicator ${index === currentSection ? 'active' : ''} 
                         ${index < currentSection ? 'completed' : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      
      <div className="assessment-content">
        <h2>{sections[currentSection].charAt(0).toUpperCase() + sections[currentSection].slice(1)} Questions</h2>
        <CurrentSection 
          onAnswerSelect={handleAnswerSelect}
          onPrevious={handlePrevious}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          selectedAnswer={selectedAnswer}
        />
        <div className="navigation-buttons">
          <button
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          <button
            className="nav-btn"
            onClick={handleNext}
            disabled={!selectedAnswer}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment; 