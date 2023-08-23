import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/NewProject.css";
import Navbar from "../Components/Navbar";

const NewProject = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([""]); // Array of member emails

  const [errorMessage, setErrorMessage] = useState("");

  const handleAddMember = () => {
    setMembers([...members, ""]); // Add a new empty member field
  };

  const handleMemberChange = (index, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = [...members];
    updatedMembers.splice(index, 1);
    setMembers(updatedMembers);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nonEmptyMembers = members.filter((member) => member.trim() !== "");

    try {
      const response = await axios.post(`/api/projects/new/${userId}`, {
        title,
        description,
        members: nonEmptyMembers,
      });

      if (response.data.success) {
        navigate(`/p/${response.data.projectId}/${userId}`);
      } else {
        console.log('mortii tei?', response.data.message, response.data.success)
        setErrorMessage(response.data.message);
      }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message from server:", error.response.data.message);
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage("An error occurred while creating the project.");
          }
    }
  };

  return (
    <div>
      <Navbar userId={userId} />
      <div className="new-project-container">
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Members</label>
            {members.map((member, index) => (
              <div key={index} className="member-box">
                <input
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                />
                {index > 0 && (
                  <button
                    type="button"
                    className="remove-member-button"
                    onClick={() => handleRemoveMember(index)}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-member-button"
              onClick={handleAddMember}
            >
              Add Member
            </button>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit">Create Project</button>
        </form>
      </div>
    </div>
  );
};

export default NewProject;
