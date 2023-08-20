import React from "react";
import "./Tasks.css"

const Tasks = ({ tasks }) => {
  return (
    <div className="tasks-component">
      <h2>Tasks</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            <h3>{task.title}</h3>
            <p>Deadline: {task.deadline}</p>
            <p>Description: {task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
