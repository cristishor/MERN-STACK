import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import NotificationPanel from "./NotificationPanel";

import '../Styles/Navbar.css'; 

const Navbar = ({ userId }) => {
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState([]); 
  const [unseenNotifications, setUnseenNotifications] = useState(0);

  useEffect(() => {
    axios.get(`/api/users/${userId}/notifications`)
      .then((response) => {
        const fetchedData = response.data
        setFetchedData(response)

        const unseenCount = fetchedData.notifications.filter(notification => !notification.seen).length;
        setUnseenNotifications(unseenCount);

      })
      .catch((error) => { 
        console.error("Error fetching notifications:", error);
        return [];
    })
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/notifications`);

      return response.data; // Return the fetched notifications
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return []; // Return an empty array in case of error
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`/api/users/${userId}/logout`);
    } catch (error) {
      console.error("Error during logout:", error);
    }
    navigate("/");
  }

  const handleNotificationToggle = async () => {
    setIsPanelOpen(!isPanelOpen);

    const notifications = await fetchNotifications();
    setFetchedData(notifications);
    const unseenCount = fetchedData.notifications.filter(notification => !notification.seen).length;
    setUnseenNotifications(unseenCount);
  };

  const markNotificationAsSeen = async (notifId) => {
    try {
      await axios.put(`/api/users/${userId}/${notifId}`, { wasSeen: true });
      // Fetch the notifications again to update the seen status
      const updatedNotifications = await fetchNotifications();
      setFetchedData(updatedNotifications);
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const handleAcceptProposal = async (notifId) => {
    try {
      await axios.put(`/api/users/${userId}/${notifId}`, { response: true });
      // Fetch the notifications again to update the data
      const updatedNotifications = await fetchNotifications();
      setFetchedData(updatedNotifications);
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };
  
  const handleDeclineProposal = async (notifId) => {
    try {
      await axios.put(`/api/users/${userId}/${notifId}`, { response: false });
      // Fetch the notifications again to update the data
      const updatedNotifications = await fetchNotifications();
      setFetchedData(updatedNotifications);
    } catch (error) {
      console.error("Error declining proposal:", error);
    }
  };


  return (
    <nav className="navbar">
      <div className="navbar-title">
        <Link to={`/home/${userId}`} className="navbar-logo">
          MGMT
        </Link>
      </div>
      <div className="navbar-buttons">
        <button className="navbar-button" onClick={handleNotificationToggle}>
          Notifications {unseenNotifications > 0 && <span className="notification-count">{unseenNotifications}</span>}
        </button>
        <button className="navbar-button">Edit Profile</button>
        <button className="navbar-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      {isPanelOpen && (
        <NotificationPanel
          visible={isPanelOpen}
          onClose={handleNotificationToggle}
          notifications={fetchedData.notifications}
          markAsSeen={markNotificationAsSeen}
          acceptProposal={handleAcceptProposal}
          declineProposal={handleDeclineProposal} 
        />
      )}
    </nav>
  );
};

export default Navbar;
