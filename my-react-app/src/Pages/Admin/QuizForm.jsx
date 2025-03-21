import React, { useState } from "react";
import "./QuizForm.css";

const QuizForm = () => {
  const [quizData, setQuizData] = useState({
    quizId: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
  });

  const handleChange = (e) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://your-api-url.com/api/quizquestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      if (response.ok) {
        alert("Question added successfully!");
        setQuizData({
          quizId: "",
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOption: "",
        });
      } else {
        alert("Failed to add question.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };

  return (
        <div className="form-container1">
        <div className="form-box">
      <h2>Add a Quiz Question</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="quizId" placeholder="Quiz ID" value={quizData.quizId} onChange={handleChange} required />
        <input type="text" name="questionText" placeholder="Question" value={quizData.questionText} onChange={handleChange} required />
        <input type="text" name="optionA" placeholder="Option A" value={quizData.optionA} onChange={handleChange} required />
        <input type="text" name="optionB" placeholder="Option B" value={quizData.optionB} onChange={handleChange} required />
        <input type="text" name="optionC" placeholder="Option C" value={quizData.optionC} onChange={handleChange} required />
        <input type="text" name="optionD" placeholder="Option D" value={quizData.optionD} onChange={handleChange} required />
        <input type="text" name="correctOption" placeholder="Correct Option (A, B, C, D)" value={quizData.correctOption} onChange={handleChange} required />
        <button type="submit">Submit Question</button>
      </form>
      </div>
      </div>
  );
};

export default QuizForm;
