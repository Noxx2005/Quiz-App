import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/signup");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false); // Close menu after navigation on mobile
  };

  return (
    <>
      {/* Mobile menu icon */}
      <div className="menu-icon" onClick={toggleMenu}>
        <FaBars />
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Profile Section */}
        <div className="profile">
          <FaUserCircle className="profile-icon1" />
          <h3>Welcome Admin</h3>
        </div>

        {/* Navigation List */}
        <ul className="menu">
          <li onClick={() => navigateTo("/DashBoard")}>Home</li>
          <li onClick={() => navigateTo("/Manage")}>Manage Quiz</li>
          <li onClick={() => navigateTo("/Student")}>Manage Students</li>
        </ul>

        {/* Logout Button */}
        <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;