import React, { useState, useEffect } from "react";
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

  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/get-all-quizzes");
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await response.json();

        // Get userId from session storage
        const userId = sessionStorage.getItem("userId");

        if (!userId) {
          console.error("No userId found in session storage");
          return;
        }

        // Filter quizzes based on the adminId matching the userId from session storage
        const filteredQuizzes = data.filter((quiz) => quiz.adminId === Number(userId));
        
        setQuizzes(filteredQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      [name]: name === "quizId" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizData.quizId) {
      alert("Please select a quiz before submitting.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/Quiz", {
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
        {isLoading ? (
          <p>Loading quizzes...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <select 
              name="quizId" 
              value={quizData.quizId} 
              onChange={handleChange} 
              required
              className="quiz-select"
            >
              <option value="">Select a Quiz</option>
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.topic} ({quiz.subject})
                  </option>
                ))
              ) : (
                <option disabled>No quizzes available</option>
              )}
            </select>

            <input 
              type="text" 
              name="questionText" 
              placeholder="Question" 
              value={quizData.questionText} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="optionA" 
              placeholder="Option A" 
              value={quizData.optionA} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="optionB" 
              placeholder="Option B" 
              value={quizData.optionB} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="optionC" 
              placeholder="Option C" 
              value={quizData.optionC} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="optionD" 
              placeholder="Option D" 
              value={quizData.optionD} 
              onChange={handleChange} 
              required 
            />
            <select
              name="correctOption"
              value={quizData.correctOption}
              onChange={handleChange}
              required
            >
              <option value="">Correct Option</option>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
            
            <button className="buto" type="submit">Submit Question</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuizForm;
