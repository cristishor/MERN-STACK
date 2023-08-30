import React, { useState } from "react";
import "../Styles/Task.css"
import axios from "axios";
import UpdateTaskForm from "./UpdateTaskForm";

const Task = ({ task, userId, projId, userRole, onDataRefresh }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(true);
  const [showUpdateButton, setShowUpdateButton] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const handleMouseEnter = () => {
    setShowButtons(true);
  };
  const handleMouseLeave = () => {
    setShowButtons(false);
  };


  const handleDeleteClick = () => {
    setShowDeleteButton(false);
    setShowUpdateButton(false);
    setShowConfirmation(true);
  };
  const handleCancelDelete = () => {
    setShowDeleteButton(true);
    setShowUpdateButton(true);
    setShowConfirmation(false);
  };
  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    setIsLoading(true)

    try {
      const response = await axios.delete(`/api/projects/${projId}/${userId}/task/${task._id}`);
      setShowConfirmation(false);
      setShowDeleteButton(true);
      setShowUpdateButton(true);
      onDataRefresh()
      setIsLoading(false);

    } catch {
      setShowConfirmation(false);
      setIsLoading(false);
      setError('Something broke along the way') 
    }
  };

  const handleUpdateTask = async (e) => {
    setShowButtons(false);
    setShowUpdateForm(true);
  }

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const getStatusClassName = () => {
    switch (task.status) {
      case "completed":
        return "completed";
      case "in_progress":
        return "in_progress";
      case "todo":
        return "todo";
      case "urgent":
        return "urgent";
      default:
        return "";
    }
  };

  const statusClassName = getStatusClassName();

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  
  // Format the date using the Intl.DateTimeFormat object
  let formattedDeadline
 if (task.deadline) {
  const deadlineDate = new Date(task.deadline)
  formattedDeadline = new Intl.DateTimeFormat('en-US', options).format(deadlineDate);
 }

 const updateDate = new Date(task.updatedAt)
 const formatedUpdatedAt = new Intl.DateTimeFormat('en-US', options).format(updateDate);

 let formatedStatus
 if(task.status === 'in_progress') {
  formatedStatus = 'In progress'
 } else if (task.status === 'completed') {
  formatedStatus = 'Completed'
 } else {
  formatedStatus = 'Upcoming'
 }
  

  return (
    <div>
      <div className={`task ${statusClassName}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <h4>{task.title}</h4>
        {task.description && <p>Description: {task.description}</p>}
        {task.deadline && <p>Deadline: {formattedDeadline}</p>}
        {task.assignee && <p>Assignee: {task.assignee}</p>}


        <p>Status: {formatedStatus}</p>
        <p className="lastUpdated">Last updated: {formatedUpdatedAt}</p>

        {userRole === "manager" || userRole === "owner" ? (
          showButtons && (
            <div className="taskButtons">
            {showConfirmation ? (
              <div className="confirmation-buttons">
                <button className="delete-confirm" onClick={handleConfirmDelete}>
                  Yes
                </button>
                <button className="delete-cancel" onClick={handleCancelDelete}>
                  No
                </button>
              </div>
            ) : (
              <div className="action-buttons">
                  {showDeleteButton && (
                    <button className="delete-button" onClick={handleDeleteClick}>
                      &#10060; Delete
                    </button>
                  )}
                  {showUpdateButton && (
                    <button className="update-button" onClick={handleUpdateTask}>Update</button>
                  )}
              </div>
            )}
            </div>  
          )) : null}
      </div>
      {showUpdateForm && (<UpdateTaskForm task={task} onClose={() => {setShowUpdateForm(false); setShowButtons(true)}} onTaskUpdated={onDataRefresh} userId={userId} projId={projId} />)}
    </div>
    
  );
};

export default Task;
