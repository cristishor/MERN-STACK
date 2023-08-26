import React from "react";
import "../Styles/ForbiddenUserErrorPage.css"

const ForbiddenUserErrorPage = () => {
  return (
    <div className="error-page">
      <h1>Forbidden Access</h1>
      <p>This is not your workspace.</p>
    </div>
  );
};

export default ForbiddenUserErrorPage;
