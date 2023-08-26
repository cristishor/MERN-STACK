import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../Components/Navbar";
import Projects from "../Components/Projects";
import Tasks from "../Components/Tasks";
import ForbiddenUserErrorPage from "./ForbiddenUserErrorPage"

import "../Styles/Home.css";


const Home = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

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
            setError("FORBIDDEN_USER");
          }
        }
      });

  }, [userId, navigate]);


  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    if (error === "FORBIDDEN_USER") {
      return <ForbiddenUserErrorPage/>
    } else {
    return <div>{error}</div>;
    }
  }

  return (
    <div>
      <Navbar userId={userId} />
      <div className="main-content">
        <div className="projects-content">
        <Projects userId={userId} projects={userData?.projectsInvolved} />
        </div>
        <div className="tasks-content">
        <Tasks tasks={userData?.tasks}/>
        </div>
      </div>
    </div>
  );
};

export default Home;
