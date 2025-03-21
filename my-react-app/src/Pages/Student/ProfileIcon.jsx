import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileIcon.css"; // Create this CSS file
import "@fortawesome/fontawesome-free/css/all.min.css";


const ProfileIcon = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div 
      className="profile-hover-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate("/profile")}
    >
      <div className="profile-icon">
        <i className="fas fa-user"></i> {/* Person icon */}
      </div>
      {isHovered && (
        <div className="hover-modal">
          <p>Go to Profile</p>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
