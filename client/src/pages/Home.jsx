// Home.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../Components/Navbar";
import Projects from "../Components/Projects";
import Tasks from "../Components/Tasks";
import NotificationPanel from "../Components/NotificationPanel";

import "../Styles/Home.css";


const Home = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false); // State to control panel visibility
  const [fetchedData, setFetchedData] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/users/${userId}`)
      .then((response) => {
        setUserData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);

        if (error.response && error.response.data) {
          const { status, data } = error.response;
          if (status === 401 && data.errorCode === "NEEDS_LOGIN") {
            navigate("/login");
          } else if (status === 403 && data.errorCode === "FORBIDDEN_USER") {
            setError("You are not authorized to access this workspace.");
          }
        }
      });

  }, [userId, navigate]);

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
      await axios.post(`/api/users/${userData.userId}/logout`);
    } catch (error) {
      console.error("Error during logout:", error);
    }
    navigate("/");
  }

  const handleNotificationToggle = async () => {
    setIsPanelOpen(!isPanelOpen);

    const notifications = await fetchNotifications();
    setFetchedData(notifications);
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

  const handleAcceptProposal = async (notificationId) => {
    try {
      await axios.put(`/api/users/${userId}/${notificationId}`, { response: true });
      // Fetch the notifications again to update the data
      const updatedNotifications = await fetchNotifications();
      setFetchedData(updatedNotifications);
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };
  
  const handleDeclineProposal = async (notificationId) => {
    try {
      await axios.put(`/api/users/${userId}/${notificationId}`, { response: false });
      // Fetch the notifications again to update the data
      const updatedNotifications = await fetchNotifications();
      setFetchedData(updatedNotifications);
    } catch (error) {
      console.error("Error declining proposal:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Navbar userId={userId} onNotificationToggle={handleNotificationToggle} onLogout={handleLogout} />
      <div className="home-container">
        <div className="main-content">
          <Projects userId={userId} projects={userData?.projectsInvolved} />
          <Tasks tasks={userData?.tasks} />
        </div>
      </div>
      { isPanelOpen && <NotificationPanel 
      visible={isPanelOpen} 
      onClose={handleNotificationToggle} 
      notifications={fetchedData.notifications} 
      markAsSeen={markNotificationAsSeen}
      acceptProposal={handleAcceptProposal}
      declineProposal={handleDeclineProposal} 
      /> 
      }
    </div>
  );
};

export default Home;
