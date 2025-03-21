import React, { useState } from "react";
import "./CreateQuizModal.css"; // Import styles

const CreateQuizModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    quizAmount: "",
    isActive: true
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch("YOUR_API_ENDPOINT/create-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Quiz created successfully!");
      onClose(); // Close modal
    } else {
      alert("Failed to create quiz.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create a New Quiz</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
          <input type="text" name="topic" placeholder="Topic" value={formData.topic} onChange={handleChange} required />
          <input type="number" name="quizAmount" placeholder="Number of Questions" value={formData.quizAmount} onChange={handleChange} required />
          
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
