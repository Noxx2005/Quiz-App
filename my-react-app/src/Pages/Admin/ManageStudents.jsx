import React, { useState, useEffect } from "react";
import "./ManageStudent.css";
import Sidebar from "../../Components/Sidebar";
import ProfileCard from "./ProfileCard";

const Student = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const subjectsData = sessionStorage.getItem("subjects");
        if (!subjectsData) {
          console.error("No subjects found in session storage");
          return;
        }

        const subjects = subjectsData
          .split(",")
          .map((subject) => subject.trim())
          .filter((subject) => subject);

        if (subjects.length === 0) {
          console.warn("No valid subjects found");
          return;
        }

        const token = sessionStorage.getItem("token");
        const studentPromises = subjects.map((subject) =>
          fetch(`http://localhost:5000/api/User/Users?subject=${encodeURIComponent(subject)}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
            .then((res) => res.json())
            .catch((error) => {
              console.error(`Error fetching students for ${subject}:`, error);
              return [];
            })
        );

        const results = await Promise.all(studentPromises);
        const allStudents = results.flat();

        const uniqueStudents = Array.from(
          new Map(allStudents.map((student) => [student.id, student])).values()
        );

        setStudents(uniqueStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    if (!student || !student.fullName || !student.email) return false;
    return (
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="student-management-container">
      <Sidebar />
      <div className="student-management-content">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="student-cards-grid">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <ProfileCard key={student.id} student={student} />
            ))
          ) : (
            <div className="no-results-message">
              {searchQuery ? "No matching students found" : "No students available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student;