import React from "react";
import Chain from "./Chain"; // Import your Chain component

import "../Styles/AllProjectTasks.css"

const AllProjectTasks = ({ projData, onDataRefresh }) => {
  const { sortedChains, upcomingChains, completedChains, userRole } = projData;

  return (
    <div>
      <h2>Project Title: {projData.title}</h2>
      <h3>Current</h3>
      <div className="chain-container">
        {sortedChains.map((chain, index) => (
          <Chain key={index} chain={chain} centralTaskIndex={chain.centralTaskIndex} chainType={'current'} userRole={userRole} onDataRefresh={onDataRefresh}/>
        ))}
      </div>
      <h3>Upcoming</h3>
      <div className="chain-container">
        {upcomingChains.map((chain, index) => (
          <Chain key={index} chain={chain} chainType={'upcoming'} userRole={userRole} onDataRefresh={onDataRefresh}/>
        ))}
      </div>
      <h3>Completed</h3>
      <div className="chain-container">
        {completedChains.map((chain, index) => (
          <Chain key={index} chain={chain} chainType={'completed'} userRole={userRole} onDataRefresh={onDataRefresh}/>
        ))}
      </div>
    </div>
  );
};

export default AllProjectTasks;
