import React, { useState, useEffect } from "react";
import "./SignUp.css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const images = ["/qsd1.jpg", "/qsd2.jpg", "/qsd3.jpg"];

const scienceSubjects = [
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Environmental Science", label: "Environmental Science" },
  { value: "Statistics", label: "Statistics" },
  {value:"Astronomy" , label:"Astronomy"}
];

const SignUp = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false); // Set to false to show Login first
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedSubjects: [],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  const handleToggle = (signUp) => {
    setIsSignUp(signUp);
    setInputsDisabled(true);
    setTimeout(() => {
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        selectedSubjects: [],
      });
      setInputsDisabled(false);
    }, 50);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (selectedOptions) => {
    setFormData({ ...formData, selectedSubjects: selectedOptions || [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      const { fullName, email, password, confirmPassword, selectedSubjects } = formData;

      if (!fullName || !email || !password || !confirmPassword) {
        showToast("All fields are required!", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match!", "error");
        return;
      }

      if (selectedSubjects.length < 5) {
        showToast("Please select at least 5 subjects!", "error");
        return;
      }

      console.log("Registration Successful:", formData);
      showToast("Registration Successful!", "success");

      setTimeout(() => {
        setIsSignUp(false);
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          selectedSubjects: [],
        });
      }, 2000);
    } else {
      const { email, password } = formData;

      if (!email || !password) {
        showToast("Email and Password are required!", "error");
        return;
      }

      try {
        const response = await fetch("http://localhost:5084/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed!");
        }

        sessionStorage.setItem("token", data.token);
        showToast("Login Successful!", "success");

        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } catch (error) {
        showToast(error.message, "error");
      }
    }
  };

  return (
    <div className="signup-container">
      {toastMessage && <div className={`toast ${toastType}`}>{toastMessage}</div>}

      <div className="slideshow">
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Slide ${index + 1}`} className={index === currentSlide ? "active" : ""} />
        ))}
      </div>

      <div className="overlay"></div>

      <div className="form-container">
        <div className="toggle-buttons">
          <button className={!isSignUp ? "active" : ""} onClick={() => handleToggle(false)}>Login</button>
          <button className={isSignUp ? "active" : ""} onClick={() => handleToggle(true)}>Sign Up</button>
        </div>

        <h2 className="head-t">{isSignUp ? "Register" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required disabled={inputsDisabled} />
          )}

          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={inputsDisabled} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={inputsDisabled} />

          {isSignUp && (
            <>
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required disabled={inputsDisabled} />
              <label>Select Subjects:</label>
              <Select options={scienceSubjects} isMulti value={formData.selectedSubjects} onChange={handleSubjectChange} className="subject-dropdown" isDisabled={inputsDisabled} />
            </>
          )}

          <button type="submit" className="submit-T" disabled={toastMessage}>{isSignUp ? "SIGN UP" : "LOGIN"}</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
