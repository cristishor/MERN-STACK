import React from 'react';
import '../Styles/Welcome.css'; // Import your CSS file
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation

function Welcome() {
  return (
    <div className="welcome-container">
      <div className="background-animation"></div>
      <div className="content">
        <h1>MGMT</h1>
        <p>Get organized. Get things done.</p>
        <div className="buttons-container">
          <Link to="/login">
            <button className="button">Login</button>
          </Link>
          <Link to="/register">
            <button className="button">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}


export default Welcome;