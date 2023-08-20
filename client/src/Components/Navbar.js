import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; 

const Navbar = ({ userId, onNotificationToggle, onLogout }) => {

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <Link to={`/home/${userId}`} className="navbar-logo">
          MGMT
        </Link>
      </div>
      <div className="navbar-buttons">
        <button className="navbar-button" onClick={onNotificationToggle}>
          Notifications
        </button>
        <button className="navbar-button">Edit Profile</button>
        <button className="navbar-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
