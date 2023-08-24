import React, { useState, useEffect } from "react";
import axios from "axios";

import "../Styles/UpdateTaskForm.css"

const UpdateTaskForm = ({ task, onClose, onTaskUpdated, userId, projId }) => {

  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [assignee, setAssignee] = useState(task.assignee || "");
  const [deadline, setDeadline] = useState(task.deadline || "");
  const [status, setStatus] = useState(task.status)

  const [members, setMembers] = useState([])

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    const updatedTask = {
        title: title,
        description: description,
        assignee: assignee,
        deadline: deadline,
        status: status,
        dependent: task.dependent || null
    };

    const response = await axios.put(`/api/projects/${projId}/${userId}/task/${task._id}`, updatedTask);
      
    onClose();
    onTaskUpdated();
    setIsLoading(false)
    } catch (error) {
        setIsLoading(false)

        if (error.response && error.response.data) {
            const { status, data } = error.response;
            setError(`error(${status}): ${data.message}`);
          } else {
            setError('Something broke along the way')
          }
    }
  };

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="popup">
       <button className="close-button" onClick={() => {onClose()}}>X</button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="urgent">Urgent</option>
            <option value="completed">Completed</option>
        </select>
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

        <button type="submit">Update Task</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default UpdateTaskForm;
