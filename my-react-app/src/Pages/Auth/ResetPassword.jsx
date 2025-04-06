import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css';

const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const email = new URLSearchParams(location.search).get('email');

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset the password.');
      }

      const data = await response.json();

      if (data.success) {
        navigate('/signup');
      } else {
        setErrorMessage('Invalid token or something went wrong.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="reset-password-wrapper">
      {/* Exit button */}
      <button className="exit-button" onClick={() => navigate('/signup')}>&larr; Back</button>

      <div className="reset-password-container">
        <h2>Reset Your Password</h2>
        <form onSubmit={handlePasswordReset} autoComplete="off">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your token"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
