import React, {useState} from "react";
import Chain from "./Chain"; // Import your Chain component

import "../Styles/AllProjectTasks.css"

const AllProjectTasks = ({ projData, onDataRefresh }) => {
  const { sortedChains, upcomingChains, completedChains, userRole } = projData;

  const [showChainsUpcoming, setShowChainsUpcoming] = useState(false);
  const [showChainsCompleted, setShowChainsCompleted] = useState(false);

  const toggleChainsUpcoming = () => {
    setShowChainsUpcoming(!showChainsUpcoming);
  };

  const toggleChainsCompleted = () => {
    setShowChainsCompleted(!showChainsCompleted);
  };

  return (
    <div>
      <div className="current-chain-container">
        <h2>Ongoing/current</h2>
        {sortedChains.map((chain, index) => (
          <Chain key={index} chain={chain} centralTaskIndex={chain.centralTaskIndex} chainType={'current'} userRole={userRole} onDataRefresh={onDataRefresh}/>
        ))}
      </div>
      <div className="upcoming-chain-container">
        <h2 onClick={toggleChainsUpcoming}>Upcoming</h2>
        {showChainsUpcoming && upcomingChains.map((chain, index) => (
          <Chain key={index} chain={chain} chainType={'upcoming'} userRole={userRole} onDataRefresh={onDataRefresh}/>
        ))}
      </div>
      <div className="completed-chain-container">
        <h2 onClick={toggleChainsCompleted}>Completed</h2>
        {showChainsCompleted && completedChains.map((chain, index) => (
          <Chain key={index} chain={chain} chainType={'completed'} userRole={userRole} onDataRefresh={onDataRefresh}/>
        ))}
      </div>
    </div>
  );
};

export default AllProjectTasks;
