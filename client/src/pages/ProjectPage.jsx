import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../Components/Navbar";

import "../Styles/ProjectPage.css";


const ProjectPage = () => {
  const { userId, projId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projData, setProjData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`/api/projects/${projId}/${userId}`)
      .then((response) => {
        setProjData(response.data);
        setIsLoading(false);
        console.log(projData)
        console.log("mata\n")
        console.log(response.data)
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

  }, [userId, navigate]);


  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Navbar userId={userId} />
      
    </div>
  );
};

export default ProjectPage;
