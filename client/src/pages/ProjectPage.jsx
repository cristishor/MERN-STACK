import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../Components/Navbar";
import AllProjectTasks from "../Components/AllProjectTasks"
import AddTaskPopup from "../Components/AddTaskPopup";
import Notes from "../Components/Notes";
import ForbiddenUserErrorPage from "./ForbiddenUserErrorPage"
import ForbiddenUserProjectErrorPage from "./ForbiddenUserProjectErrorPage";

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
        console.log("data:? ", response.data)
      })
      .catch((error) => {
        setIsLoading(false);

        if (error.response && error.response.data) {
          const errorCode = error.response.data.errorCode;

          if (errorCode === "NEEDS_LOGIN") {
            navigate("/login");
          } else if (errorCode === "FORBIDDEN_USER") {
            setError("FORBIDDEN_USER");
          } else if (errorCode === "FORBIDDEN_USER_PROJECT") {
            setError("FORBIDDEN_USER_PROJECT")
          } else {
            setError( error.message )
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
    console.log("errore code: ", error)
    if (error === "FORBIDDEN_USER") {
      return <ForbiddenUserErrorPage/>
    } else if (error === "FORBIDDEN_USER_PROJECT") {
      return <ForbiddenUserProjectErrorPage/>
    } else {
    return <div>{error}</div>;
    }
  }

  return (
    <div className="page-container">
      <Navbar userId={userId} />
      <div className="content-container">
        <div className="notes-section">
          <Notes projId={projId} userId={userId} authorlessNotes={projData.authorlessNotes}/>
        </div>
        <div className="tasks-section">
          <div className="top-section">
            <h2>{projData.title}</h2>
            <Link to={`/p-info/${projId}/${userId}`}>
              <button className="project-button">Project Details</button>
            </Link>
            {projData.userRole === "manager" || projData.userRole === "owner" ? (
              <div>
                <Link to={`/p-man/${projId}/${userId}`}>
                  <button className="project-management-button">Project Management</button>
                </Link>
                <button className="add-task-button" onClick={handleTogglePopup}>Add New Task</button>
              </div>) : null}
          </div>
          {showTaskPopup && ( <AddTaskPopup onClose={handleClosePopup} onTaskAdded={handleDataRefresh} projId={projId} userId={userId}/>)}  
          <AllProjectTasks projData={projData} onDataRefresh={handleDataRefresh}/>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
