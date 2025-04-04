import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Assessment from './components/assessment/Assessment';
import WhiteboardPage from './pages/WhiteboardPage';
import AllLessons from './pages/AllLessons';
import UserLessons from './pages/UserLessons'; 
import Sidebar from './components/Sidebar';
import CourseDetails from './pages/CourseDetails';
import Lesson from './pages/Lesson';
import MindMapPage from './pages/MindMapPage';
import DoubtBotPage from './pages/DoubtBotPage';
import GeneralNotesPage from './pages/GeneralNotesPage';
import SavedDoubtsPage from './pages/SavedDoubtsPage';
import NotesPage from './pages/NotesPage';
import SaveWhiteboardPage from './pages/SaveWhiteboardPage';
import RoadMapPage from './pages/RoadMapPage';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') === 'authenticated';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token') === 'authenticated';
  const isAssessmentPage = location.pathname === '/assessment';

  return (
    <div className="app">
      {isAuthenticated && !isAssessmentPage && <Sidebar />}
      <main className={`main-content ${isAssessmentPage ? 'full-width' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:courseId/:lessonId"
            element={
              <ProtectedRoute>
                <Lesson />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:courseId/:lessonId/mindmap"
            element={
              <ProtectedRoute>
                <MindMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:courseId/:lessonId/doubtbot"
            element={
              <ProtectedRoute>
                <DoubtBotPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:courseId/:lessonId/whiteboard"
            element={
              <ProtectedRoute>  
                <WhiteboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="roadmap/:pathId"
            element={
              <ProtectedRoute>
                <RoadMapPage />
              </ProtectedRoute> 
            }
          /> 
          <Route
            path="/lesson/:courseId/:lessonId/general-notes"
            element={
              <ProtectedRoute>
                <GeneralNotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:courseId/:lessonId/personalised-notes"
            element={
              <ProtectedRoute>
                <SavedDoubtsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:courseId/:lessonId/saved-boards"
            element={
              <ProtectedRoute>
                <SaveWhiteboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-lessons"
            element={
              <ProtectedRoute>
                <AllLessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-lessons"
            element={
              <ProtectedRoute>
                <UserLessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            }
          />
          <Route path="/course/:courseId/lesson/:lessonId/notes" element={<NotesPage />} />
          <Route
            path="/save-whiteboard"
            element={
              <ProtectedRoute>
                <SaveWhiteboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
