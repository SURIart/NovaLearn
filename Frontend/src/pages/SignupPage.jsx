import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

import { REGISTER_URL } from '../api';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FullName: fullName,
          Email: email,
          Password: password
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok && data.Msg === "user added successfully") {
        // Set authentication token for the new user
        localStorage.setItem('token', 'authenticated');
        // Store user data in the same format as LoginPage
        localStorage.setItem('user', JSON.stringify({
          UserId: data.user.UserId,
          Email: data.user.Email,
          FullName: data.user.FullName
        }));
        // Navigate to assessment page
        window.location.href = '/assessment'; // Force reload to ensure auth state is fresh
      } else {
        // Show error message from server
        setError(data.Msg || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSignup} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>

          <button type="submit" className="auth-button">
            Sign Up
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage; 