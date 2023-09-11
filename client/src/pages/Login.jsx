import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    handleLogin(); // Trigger handleLogin on component mount
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setError(""); // Clear error before calling handleLogin
    try {
      const response = await axios.post("/api/users/login");

      if (response.data.userId) {
        // User is already logged in, redirect to /home
        setTimeout(() => {
          navigate(`/home/${response.data.userId}`);
        }, 500);
      }
    } catch (error) {
      console.error("Error during handleLogin:", error);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await axios.post("/api/users/login", formData);
      
      // Navigate to the home page with the user's ID
      navigate(`/home/${response.data.userId}`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log("Error message from server:", error.response.data.message);
        setError(error.response.data.message);
      } else {
        setError("Login failed. Please check your information.");
      }
    }
  }

  return (
    <div className="login-container">
       <div className="login-title">
        <button className="title-button" onClick={() => navigate("/")}>
          MGMT
        </button>
      </div>
      <div className="login-box">
      
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />
          <button type="submit">Login</button>
        </form>
        <div className="login-options">
          <Link to="/forgot-password">Forgot Password</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
