import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios"
import { Gantt, DisplayOption } from 'gantt-task-react';
import "../styles/Gantt.css";

import Navbar from '../Components/Navbar';
import Costs from '../Components/Costs';
//import GanttDiagram from '../Components/GanttDiagram';

import ForbiddenUserErrorPage from "./ForbiddenUserErrorPage"
import ForbiddenUserProjectErrorPage from "./ForbiddenUserProjectErrorPage";
import '../styles/ProjectManagement.css'; 


const ProjectManagement = () => {
  const { projId, userId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isActivityLogExpanded, setIsActivityLogExpanded] = useState(false);

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseCost, setNewExpenseCost] = useState("");
  const [newExpenseTaskReference, setNewExpenseTaskReference] = useState("");
  const [budget, setBudget] = useState(null); // Add budget state
  const [userRole, setUserRole] = useState('')
  const [showForm, setShowForm] = useState(false);
  const [newBudget, setNewBudget] = useState(null)
  

  const handleAddExpenseToggle = () => {
    setIsAddingExpense(!isAddingExpense);
    setNewExpenseName("");
    setNewExpenseCost("");
    setNewExpenseTaskReference("");
  };

  const handleAddExpense = async () => {
    try {
      const response = await axios.post(`/api/projects/${projId}/${userId}/expense`, {
        expenseName: newExpenseName,
        cost: newExpenseCost,
        taskReference: newExpenseTaskReference,
      });

      // Refresh the data
      handleRefresh();

      // Close the form
      handleAddExpenseToggle();
      newTotalCost()
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  useEffect(() => {
    axios
    .get(`/api/projects/${projId}/${userId}/managerInfo`)
    .then((response) => {
      setProjectData(response.data.project);
      setIsLoading(false);
      setUserRole(response.data.userRole)
      setBudget(response.data.project.budget)
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
    })
    .finally(() => {
      console.log(projectData)
    });

}, [userId, projId, navigate]);

    const handleBackToProject = () => {
        navigate(`/p/${projId}/${userId}`);
    };

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
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

  let totalCost = projectData.expenses.reduce((total, expense) => total + expense.cost, 0);
  let difference = totalCost - budget;

  let budgetClass = "budget-ok"; // Default class for costs within budget
if (difference < -1000) {
  budgetClass = "budget-green"; // Costs are significantly below budget
} else if (difference > 0) {
  budgetClass = "budget-red"; // Costs are above budget
}

  const newTotalCost = (() => {
    totalCost = projectData.expenses.reduce((total, expense) => total + expense.cost, 0);
    difference = totalCost - budget;

    if (difference < -1000) {
      budgetClass = "budget-green"; // Costs are significantly below budget
}   else if (difference > 0) {
      budgetClass = "budget-red"; // Costs are above budget
}   else {budgetClass = "budget-ok"}
  }) 


const handleSetBudget = async () => {
  if (!newBudget || isNaN(newBudget) || parseFloat(newBudget) <= 0) {
    return; // Invalid budget, do nothing
  }

  try {
    await axios.put(`/api/projects/${projId}/${userId}`, {
      budget: parseFloat(newBudget),
    });
    handleRefresh(); // Refresh budget data
    setNewBudget(''); // Clear input
    setShowForm(false)
    newTotalCost()
  } catch (error) {
    console.error('Error setting budget:', error);
  }
};

  const handleRefresh = () => {
    axios
    .get(`/api/projects/${projId}/${userId}/managerInfo`)
    .then((response) => {
      setProjectData(response.data.project);
      setBudget(response.data.project.budget)
      setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
    })
  }

  const ganttTasks = projectData.tasks.map(task => {

    const start = task.dependent && task.dependent.deadline ? new Date(task.dependent.deadline) : new Date(task.createdAt);
  
    return {
      id: task._id,
      start: start,
      end: new Date(task.deadline),
      name: task.title
    };
  });
  
  const DisplayOption = {
    headerHeight: 60, // Increase header height for date labels
    ganttHeight: 400,
    columnWidth: 30,
    listCellWidth: 'auto', // Let it adjust dynamically
    rowHeight: 40,
    barCornerRadius: 5,
    barFill: 100,
    handleWidth: 10,
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    barProgressColor: '#4CAF50',
    barProgressSelectedColor: '#2196F3',
    barBackgroundColor: '#FFFFFF', // Update task bar background color
    barBackgroundSelectedColor: '#DDD',
    arrowColor: '#FF5722',
    arrowIndent: 5,
    todayColor: '#FFC107',
  };
  

  return (
    <div>
    <Navbar userId={userId} />
    <div className="project-management-page">
      <div className="content-container">
      <button className="back-to-project-button" onClick={handleBackToProject}>Back to Project</button>
      
      <div className="gantt-diagram-container">
        <Gantt tasks={ganttTasks} DisplayOption={DisplayOption}/>
      </div>
        
        {/* Activity Log */}
        <div className="activity-log-container">
            <h3 className="activity-log-title">Activity Log</h3>
            <div className="activity-log-content">
                {projectData.activityLog.slice(0, 100).map((logEntry, index) => (
                    <div key={index} className="activity-log-entry">
                    <p className="activity-type">{logEntry.activityType}</p>
                    <p className="description">{logEntry.description}</p>
                    </div>
                ))}
            </div>
            <button className="toggle-activity-log-button" onClick={() => setIsActivityLogExpanded(!isActivityLogExpanded)}>
                {isActivityLogExpanded ? 'Show Less' : 'Show More'}
            </button>
        </div>

        {/* Costs */}
        {userRole === "owner" && (
       <div className="budget-controls">
       {showForm ? (
         <div className="budget-form">
           <input
             type="number"
             placeholder="Enter new budget"
             value={newBudget}
             onChange={(e) => setNewBudget(e.target.value)}
           />
           <button className="save-button" onClick={handleSetBudget}>
             Save
           </button>
           <button className="cancel-button" onClick={() => setShowForm(false)}>
             Cancel
           </button>
         </div>
       ) : (
         <button className="set-budget-button" onClick={() => setShowForm(true)}>
           Set Budget
         </button>
       )}
     </div>
    )}
      <div className="costs-container">
        <h3 className="costs-title">Costs</h3>
        <p className="total-cost">Total Cost: ${totalCost.toFixed(2)}</p>
        <p className={`budget ${budgetClass}`}>Budget: ${budget.toFixed(2)}</p>
        <button className="add-expense-button" onClick={handleAddExpenseToggle}>
          Add Expense
        </button>
        {isAddingExpense && (
          <div className="add-expense-form">
            <input
              type="text"
              placeholder="Expense Name"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Cost"
              value={newExpenseCost}
              onChange={(e) => setNewExpenseCost(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description / Refference"
              value={newExpenseTaskReference}
              onChange={(e) => setNewExpenseTaskReference(e.target.value)}
            />
            <button className="confirm-add-button" onClick={handleAddExpense}>
              Confirm
            </button>
            <button className="cancel-add-button" onClick={handleAddExpenseToggle}>
              Cancel
            </button>
          </div>
        )}
        {projectData.expenses.map((expense, index) => (
          <Costs key={index} expenseIndex={index} expense={expense} projId={projId} userId={userId} onEdit={handleRefresh} />
        ))}
      </div>

        </div>
    </div>
    </div>
  );
};

export default ProjectManagement;
