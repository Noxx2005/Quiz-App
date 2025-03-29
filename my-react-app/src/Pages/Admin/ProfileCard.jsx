import React, { useState } from "react";
import "./ProfileCard.css";

const ProfileCard = ({ student }) => {
  const [isSuspended, setIsSuspended] = useState(student.isSuspended);

  const handleToggleSuspend = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found in session storage");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/suspend-user/${student.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to toggle suspension status");
        return;
      }

      // Toggle status locally
      setIsSuspended(!isSuspended);
    } catch (error) {
      console.error("Error toggling suspension status:", error);
    }
  };

  return (
    <div className="profile-card">
      <p><strong>ID:</strong> {student.id}</p>
      <p><strong>Name:</strong> {student.fullName}</p>
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Status:</strong> {isSuspended ? "Suspended" : "Active"}</p>
      <button className={`profile-btn ${isSuspended ? "reinstate" : "suspend"}`} onClick={handleToggleSuspend}>
        {isSuspended ? "Reinstate" : "Suspend"}
      </button>
    </div>
  );
};

export default ProfileCard;
