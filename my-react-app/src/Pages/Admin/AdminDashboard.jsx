import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar";
import QuizForm from "./QuizForm";
import CreateQuizModal from "./CreateQuizModal"; // Import the modal component
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="dashboard-content">
        {/* Top bar with button */}
        <div className="top-bar">
          <button className="create-quiz-btn" onClick={() => setIsModalOpen(true)}>
            Create Quiz
          </button>
        </div>

        {/* Main Content */}
        <QuizForm />

        {/* Modal for Creating Quiz */}
        {isModalOpen && <CreateQuizModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
