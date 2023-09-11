import React from "react";
import "../Styles/Tasks.css"

const Tasks = ({ tasks }) => {


  const formatDeadline = (deadline) => {
    if (!deadline) {
      return "No deadline";
    }
    const deadlineDate = new Date(deadline);
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', options).format(deadlineDate);
  };

  return (
    <div className="tasks-component">
      <h2>Tasks</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="task-item" >
            <h2>{task.title}</h2>
            <p>Status: {task.status}</p>
            <p>Deadline: {formatDeadline(task.deadline)}</p>
            <p>Description: {task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
