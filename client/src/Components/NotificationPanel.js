// NotificationPanel.js
import React from "react";
import "./NotificationPanel.css"; // Add your NotificationPanel styles

const NotificationPanel = ({ visible, onClose, notifications, markAsSeen }) => {

  return (
    <div className={`notification-panel ${visible ? "visible" : ""}`}>
      <button className="close-button" onClick={onClose}>
        X
      </button>
      <h2 className="panel-title">Notifications Tab</h2>
      <div className="notifications-container">     
        {notifications && notifications.map((notification) => (
          <div key={notification._id} className={`notification ${notification.seen ? "seen" : ""}`}>
            <div className="notification-title">{notification.title}</div>
            <div className="notification-body">{notification.body}</div>
            {notification.proposal && (
              <div className="notification-buttons">
                <button>Accept</button>
                <button>Decline</button>
              </div>
            )}
            {!notification.seen && (
              <button
                className="notification-seen-button"
                onClick={() => markAsSeen(notification._id)}
              >
                Mark as Seen
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;

