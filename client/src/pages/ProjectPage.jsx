import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../Components/Navbar";
import AllProjectTasks from "../Components/AllProjectTasks"
import AddTaskPopup from "../Components/AddTaskPopup";
import Notes from "../Components/Notes";

import "../Styles/ProjectPage.css";


const ProjectPage = () => {
  const { userId, projId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projData, setProjData] = useState(null);
  const [error, setError] = useState("");

  const [showTaskPopup, setShowTaskPopup] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/projects/${projId}/${userId}`)
      .then((response) => {
        setProjData(response.data);
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
          } else if (status === 403 && data.errorCode === "FORBIDDEN_USER_PROJ") {
            setError("You are not authorized to access this project.")
          }
        }
      });

  }, [userId, projId, navigate]);

  const handleDataRefresh = () => {
    axios
      .get(`/api/projects/${projId}/${userId}`)
      .then((response) => {
        setProjData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error)
      })
  }

  const handleTogglePopup = () => {
    setShowTaskPopup(!showTaskPopup)
  }
  const handleClosePopup = () => {
    setShowTaskPopup(false);
  };

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="page-container">
      <Navbar userId={userId} />
      <div className="content-container">
        <div className="notes-section">
          <Notes projId={projId} userId={userId} onDataRefresh={handleDataRefresh} />
        </div>
        <div className="tasks-section">
          <div className="top-section">
            <h2>{projData.title}</h2>
            {projData.userRole === "manager" || projData.userRole === "owner" ? (
              <button className="add-task-button" onClick={handleTogglePopup}>Add New Task</button>) : null}

              {/* You can add more buttons here if needed */}
          </div>
          {showTaskPopup && ( <AddTaskPopup onClose={handleClosePopup} onTaskAdded={handleDataRefresh} projId={projId} userId={userId}/>)}  
          <AllProjectTasks projData={projData} onDataRefresh={handleDataRefresh}/>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
