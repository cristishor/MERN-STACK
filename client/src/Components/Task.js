import React from "react";
import "../Styles/Task.css"

const Task = ({ task }) => {
  return (
    <div className="task">
      <h4>{task.title}</h4>
      <p>Status: {task.status}</p>
      <p>UpdatedAt: {task.updatedAt}</p>
      {task.description && <p>Description: {task.description}</p>}
      {task.assignee && <p>Assignee: {task.assignee}</p>}
    </div>
  );
};

export default Task;
