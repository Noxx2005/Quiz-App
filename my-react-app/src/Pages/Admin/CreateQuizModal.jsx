import React, { useState } from "react";
import "./CreateQuizModal.css";

const CreateQuizModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    description: "",
    time: "",
    quizAmount: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in session storage");
      return;
    }

    const payload = {
      subject: formData.subject,
      topic: formData.topic,
      description: formData.description,
      time: parseInt(formData.time, 10), // Ensure time is a number
      quizAmount: parseInt(formData.quizAmount, 10), // Ensure quizAmount is a number
      isActive: formData.isActive,
    };

    try {
      const response = await fetch("http://localhost:5000/api/admin/create-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Quiz created successfully!");
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Failed to create quiz: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("An error occurred while creating the quiz.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create a New Quiz</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="topic"
            placeholder="Topic"
            value={formData.topic}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="time"
            placeholder="Time (in minutes)"
            value={formData.time}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quizAmount"
            placeholder="Number of Questions"
            value={formData.quizAmount}
            onChange={handleChange}
            required
          />
          <label className="isactive">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active Quiz
          </label>
          <div className="modal-actions">
            <button type="submit" className="submit-btn">Create</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;
