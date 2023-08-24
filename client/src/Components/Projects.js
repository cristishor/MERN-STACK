import React from "react";
import { useNavigate } from "react-router-dom";

import "../Styles/Projects.css"


const Projects = ({ projects, userId }) => {
  const navigate = useNavigate();

  const handleProjectClick = (projId) => {
    navigate(`/p/${projId}/${userId}`);
  };

  const handleCreateProject = () => {
    navigate(`/new-project/${userId}`); // Replace :userId with the actual user ID
  };

  return (
    <div className="projects-component">
      <h2>Projects</h2>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project._id} className="project-item" onClick={() => handleProjectClick(project._id)}>
            <h3>{project.title}</h3>
            <p>Tasks Assigned: {project.tasksAssigned}</p>
          </li>
        ))}
      </ul>
      <button className="create-project-button" onClick={handleCreateProject}>Create New Project</button>
    </div>
  );
};

export default Projects;
