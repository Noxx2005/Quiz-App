import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './Components/Navbar';
import Home from "./Pages/Student/Home";
import Quiz from "./Pages/Student/Quiz";
import SignUp from "./Pages/Auth/SignUp";
import ProfileIcon from "./Pages/Student/ProfileIcon";
import StudentDashboard from "./Pages/Student/StudentDashboard";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ProfileCard from "./Pages/Admin/ProfileCard";
import QuizCard from "./Pages/Admin/QuizCard";
import ManageQuizzes from "./Pages/Admin/ManageQuizzes";
import Student from "./Pages/Admin/ManageStudents";
import './App.css';

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      {/* <ProfileIcon /> */}
      {/* <QuizCard /> */}
      {/* <ProfileCard/> */}
      <Routes>
        <Route path="/Quiz" element={<Quiz/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/Manage" element={<ManageQuizzes />} />
        <Route path="/Student" element={<Student />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Profile" element={<StudentDashboard />} />
        <Route path="/Dashboard" element={<AdminDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
