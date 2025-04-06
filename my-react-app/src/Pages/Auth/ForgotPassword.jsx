import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Something went wrong.');
      }

      if (responseText.includes("Password reset email sent")) {
        setShowSuccessToast(true);

        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 5000);
      } else {
        throw new Error(responseText);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="main-container">
      {/* Back Button */}
      <button className="exit-button" onClick={() => navigate('/signup')}>&larr; Back</button>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="success-toast">
          Password reset link sent successfully! Redirecting...
        </div>
      )}

      <div className="forgot-password-container">
        <h2>Forgot Password</h2>
        <form onSubmit={handleEmailSubmit} autoComplete="off">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
