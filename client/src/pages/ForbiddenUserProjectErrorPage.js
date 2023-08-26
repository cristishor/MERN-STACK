import React from "react";
import "../Styles/ForbiddenUserProjectErrorPage.css"

const ForbiddenUserProjectErrorPage = () => {
  return (
    <div className="error-page">
      <h1>Forbidden Access</h1>
      <p>This is not your project.</p>
    </div>
  );
};

export default ForbiddenUserProjectErrorPage;
