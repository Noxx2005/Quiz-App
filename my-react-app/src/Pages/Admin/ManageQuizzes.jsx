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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(6); // 6 cards per page

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
        const userId = sessionStorage.getItem("userId"); // Fetch userId from session storage

        if (!token || !userId) {
          console.error("No token or userId found in session storage");
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
        
        // Log the quizzes fetched from API
        console.log("All Quizzes Fetched:", allQuizzes);

        // Filter quizzes where adminId matches userId
        const filteredQuizzes = allQuizzes.filter(quiz => quiz.adminId === parseInt(userId, 10));

        // Log the filtered quizzes
        console.log("Filtered Quizzes:", filteredQuizzes);

        setQuizzes(filteredQuizzes || []);
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

      console.log("API Response for Quiz Results:", data);

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

  // Filter quizzes based on search and subjects
  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      (quiz.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get current quizzes for pagination
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages needed
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  return (
    <div className="manage-quizzes-container">
      <Sidebar />
      <div className="quizzes-content">
        <input
          type="text"
          placeholder="Search by subject or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        
        <div className="quiz-cards">
          {currentQuizzes.length > 0 ? (
            currentQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onViewResults={handleViewResults} />
            ))
          ) : (
            <div className="no-quizzes-message">
              {searchQuery ? "No matching quizzes found" : "No quizzes available"}
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {filteredQuizzes.length > quizzesPerPage && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              &laquo; Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`pagination-button ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next &raquo;
            </button>
          </div>
        )}
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
