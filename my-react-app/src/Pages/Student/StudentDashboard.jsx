import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("No token found! Please log in.");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const decoded = jwtDecode(token);
        const studentId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const fullName = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

        // Fetch Student Profile
        const profileResponse = await fetch(`http://localhost:5000/api/User/profile?email=${email}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!profileResponse.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileResponse.json();

        // Fetch Quiz History
        const historyResponse = await fetch(`http://localhost:5000/api/user/history/${studentId}`, {
          headers: { 
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!historyResponse.ok) throw new Error("Failed to fetch history");
        const historyData = await historyResponse.json();

        setProfile({ 
          id: studentId, 
          fullName, 
          email, 
          isSuspended: profileData.isSuspended 
        });
        setSubjects(profileData.subjects ? profileData.subjects.split(", ") : []);
        setHistory(historyData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const updateSubjects = async (subject, action) => {
    if (!profile) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/User/profile/update-subjects?studentId=${profile.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ subject, action }),
      });

      if (!response.ok) throw new Error("Failed to update subjects");

      if (action === "remove") {
        setSubjects(subjects.filter((s) => s !== subject));
      } else if (action === "add") {
        setSubjects([...subjects, subject]);
        setShowPopup(false);
        setNewSubject("");
      }
    } catch (err) {
      console.error("Error updating subjects:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <button className="close-button" onClick={() => navigate("/home")}>✖</button>

      <div className="profile-section">
        <h2>Student Profile</h2>
        {profile ? (
          <div>
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Name:</strong> {profile.fullName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Suspended:</strong> {profile.isSuspended ? "Yes" : "No"}</p>
          </div>
        ) : (
          <p>No profile data available</p>
        )}
          <button 
            className="reset-password-button" 
            onClick={() => navigate("/forgot-password")}
          >
            Reset Password
          </button>
      </div>

      <div className="dashboard-content1">
        <div className="subjects-section">
          <h2>Subjects</h2>
          <button className="add-button" onClick={() => setShowPopup(true)}>Add Subject</button>
          <ul className="subjects-list">
            {subjects.length > 0 ? (
              subjects.map((subject, index) => (
                <li key={index} className="subject-item">
                  <span>{subject}</span>
                  <button 
                    className="remove-button" 
                    onClick={() => updateSubjects(subject, "remove")}
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <p>No subjects added yet</p>
            )}
          </ul>

          {/* Reset Password Button */}
        </div>

        <div className="history-section">
          <h2>Quiz History</h2>
          {history.length > 0 ? (
            <ul className="history-list">
              {history.map((quiz, index) => (
                <li key={index} className="history-item">
                  <div className="quiz-status">
                    <div 
                      className={`status-dot ${quiz.isPassed ? "passed" : "failed"}`}
                      title={quiz.isPassed ? "Passed" : "Failed"}
                    ></div>
                  </div>
                  <div className="quiz-info">
                    <div className="quiz-title">
                      <strong>{quiz.subject}</strong> - {quiz.topic}
                    </div>
                    <div className="quiz-score">Score: {quiz.score}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No quiz attempts found</p>
          )}
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content4">
            <h3>Add New Subject</h3>
            <input
              type="text"
              placeholder="Enter subject name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && updateSubjects(newSubject, "add")}
            />
            <div className="popup-buttons">
              <button 
                className="confirm-button" 
                onClick={() => updateSubjects(newSubject, "add")}
                disabled={!newSubject.trim()}
              >
                Add
              </button>
              <button 
                className="cancel-button" 
                onClick={() => {
                  setShowPopup(false);
                  setNewSubject("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
