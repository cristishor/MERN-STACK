import React, { useState, useEffect } from "react";
import axios from "axios";

import "../Styles/AddTaskPopup.css"

const AddTaskPopup = ({ onClose, onTaskAdded, projId, userId, dependentTask }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([])

  useEffect(() => {

    axios
      .get(`/api/projects/${projId}/${userId}/member`)
      .then((response) => {
        setMembers(response.data.members);
      })
      .catch((error) => {
        setError("An error occurred while fetching members.");
      })

  }, [projId, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    try {
      const newTaskData = {
        title: taskTitle,
        description: taskDescription,
        assignee,
        deadline,
        dependent: dependentTask || '', 
      };

      const response = await axios.post(`/api/projects/${projId}/${userId}/task`, newTaskData);

      onTaskAdded();
      setIsLoading(false); 

      onClose();
    } catch (error) {
      setIsLoading(false); 

      if (error.response && error.response.data) {
        const { status, data } = error.response;
        setError(`Error: ${status}; Message: ${data}`);
      } else {
        setError('Something broke along the way')
      }
    }
}

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="popup">
      <button className="close-button" onClick={onClose}>x</button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          required
        />
        <input
          description="text"
          placeholder="Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          placeholder="Deadline"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
        <option value="">Select Assignee</option>
        {members.map((member) => (
          <option key={member._id} value={member._id}>
            {member.firstName} {member.lastName}
          </option>
        ))}
        </select>

        <button type="submit">Add Task</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );

};

export default AddTaskPopup;
