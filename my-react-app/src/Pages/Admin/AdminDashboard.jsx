import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import QuizForm from "./QuizForm";
import CreateQuizModal from "./CreateQuizModal";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="dashboard-content">
        {/* Top bar with button */}
        <div className="top-bar">
          <button 
            className="create-quiz-btn" 
            onClick={() => setIsModalOpen(true)}
            aria-label="Create new quiz"
          >
            {isMobile ? 'New Quiz' : 'Create Quiz'}
          </button>
        </div>

        {/* Main Content */}
        <QuizForm />

        {/* Modal for Creating Quiz */}
        {isModalOpen && (
          <CreateQuizModal 
            onClose={() => setIsModalOpen(false)} 
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;