import React, { useState } from "react";
import "./QuizCard.css";

const QuizCard = ({ quiz }) => {
  const [isActive, setIsActive] = useState(quiz.isActive);
  const [results, setResults] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState("");

  const handleToggle = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found in session storage");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/toggle-quiz/${quiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to toggle quiz status");
        return;
      }

      setIsActive(!isActive);
    } catch (error) {
      console.error("Error toggling quiz status:", error);
    }
  };

  const handleViewResults = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found in session storage");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/get-results/${quiz.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log("API Response:", data);

      if (typeof data === "string") {
        setResults([]);
        setNoResultsMessage(data);
      } else if (Array.isArray(data)) {
        setResults(data);
        setNoResultsMessage("");
      } else {
        setResults([]);
        setNoResultsMessage("No Result");
      }

      setShowPopup(true);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      setNoResultsMessage("Error fetching results.");
      setShowPopup(true);
    }
  };

  return (
    <div className="quiz-card">
      <h3>{quiz.subject}</h3>
      <p><strong>Topic:</strong> {quiz.topic}</p>
      <p><strong>Description:</strong> {quiz.description}</p>
      <p><strong>Created At:</strong> {new Date(quiz.createdAt).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {isActive ? "Active" : "Inactive"}</p>

      <div className="buttons">
        <button className={`toggle-btn ${isActive ? "disable" : "enable"}`} onClick={handleToggle}>
          {isActive ? "Disable" : "Enable"}
        </button>
        <button className="view-results-btn" onClick={handleViewResults}>
          View Results
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h3>Quiz Results</h3>

            {noResultsMessage ? (
              <p className="no-results">{noResultsMessage}</p>
            ) : results.length > 0 ? (
              <ul className="results-list">
                {results.map((result, index) => (
                  <li key={index}>
                    <strong>Student ID:</strong> {result.studentId} | <strong>Score:</strong> {result.score}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-results">No results available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
