import React, { useState } from "react";
import axios from "axios";
import "./Register.css"; // Import your CSS stylesheet for additional styling
import { Link } from "react-router-dom"

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    profilePicture: "", // New field for profile picture
    phone: "", // New field for phone
    address: "", // New field for address
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/users/register", formData);
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log("Error message from server:", error.response.data.message);
        setError(error.response.data.message);
      } else {
        setError("Unknown server error.");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <Link to="/" className="app-title">MGMT</Link>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="profilePicture"
            placeholder="Profile Picture URL"
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            onChange={handleChange}
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Register</button>
        </form>
        <p className="login-link">Already have an account? <a href="/login">Log in</a></p> {/* Login link */}
      </div>
      <div className="background-image"></div> {/* Background image */}
    </div>
  );
};

export default Register;
