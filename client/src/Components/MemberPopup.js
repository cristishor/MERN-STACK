import React, { useState, useEffect } from 'react';
import axios from 'axios';

import "../Styles/MemberPopup.css"

const MemberPopup = ({ memberId, onClose, userId, projId, userRole, updateMemberList }) => {
  const [memberInfo, setMemberInfo] = useState(null);

  const [password, setPassword] = useState("");
  const [ownershipError, setOwnershipError] = useState("");
  const [notification, setNotification] = useState("");
  const [toggleOwnershipVisible, setToggleOwnershipVisible] = useState(false)
  const [managerError, setManagerError] = useState('')
  const [isLoading, setIsLoading] = useState(true);
  const [manNotification, setManNotification] = useState("")
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);


  const fetchMemberInfo = async () => {
    try {
      const response = await axios.post(`/api/projects/${projId}/${userId}/userInfo`, {targetUserId:memberId});
      setMemberInfo({userProjectData: response.data.userProjectData, role: response.data.targetUserRole});
    } catch (error) {
      console.error('Error fetching member info:', error);
    }
  };

  useEffect(() => {
    fetchMemberInfo();
    setIsLoading(false)
  }, [memberId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

const handleToggleRemoveMember = () => {
  setShowConfirmRemove(!showConfirmRemove);
}
const handleRemoveMember = async (targetUserId) => {
  try {
    await axios.delete(`/api/projects/${projId}/${userId}/member`, {
      data: { targetUserId: targetUserId },
    });

    setShowConfirmRemove(false);
    onClose()
    updateMemberList(targetUserId)
  } catch (error) {
    console.error("Error demoting user:", error);
  }
}

const handleMakeManager = async (targetUserId) => {
  try {
    const response = await axios.post(`/api/projects/${projId}/${userId}/manager`, {
      targetUserId,
    });

    if (response.status === 200) {
      setManagerError("");
      setManNotification("User promoted to manager!");
      setTimeout(() => { onClose() }, 3000)
    }
  } catch (error) {
    setIsLoading(false)
    console.error("Error promoting user to manager:", error);
    setManagerError(error.response?.data?.message || "Failed to promote user to manager.");
    setTimeout(() => { setManagerError("") }, 3000)
  }
};


const handleRevokeManager = async (targetUserId) => {
  try {
    const response = await axios.delete(`/api/projects/${projId}/${userId}/manager`, {
      data: { targetUserId: targetUserId }
    });

    if (response.status === 200) {
      setManagerError("");
      setManNotification("User demoted!");
      setTimeout(() => { onClose() }, 3000)
    }
  } catch (error) {
    setIsLoading(false)
    console.error("Error demoting user:", error);
    setManagerError(error.response?.data?.message || "Failed to demote user.");
    setTimeout(() => { setManagerError("") }, 3000)
  }
}

const handleTogglePassOwnership = () => {
    setToggleOwnershipVisible(!toggleOwnershipVisible)
}
const handlePassOwnership = async (targetUserId) => {
    try {
      const response = await axios.put(`/api/projects/${projId}/${userId}/owner`, {
        targetUserId,
        password,
      });

      if (response.status === 200) {
        setOwnershipError("");
        setNotification("Ownership transferred successfully!");
        // Reset the form
        setPassword("");
        setToggleOwnershipVisible(false);
        window.location.reload();
      }
    } catch (error) {
      setOwnershipError(error.response?.data?.message || "Failed to transfer ownership.");
      setTimeout(() => { setOwnershipError("") }, 3000)
    }
  };


  return (
    <div className="member-popup">
      {memberInfo && (
        <div>
          <h4>{memberInfo.userProjectData.firstName} {memberInfo.userProjectData.lastName}</h4>
          <p className={`userRole-bio ${memberInfo.role}`}> {memberInfo.role}</p>
          <p>Email: {memberInfo.userProjectData.email}</p>
          {memberInfo.userProjectData.contactInformation.phone && (
            <p>Phone: {memberInfo.userProjectData.contactInformation.phone}</p>
          )}
          {memberInfo.userProjectData.contactInformation.address && (
            <p>Address: {memberInfo.userProjectData.contactInformation.address}</p>
          )}
  
          {userRole === 'owner' && (
            <div className="owner-buttons">
              {!showConfirmRemove ? (userRole !== memberInfo.role && (<button className="remove-button" onClick={() => handleToggleRemoveMember()}>Remove</button>)
              ) :(
                <div>
                  <button className="confirm-button" onClick={() => handleRemoveMember(memberInfo.userProjectData._id)}>Confirm</button>
                  <button className="cancel-button" onClick={() => handleToggleRemoveMember()}>Cancel</button>
                </div>
              )}

              {memberInfo.role === 'member' && (
                <button className="make-manager-button" onClick={() => handleMakeManager(memberInfo.userProjectData._id)}>Make Manager</button>
              )}
              {manNotification && <p className="manager-notification">{manNotification}</p>}
              {managerError && <p className="manager-err">{managerError}</p> }
              {memberInfo.role === 'manager' && (
                <div>
                    {!toggleOwnershipVisible && (<button className="pass-ownership-button" onClick={() => handleTogglePassOwnership()}>Pass Ownership</button>)}
                    {toggleOwnershipVisible && (<div className="add-member-form">
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                         />
                        <button className="submit-button" onClick={handlePassOwnership}>Add</button>
                    </div> )}
                    {notification && <p className="notification">{notification}</p>}
                    {ownershipError && <p className="ownership-err">{ownershipError}</p> }

                    <button className="revoke-manager-button" onClick={() => handleRevokeManager(memberInfo.userProjectData._id)}>Revoke Manager</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <button className="close-button" onClick={onClose}>Close</button>
    </div>
  );
  
};

export default MemberPopup;
