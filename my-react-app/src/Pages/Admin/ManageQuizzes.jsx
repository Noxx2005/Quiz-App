import React, { useState, useEffect } from "react";
import "./ManageQuizzes.css";
import Sidebar from "../../Components/Sidebar";
import QuizCard from "./QuizCard";

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState([]);
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    // Get subjects from session storage and clean spaces
    const storedSubjects = sessionStorage.getItem("subjects");
    if (storedSubjects) {
      setSubjects(storedSubjects.split(",").map((s) => s.trim().toLowerCase()));
    } else {
      console.warn("No subjects found in session storage");
    }

    // Fetch quizzes
    const fetchQuizzes = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("No token found in session storage");
          return;
        }

        const response = await fetch("http://localhost:5000/api/admin/get-all-quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Failed to fetch quizzes");
          return;
        }

        const allQuizzes = await response.json();
        setQuizzes(allQuizzes || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, []);

  // Fetch quiz results for the popup
  const handleViewResults = async (quiz) => {
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

      setSelectedQuiz(quiz);
      setShowPopup(true);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      setNoResultsMessage("Error fetching results.");
      setShowPopup(true);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      subjects.includes(quiz.subject.toLowerCase()) &&
      (quiz.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <Sidebar />
      <input
        type="text"
        placeholder="Search by subject or topic..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <div className="quiz-cards">
        {filteredQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} onViewResults={handleViewResults} />
        ))}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h3>Quiz Results for {selectedQuiz?.subject}</h3>

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

export default ManageQuizzes;
