import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import "../styles/EditProfile.css";

const EditProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    profilePicture: "",
    phone: "",
    address: "",
    company: "",
  });

  useEffect(async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`, {
        withCredentials: true,
      });
      setUser(response.data);
      setFormData({
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        profilePicture: response.data.profilePicture,
        phone: response.data.contactInformation?.phone || "",
        address: response.data.contactInformation?.address || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `/api/users/${userId}`,
        formData,
        { withCredentials: true }
      );

      setUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactInformation: {
          phone: formData.phone,
          address: formData.address,
        },
      });

      setIsEditMode(false);
      console.log(response.data.message);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div className="container">
      <Navbar userId={userId} />
      <div className="row gutters">
        {}
        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
          <div className="card h-100">
            <div className="card-body">
              <div className="account-settings">
                <div className="user-profile">
                  <div className="user-avatar">
                    
                  </div>
                  <h5 className="user-name">
                    {user.firstName} {user.lastName}
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
          <div className="card h-100">
            <div className="card-body">
              <h4 className="mb-4 font-weight-bold text-primary">
                Personal Details
              </h4>
              <hr />
              <div className="row gutters">
                {/* First Name */}
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="form-group">
                    <label className="font-weight-bold">
                      <b>First name: </b>
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    ) : (
                      user.firstName
                    )}
                  </div>
                </div>
                {/* Last Name */}
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="form-group">
                    <label className="font-weight-bold">
                      <b>Last name: </b>
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    ) : (
                      user.lastName
                    )}
                  </div>
                </div>
                {}
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="form-group">
                    <label className="font-weight-bold">
                      <b>Email: </b>
                    </label>
                    {user.email}
                  </div>
                </div>
                {}
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="form-group">
                    <label className="font-weight-bold">
                      <b>Phone number: </b>
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      user.contactInformation?.phone || "No phone number"
                    )}
                  </div>
                </div>
                {/* Address */}
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="form-group">
                    <label className="font-weight-bold">
                      <b>Address: </b>
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    ) : (
                      user.contactInformation?.address || "No address"
                    )}
                  </div>
                </div>
              </div>
              {}
              {isEditMode && (
                <div className="text-right">
                  <button
                    type="button"
                    className="btn btn-success mr-2"
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditMode(false);
                      setFormData({
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.contactInformation?.phone || "",
                        address: user.contactInformation?.address || "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {}
              <div className="row gutters">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="text-right">
                    <button
                      type="button"
                      id="editInfo"
                      className="btn btn-secondary mr-2"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      {isEditMode ? "Cancel" : "Edit information"}
                    </button>
                    <button
                      type="button"
                      id="changePassword"
                      className="btn btn-secondary mr-2"
                    >
                      Change password
                    </button>
                    <button
                      type="button"
                      id="deleteAccount"
                      className="btn btn-danger"
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;