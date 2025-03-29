import React from "react";
import "./QuizCard.css";

const QuizCard = ({ quiz, onClick }) => {
  return (
    <div className="quiz2-card" onClick={onClick}>
      <h3>{quiz.subject}</h3>
      <p><strong>Topic:</strong> {quiz.topic}</p>
      <p><strong>Description:</strong> {quiz.description}</p>
      <button className="quiz-btn">Take Quiz</button>
    </div>
  );
};

export default QuizCard;
