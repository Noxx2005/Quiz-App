import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './Components/Navbar';
import Home from "./Pages/Student/Home";
import Quiz from "./Pages/Student/Quiz";
import SignUp from "./Pages/Auth/SignUp";
import ProfileIcon from "./Pages/Student/ProfileIcon";
import StudentDashboard from "./Pages/Student/StudentDashboard";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import './App.css';

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      {/* <ProfileIcon /> */}
      <Routes>
        <Route path="/Quiz" element={<Quiz/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Profile" element={<StudentDashboard />} />
        <Route path="/Dashboard" element={<AdminDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
