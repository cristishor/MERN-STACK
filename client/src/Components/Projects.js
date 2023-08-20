import React from "react";
import "./Projects.css"

const Projects = ({ projects }) => {
  return (
    <div className="projects-component">
      <h2>Projects</h2>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project._id} className="project-item">
            <h3>{project.title}</h3>
            <p>Tasks Assigned: {project.tasksAssigned}</p>
          </li>
        ))}
      </ul>
      <button className="create-project-button">Create New Project</button>
    </div>
  );
};

export default Projects;
