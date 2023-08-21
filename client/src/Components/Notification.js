import React from "react";
import "../Styles/Notification.css"; // Add your Notification styles

const Notification = ({ notification, markAsSeen, acceptProposal, declineProposal }) => {
  const handleToggleSeen = () => {
    markAsSeen(notification._id);
  };

  const handleAccept = () => {
    acceptProposal(notification._id);
  };

  const handleDecline = () => {
    declineProposal(notification._id);
  };

  return (
    <div className={`notification ${notification.seen ? "seen" : ""}`}>
      <div className="notification-content">
        <h3 className="notification-title">{notification.title}</h3>
        <p className="notification-body">{notification.body}</p>
        <p className="notification-time">{notification.timeAgo}</p>
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
      {notification.seen ? (
        <div className="notification-seen-text">Seen</div>
        ) : (
        <button className="seen-button" onClick={handleToggleSeen}>
        Mark as Seen
        </button>
       )}  
    </div>
  );
};

export default Notification;
