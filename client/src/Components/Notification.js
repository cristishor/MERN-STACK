import React from "react";
import "./Notification.css"; // Add your Notification styles

const Notification = ({ notification }) => {
  const handleAccept = () => {
    // Implement the accept functionality
  };

  const handleDecline = () => {
    // Implement the decline functionality
  };

  const handleToggleSeen = () => {
    // Implement the toggle seen functionality
  };

  return (
    <div className={`notification ${notification.seen ? "seen" : ""}`}>
      <div className="notification-content">
        <h3 className="notification-title">{notification.title}</h3>
        <p className="notification-body">{notification.body}</p>
        {notification.proposal && (
          <div className="proposal-buttons">
            <button className="accept-button" onClick={handleAccept}>
              Accept
            </button>
            <button className="decline-button" onClick={handleDecline}>
              Decline
            </button>
          </div>
        )}
      </div>
      <button className="seen-button" onClick={handleToggleSeen}>
        {notification.seen ? "Seen" : "Unseen"}
      </button>
    </div>
  );
};

export default Notification;
