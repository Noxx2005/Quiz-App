import React from "react";
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import "./Sidebar.css"; // Import CSS file

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Profile Section */}
      <div className="profile">
        <FaUserCircle className="profile-icon1" />
        <h3>Welcome Admin</h3>
      </div>

      {/* Navigation List */}
      <ul className="menu">
        {/* <li><a href="/create-quiz">Create Quiz</a></li> */}
        <li><a href="/manage-quiz">Manage Quiz</a></li>
        <li><a href="/manage-student">Manage Students</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
