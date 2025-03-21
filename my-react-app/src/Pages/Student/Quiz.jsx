import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Quiz.css";
import { jwtDecode } from "jwt-decode"; // Import JWT decoding library

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { quizId, time } = location.state || { quizId: null, time: 5 };
  const API_URL = `http://localhost:5000/api/Quiz/GetQuizQuestions/${quizId}`;
  const SUBMIT_API_URL = "http://localhost:5000/api/Student/submit-quiz";

  const getStudentIdFromToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    } catch (error) {
      console.error("Invalid or expired token", error);
      return null;
    }
  };

  const studentId = getStudentIdFromToken();

  const savedQuizState = JSON.parse(localStorage.getItem("quizState")) || {};

  const [questions, setQuestions] = useState(savedQuizState.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState(savedQuizState.currentQuestion || 0);
  const [selectedAnswers, setSelectedAnswers] = useState(savedQuizState.selectedAnswers || Array(questions.length).fill(null));
  const [score, setScore] = useState(savedQuizState.score || 0);
  const [timeLeft, setTimeLeft] = useState(savedQuizState.timeLeft || time * 60);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(!questions.length);

  const saveQuizState = () => {
    localStorage.setItem(
      "quizState",
      JSON.stringify({
        questions,
        currentQuestion,
        selectedAnswers,
        score,
        timeLeft,
      })
    );
  };

  const fetchQuestions = async () => {
    try {
      if (questions.length > 0) return;

      setIsLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      if (Array.isArray(data)) {
        const formattedQuestions = data.map((item) => {
          const originalCorrectIndex = item.correctOption.charCodeAt(0) - "A".charCodeAt(0);
          const correctText = item.options[originalCorrectIndex];

          const shuffledOptions = shuffleArray([...item.options]);

          return {
            question: item.questionText,
            options: shuffledOptions,
            correctAnswer: shuffledOptions.indexOf(correctText),
          };
        });

        setQuestions(formattedQuestions);
        setSelectedAnswers(Array(formattedQuestions.length).fill(null));
        setIsLoading(false);

        localStorage.setItem(
          "quizState",
          JSON.stringify({
            questions: formattedQuestions,
            currentQuestion: 0,
            selectedAnswers: Array(formattedQuestions.length).fill(null),
            score: 0,
            timeLeft: time * 60,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !showScorePopup) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          saveQuizState();
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, showScorePopup]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const shuffleArray = (array) => {
    return array
      .map((item) => ({ value: item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((obj) => obj.value);
  };

  const confirmExit = (choice) => {
    if (choice === "yes") {
      localStorage.removeItem("quizState");
      navigate("/home");
    }
    setShowExitPopup(false);
  };

  const handleAnswerClick = (index) => {
    if (selectedAnswers[currentQuestion] !== null) return;

    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestion] = index;
    setSelectedAnswers(updatedAnswers);

    if (index === questions[currentQuestion].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    saveQuizState();
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      saveQuizState();
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      saveQuizState();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!studentId) {
      alert("Unauthorized: Please log in again.");
      navigate("/SignUp");
      return;
    }

    const quizResult = {
      studentId: parseInt(studentId),
      quizId: parseInt(quizId),
      score: score,
    };

    try {
      const response = await fetch(SUBMIT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizResult),
      });

      if (response.ok) {
        console.log("Quiz submitted successfully");
      } else {
        console.error("Failed to submit quiz result", await response.text());
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }

    setShowScorePopup(true);
    localStorage.removeItem("quizState");
  };

  if (isLoading) {
    return <div className="loading">Loading quiz...</div>;
  }

  return (
    <div className="back-g">
      <div className="quiz-container">
        <button className="exit-button" onClick={() => setShowExitPopup(true)}>Exit</button>
        <div className="top-info">
          <span>Time Left: {formatTime(timeLeft)}</span>
        </div>

        <div className="middle">
          <h1>Codehal Quiz</h1>
          <p>Quiz Website Tutorials</p>

          <div className="quiz-box">
            <h2>{questions[currentQuestion].question}</h2>
            <div className="options">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${
                    selectedAnswers[currentQuestion] === index
                      ? index === questions[currentQuestion].correctAnswer
                        ? "correct"
                        : "wrong"
                      : ""
                  }`}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswers[currentQuestion] !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="question-tracker">{currentQuestion + 1} of {questions.length} Questions</p>

            <div className="nav-buttons">
              <button className="prev-button" onClick={handlePrevious} disabled={currentQuestion === 0}>Previous</button>
              <button className="next-button" onClick={handleNext}>
                {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </div>

        {showExitPopup && (
  <div className="exit-popup">
    <p>Are you sure you want to exit?</p>
    <div className="popup-buttons">
      <button className="home-button" onClick={() => confirmExit("yes")}>Yes</button>
      <button className="retry-button" onClick={() => confirmExit("no")}>No</button>
    </div>
  </div>
)}

{showScorePopup && (
  <div className="score-popup">
    <h3>Quiz Completed!</h3>
    <p>Your Score: {score}/{questions.length}</p>
    <div className="popup-buttons">
      <button className="home-button" onClick={() => navigate("/home")}>Go to Home</button>
      <button className="retry-button" onClick={() => window.location.reload()}>Retry</button>
    </div>
  </div>
)}
      </div>
    </div>

    
  );
};

export default Quiz;
