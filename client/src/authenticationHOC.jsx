import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuthentication = (Component) => {
  return (props) => {
    const navigate = useNavigate();

    useEffect(() => {
      // Check if the user is authenticated based on the property set in middleware
      if (!props.isAuthenticated) {
        navigate("/login");
      }
    }, [props.isAuthenticated]);

    return <Component {...props} />;
  };
};

export default withAuthentication;
