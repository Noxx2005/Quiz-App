import React, { useState, useEffect } from "react";
import "./Home.css";
import QuizCard from "./QuizCard";
import { useNavigate } from "react-router-dom"; 
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../Components/Navbar";
import { jwtDecode } from "jwt-decode";
import ProfileIcon from "./ProfileIcon";
const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleIndex, setVisibleIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/signup");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const studentId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

      if (!studentId) {
        throw new Error("Student ID not found in token.");
      }

      fetch(`http://localhost:5000/api/User/get-user-quizzes/${studentId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch quizzes: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setQuizzes(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
          setQuizzes([]); // Ensure quizzes is an empty array on error
        });

    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/signup");
    }
  }, [navigate]);

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle scrolling left and right
  const handleNext = () => {
    if (visibleIndex + 4 < filteredQuizzes.length) {
      setVisibleIndex(visibleIndex + 1);
    }
  };

  const handlePrev = () => {
    if (visibleIndex > 0) {
      setVisibleIndex(visibleIndex - 1);
    }
  };

  const handleQuizClick = (quiz) => {
    navigate("/quiz", { state: { quizId: quiz.id, time: quiz.time } });
  };

  return (
    <div>
      <Navbar />
      <div className="home-container">
        {/* Top Section */}
        <div className="top-section">
          <h1>Learn <span>10x Faster</span></h1>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <SearchBar setSearchQuery={setSearchQuery} />

          <div className="quiz-list">
            <button className="scroll-btn left" onClick={handlePrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="quiz-cards">
              {filteredQuizzes.slice(visibleIndex, visibleIndex + 4).map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} onClick={() => handleQuizClick(quiz)} />
              ))}
            </div>

            <button className="scroll-btn right" onClick={handleNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
      <ProfileIcon />
    </div>
  );
};

export default Home;
