import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { LOGIN_URL } from '../api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Clear any existing token when login page loads
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting to login with:', { Email: email, Password: password });
      
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Email: email,
          Password: password
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text(); 
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log('Response data:', data);

      if (data.Msg === "Login successfully completed") {
        // Store authentication state and user data
        localStorage.setItem('token', 'authenticated');
        
        localStorage.setItem('user', JSON.stringify({
          UserId: data.User.Item.UserId,
          Email: data.User.Item.Email,
          FullName: data.User.Item.FullName
        }));

        console.log(localStorage.getItem('user'))
        window.location.href = '/dashboard'; // Force a full page reload
      } else {
        setError(data.Msg || 'Login failed');
      }
    } catch (err) {
      console.error('Full error:', err);
      if (err.message.includes('SyntaxError')) {
        setError('Server connection error. Please check if the server is running.');
      } else {
        setError(`Login failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
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
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>Sign up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 