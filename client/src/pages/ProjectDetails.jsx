import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import MemberPopup from "../Components/MemberPopup"
import Navbar from "../Components/Navbar";
import ForbiddenUserErrorPage from "./ForbiddenUserErrorPage"
import ForbiddenUserProjectErrorPage from "./ForbiddenUserProjectErrorPage";

import "../Styles/ProjectDetails.css"


const ProjectDetails = () => {
  const { projId, userId } = useParams();
  const [projectDetails, setProjectDetails] = useState(null);
  const [openMemberPopupId, setOpenMemberPopupId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null)
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [leaveError, setLeaveError] = useState("")
  const [showLeaveButton, setShowLeaveButton] = useState(true)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState("");
  const [toggleDeleteProjectVisible, setToggleDeleteProjectVisible] = useState(false)
  const [deleteProjError, setDeleteProjError] = useState("")
  const [password, setPassword] = useState("")

  const [editedTitle, setEditedTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedEndDate, setEditedEndDate] = useState(endDate);
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);
  const [editedStatus, setEditedStatus] = useState(status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const navigate = useNavigate() 

  useEffect(() => {
    axios
      .get(`/api/projects/${projId}/${userId}/projectInfo`)
      .then((response) => {
        setProjectDetails(response.data.project);
        setUserRole(response.data.userRole)
        setIsLoading(false)
      })
      .catch((error) => {
        setIsLoading(false);

        if (error.response && error.response.data) {
          const errorCode = error.response.data.errorCode;

          if (errorCode === "NEEDS_LOGIN") {
            navigate("/login");
          } else if (errorCode === "FORBIDDEN_USER") {
            setError("FORBIDDEN_USER");
          } else if (errorCode === "FORBIDDEN_USER_PROJECT") {
            setError("FORBIDDEN_USER_PROJECT")
          } else {
            setError( error.message )
          }
        }
      });
  }, [projId, userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.log("errore code: ", error)
    if (error === "FORBIDDEN_USER") {
      return <ForbiddenUserErrorPage/>
    } else if (error === "FORBIDDEN_USER_PROJECT") {
      return <ForbiddenUserProjectErrorPage/>
    } else {
    return <div>{error}</div>;
    }
  }

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleMemberPopupToggle = (memberId) => {
    if (openMemberPopupId === memberId) {
      setOpenMemberPopupId(null); // Close the popup if already open
    } else {
      setOpenMemberPopupId(memberId); // Open the popup for the clicked member
    }
  };

  const { title, description, status, endDate, members, createdAt } = projectDetails;

  const handleShowConfirmButtons = () => {
    setShowConfirmButtons(true);
    setShowLeaveButton(false)
  };

  const handleLeaveProject = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/projects/${projId}/${userId}/member`, {
        data: { targetUserId: userId } // Sending targetUserId in the request body
      });
      navigate(`/home/${userId}`); // Redirect to the specified route
    } catch (error) {
      setIsLoading(false);
      if (error.response.data) {
        setLeaveError(error.response.data.message)
      }
    }
  };

  const handleCancelLeaveProject = () => {
    setShowConfirmButtons(false);
    setShowLeaveButton(true)
  };

  const handleToggleAddMember = () => {
    setShowAddMemberForm((prev) => !prev);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleAddMemberSubmit = async () => {
    try {
        const response = await axios.post(`/api/projects/${projId}/${userId}/member`, {
          targetEmail: email,
        });
  
        if (response.status === 200) {
          setNotification("Member added successfully!");
          setEmail("");
          setShowAddMemberForm(false);
        }
      } catch (error) {
        setNotification("Failed to add member. Please try again.");
      }
    };

    const updateMemberList = (removedMemberId) => {
      setProjectDetails((prevProjectDetails) => ({
        ...prevProjectDetails,
        members: prevProjectDetails.members.filter((member) => member.id !== removedMemberId),
      }));
    };

    const handleToggleDeleteProject = () => {
      setToggleDeleteProjectVisible(!toggleDeleteProjectVisible)
      setDeleteProjError("");
  }
  const handleDeleteProject = async () => {
    try {
      const response = await axios.delete(`/api/projects/${projId}/${userId}`, {
        data: { password: password }, // Replace with actual password
      });

      if (response.status === 200) {
        navigate(`/home/${userId}`); // Redirect to home page
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setDeleteProjError(error.response.data.message);
      }
    }
  };

  // EDITING BUTTONS
  
  
  const handleTitleEditToggle = () => {
    setIsEditingTitle(!isEditingTitle);
  };
  const handleTitleSave = async () => {
    try {
      await axios.put(`/api/projects/${projId}/${userId}`, {
        title: editedTitle,
      });
      setIsEditingTitle(false);      
    } catch (error) {
      console.error("Error saving title:", error);
    }
  };

  const handleDescriptionEditToggle = () => {
    setIsEditingDescription(!isEditingDescription);
  }
  const handleDescriptionSave = async () => {
    try {
      await axios.put(`/api/projects/${projId}/${userId}`, {
        description: editedDescription,
      });
      setIsEditingDescription(false);
    } catch (error) {
      console.error("Error saving title:", error);
    }
  }

  const handleEndDateEditToggle = () => {
    setIsEditingEndDate(!isEditingEndDate);
  }
  const handleEndDateSave = async () => {
    try {
      await axios.put(`/api/projects/${projId}/${userId}`, {
        endDate: editedEndDate || null,
      });
      setIsEditingEndDate(false);
    } catch (error) {
      console.error("Error saving title:", error);
    }
  }

  const handleStatusEditToggle = () => {
    setIsEditingStatus(!isEditingStatus);
  }
  const handleStatusSave = async () => {
    if (status === editedStatus || !editedStatus) {
      return
    } else {
      try {
        await axios.put(`/api/projects/${projId}/${userId}`, {
          status: editedStatus,
        });
       setIsEditingStatus(false);   
      } catch (error) {
        console.error("Error saving title:", error);
      }
    }
  }

  return (
    <div>
      <Navbar userId={userId} />
      <div className="project-details-container">
        <div className="title-bar">
          <button className="go-back-button" onClick={handleGoBack}>
            Go Back
          </button>        
          <div className="title-section">
          {isEditingTitle ? (
            <div>
              <textarea
                value={editedTitle}
                defaultValue={title}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <button className="save-button" onClick={handleTitleSave}>Save</button>
            </div>
          ) : ( (editedTitle ? (<h2>{editedTitle}</h2>) : (<h2>{title}</h2>)) )}
          {userRole === "owner" && (
            <button className="edit-button" onClick={handleTitleEditToggle}>Edit</button>
          )}
          </div>
        </div>

        <div className="description-section">
          {isEditingDescription ? (
            <div>
              <textarea
                value={editedDescription}
                defaultValue={description}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
              <button className="save-button" onClick={handleDescriptionSave}>Save</button>
            </div>
          ) : ( (editedDescription ? (<p className="description">Description: {editedDescription}</p>) : (description ? (<p className="description">Description: {description}</p>) : (<p className="description">Description: -</p>)  )) )}
          {userRole === "owner" && (
            <button className="edit-button" onClick={handleDescriptionEditToggle}>Edit</button>
          )}
        </div>     
        
        <div className="endDate-section">
          {isEditingEndDate ? (
            <div>
              <input
                type="date"
                value={editedEndDate}
                defaultValue={endDate}
                onChange={(e) => setEditedEndDate(e.target.value)}
              />
              <button className="save-button" onClick={handleEndDateSave}>Save</button>
            </div>
          ) : ( (editedEndDate ? (<p className="end-date">Closing date: {editedEndDate}</p>) : (endDate ? (<p className="end-date">Closing date: {endDate}</p>) : (<p className="end-date">Closing date: -</p>)  )) )}
          {userRole === "owner" && (
            <button className="edit-button" onClick={handleEndDateEditToggle}>Edit</button>
          )}
        </div> 

        <p>Creation Date: {createdAt}</p>

        <div className="status-section">
          {isEditingStatus ? (
            <div>
              <select value={editedStatus} defaultValue={status} onChange={(e) => setEditedStatus(e.target.value)}>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <button className="save-button" onClick={handleStatusSave}>Save</button>
            </div>
          ) : ( (editedStatus ? (<p className="status-p">Status: {editedStatus}</p>) : (<p className="status-p">Status: {status}</p>) ) )}
          {userRole === "owner" && (
            <button className="edit-button" onClick={handleStatusEditToggle}>Edit</button>
          )}
        </div> 

        <div className="members-list">
          <h3>Members:</h3>
          {members && members.length > 0 ? (
          <ul>
            {members.map((member) => (
              <li key={member.id} className="member-item">
                <button className="member-circle-button" onClick={() => handleMemberPopupToggle(member.id)}>
                    {member.firstName[0] + member.lastName[0]}
                </button>
                <span className="member-name"> {member.firstName} {member.lastName} </span>
                {openMemberPopupId === member.id && (
                    <MemberPopup memberId={member.id} onClose={() => handleMemberPopupToggle(null)} userId={userId} projId={projId} userRole={userRole}  updateMemberList={updateMemberList}/>)}
              </li>
            ))}
          </ul>
           ) : (<p>No members to display.</p>)}
        </div>
        {userRole === 'owner' && (
        <div>
          <button className="add-member-button" onClick={handleToggleAddMember}>
            Add member
          </button>
          {showAddMemberForm && (
            <div className="add-member-form">
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange}
              />
              <button className="submit-button" onClick={handleAddMemberSubmit}>
                Add
              </button>
            </div>
          )}
        {notification && <p className="notification">{notification}</p>}
        </div>
      )}

        {showLeaveButton && (<button className="leave-project-button" onClick={handleShowConfirmButtons}>Leave Project</button>)}
        
        {showConfirmButtons && (
        <div className="confirm-buttons">
          <button className="confirm-button" onClick={handleLeaveProject}>
            Confirm
          </button>
          <button className="cancel-button" onClick={handleCancelLeaveProject}>
            Cancel
          </button>
          {leaveError && <p className="leave-error">{leaveError}</p>}
        </div>
      )}

      {userRole === "owner" &&
      (!toggleDeleteProjectVisible ? (
        <button className="delete-project-button" onClick={handleToggleDeleteProject}>Delete Project</button>
      ) : (
        <div>
          <p>Confirm your password:</p>
          <input
            type="password"
            value={password} // Connect input value to the 'password' state
            onChange={(e) => setPassword(e.target.value)} // Update 'password' state when input changes
          />
          <div className="delete-project-buttons">
            <button className="confirm-delete-button" onClick={handleDeleteProject}>
              Confirm
            </button>
            <button className="cancel-delete-button" onClick={handleToggleDeleteProject}>
              Cancel
            </button>
          </div>
          {deleteProjError && <p className="delete-error">{deleteProjError}</p>}
        </div>
      )) }
      </div>
    </div>
  );
};

export default ProjectDetails;


