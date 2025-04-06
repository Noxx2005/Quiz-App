import React, { useState, useEffect } from "react";
import "./ManageStudent.css";
import Sidebar from "../../Components/Sidebar";
import ProfileCard from "./ProfileCard";

const Student = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("userId");

        if (!token || !userId) {
          console.error("No token or userId found in session storage");
          return;
        }

        const response = await fetch("http://localhost:5000/api/admin/get-all-quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Failed to fetch quizzes");
          return;
        }

        const allQuizzes = await response.json();

        // Log quizzes fetched
        console.log("All Quizzes Fetched:", allQuizzes);

        // Filter quizzes by adminId and userId
        const filteredQuizzes = allQuizzes.filter(
          (quiz) => quiz.adminId === parseInt(userId, 10)
        );

        // Log filtered quizzes
        console.log("Filtered Quizzes:", filteredQuizzes);

        // Extract subjects from the quizzes
        const quizSubjects = [...new Set(filteredQuizzes.map((quiz) => quiz.subject))];

        // Log extracted subjects
        console.log("Extracted Subjects:", quizSubjects);

        setSubjects(quizSubjects);

        // Fetch students based on subjects
        fetchStudents(quizSubjects);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    const fetchStudents = async (quizSubjects) => {
      try {
        const token = sessionStorage.getItem("token");

        const studentPromises = quizSubjects.map((subject) =>
          fetch(`http://localhost:5000/api/User/Users?subject=${encodeURIComponent(subject)}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .catch(() => [])
        );

        const results = await Promise.all(studentPromises);
        const allStudents = results.flat();

        // Log all fetched students
        console.log("All Students Fetched:", allStudents);

        const uniqueStudents = Array.from(
          new Map(allStudents.map((student) => [student.id, student])).values()
        );

        setStudents(uniqueStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredStudents = students.filter((student) => {
    if (!student || !student.fullName || !student.email) return false;
    return (
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="student-management-container">
      <Sidebar />
      <div className="student-management-content">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />

        <div className="student-cards-grid">
          {currentStudents.length > 0 ? (
            currentStudents.map((student) => (
              <ProfileCard key={student.id} student={student} />
            ))
          ) : (
            <div className="no-results-message">
              {searchQuery ? "No matching students found" : "No students available"}
            </div>
          )}
        </div>

        {filteredStudents.length > studentsPerPage && (
          <div className="pagination-controls">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-btn ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;
