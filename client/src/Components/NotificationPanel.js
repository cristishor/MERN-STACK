import React from "react";
import "../Styles/NotificationPanel.css"; // Add your NotificationPanel styles
import Notification from "./Notification";

const NotificationPanel = ({ visible, onClose, notifications, markAsSeen, acceptProposal, declineProposal }) => {
  return (
    <div className={`notification-panel ${visible ? "visible" : ""}`}>
      <button className="close-button" onClick={onClose}>
        X
      </button>
      <h2 className="panel-title">Notifications Tab</h2>
      <div className="notifications-container">
        {notifications && notifications.map((notification) => (
          <Notification
            key={notification._id}
            notification={notification}
            markAsSeen={markAsSeen}
            acceptProposal={acceptProposal}
            declineProposal={declineProposal}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
