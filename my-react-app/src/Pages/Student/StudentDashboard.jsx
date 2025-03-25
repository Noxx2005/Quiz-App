import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { jwtDecode } from "jwt-decode";
import "./StudentDashboard.css"; // Import the CSS file

const StudentDashboard = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("No token found! Please log in.");
      return;
    }

    const decoded = jwtDecode(token);
    const studentId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const fullName = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

    // Fetch Student Profile
    fetch(`http://localhost:5000/api/User/profile?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({ id: studentId, fullName, email, isSuspended: data.isSuspended });
        setSubjects(data.subjects ? data.subjects.split(", ") : []);
      })
      .catch((err) => console.error("Error fetching profile:", err));

    // Fetch Quiz History
    fetch(`http://localhost:5000/api/User/history?studentId=${studentId}`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  // Function to update subjects
  const updateSubjects = (subject, action) => {
    if (!profile) return;

    fetch(`http://localhost:5000/api/User/profile/update-subjects?studentId=${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, action }),
    })
      .then((res) => res.json())
      .then(() => {
        if (action === "remove") {
          setSubjects(subjects.filter((s) => s !== subject));
        } else if (action === "add") {
          setSubjects([...subjects, subject]);
          setShowPopup(false);
        }
      })
      .catch((err) => console.error("Error updating subjects:", err));
  };

  return (
    <div className="dashboard-container">
      {/* Red X Button */}
      <button className="close-button" onClick={() => navigate("/home")}>✖</button>

      {/* Section 1: Student Profile */}
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
          <p>Loading profile...</p>
        )}
      </div>

      {/* Section 2 & 3: Subjects and Quiz History */}
      <div className="dashboard-content">
        {/* Subjects Section */}
        <div className="subjects-section">
          <h2>Subjects</h2>
          <button className="add-button" onClick={() => setShowPopup(true)}>Add Subject</button>
          <ul className="subjects-list">
            {subjects.map((subject, index) => (
              <li key={index} className="subject-item">
                <span>{subject}</span>
                <button className="remove-button" onClick={() => updateSubjects(subject, "remove")}>Remove</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quiz History Section */}
        <div className="history-section">
          <h2>Quiz History</h2>
          {history.length > 0 ? (
            <ul>
              {history.map((quiz) => (
                <li key={quiz.quizId}>
                  <strong>{quiz.subject}</strong> - {quiz.topic} <br />
                  Score: {quiz.score} | Passed: {quiz.isPassed ? "Yes" : "No"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No quiz attempts found.</p>
          )}
        </div>
      </div>

      {/* Add Subject Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Subject</h3>
            <input
              type="text"
              placeholder="Enter subject name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <button onClick={() => updateSubjects(newSubject, "add")}>Confirm</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
