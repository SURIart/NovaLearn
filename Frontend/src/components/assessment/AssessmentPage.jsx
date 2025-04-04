import React, { useState, useEffect } from 'react';
import MemoryQuestions from './MemoryQuestions';
import { useNavigate } from 'react-router-dom';
import '../../styles/Assessment.css';

const AssessmentPage = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { 
    // Randomly determine the order of sections
    const sectionOrder = ['logical', 'memory', 'comprehension']
      .sort(() => Math.random() - 0.5);
    setSections(sectionOrder);

    // Fetch the first section's questions
    fetchQuestions(sectionOrder[0]);
  }, []);

  const fetchQuestions = async (section) => {
    try {
      const response = await fetch(`http://shinkansen.proxy.rlwy.net:11599/${section}`);
      const data = await response.json();
      
      if (section === 'logical') {
        setAnswers(new Array(data["logical/analytical"].length).fill(null));
      } else {
        setAnswers(new Array(data.questions.length).fill(null));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const calculateScore = (sectionAnswers, sectionQuestions) => {
    let score = 0;
    sectionAnswers.forEach((answer, index) => {
      const question = sectionQuestions[index];
      if (answer === question.correct_answer) {
        score += question.difficulty;
      }
    });
    return score;
  };

  const handleSectionComplete = (sectionAnswers) => {
    const currentSectionType = sections[currentSection];
    let sectionScore = 0;

    if (currentSectionType === 'logical') {
      sectionScore = calculateScore(sectionAnswers, data["logical/analytical"]);
    } else {
      sectionScore = calculateScore(sectionAnswers, data.questions);
    }

    setTotalScore(prev => prev + sectionScore);

    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      setLoading(true);
      fetchQuestions(sections[currentSection + 1]);
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Fetching Assessment...</h2>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="assessment-page">
        <div className="results-container">
          <h2>Assessment Complete!</h2>
          <div className="score-display">
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
          onComplete={handleSectionComplete}
          answers={answers}
          setAnswers={setAnswers}
        />
      </div>
    </div>
  );
};

export default AssessmentPage; 