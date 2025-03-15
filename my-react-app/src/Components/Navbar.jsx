import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";

function Navbar() {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserName(decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  function handleLogout() {
    setIsLoading(true);
    
    // Clear session and redirect to signup
    sessionStorage.removeItem("token");
    navigate("/signup");
    
    setIsLoading(false);
  }

  return (
    <nav className="Custom-Navbar">
      <div className="Custom-Navbar-container">
        <div className="Custom-Navbar-brand">
          <img src="/quizSpark_icon.png" alt="QuizSpark Logo" className="logo" />
          <h2>Quiz <span className="highlight">Spark</span></h2>
        </div>

        <div className="Custom-Navbar-info">
          {userName && <span className="user-info">Welcome, {userName}!</span>}
          
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
