import React, { useState } from "react";
import Task from "./Task"; // Import your Task component
import { useParams } from "react-router-dom";

import AddTaskPopup from "./AddTaskPopup";
import "../Styles/Chain.css"


const Chain = ({ chain, centralTaskIndex, chainType, userRole, onDataRefresh}) => {
  const { userId, projId } = useParams();
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const centralIndex = centralTaskIndex !== undefined ? centralTaskIndex : 0;

  const contour = 2*21 + 10// 2 * (border + padding + margin) + gap
  const taskWidth = 300 + contour;

  let translateXValue = `${-taskWidth * centralIndex}px`;
  
  if (chainType === 'completed')
  {
    translateXValue = `${-taskWidth * chain.chain.length}px` 
  } else if ( chainType === 'upcoming') {    
    translateXValue = `${taskWidth * (centralIndex + 1)}px`
  }

  const handleOpenPopup = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const handleTaskAdded = () => {
    onDataRefresh();
  };

  // dependentTask
  const dependentTask = chain.chain[chain.chain.length - 1]._id

    return (
      <div className='chain'  /* style={{transform: `translateX(${translateXValue})`}} */ >
        {chain.chain.map((task, index) => (<Task key={index} task={task} projId={projId} userId={userId} userRole={userRole} onDataRefresh={onDataRefresh}/>))}

        {userRole === "manager" || userRole === "owner" ? (
          chainType !== "completed" ? (
            <div className="add-task-card" onClick={handleOpenPopup}>+</div>
          ) : null
        ) : null}
        {isPopupVisible && ( <AddTaskPopup onClose={handleClosePopup} onTaskAdded={handleTaskAdded} projId={projId} userId={userId} dependentTask={dependentTask}/>)}  
      </div>

  );
};

export default Chain;
