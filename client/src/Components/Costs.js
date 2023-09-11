import React, { useState } from 'react';
import axios from 'axios';


import "../Styles/Costs.css"

const Costs = ({ expense, expenseIndex, onEdit, userId, projId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [updatedExpenseName, setUpdatedExpenseName] = useState(expense.expenseName);
    const [updatedCost, setUpdatedCost] = useState(expense.cost);
    const [updatedTaskReference, setUpdatedTaskReference] = useState(expense.taskReference);
    const [isLoading, setIsLoading] = useState(false);
  
    const handleEdit = async () => {
      setIsEditing(true);
      setIsLoading(true);
  
      const updatedFields = {expenseName: updatedExpenseName,cost: updatedCost,taskReference: updatedTaskReference};
  
      try {
        const response = await axios.put(`/api/projects/${projId}/${userId}/expense`, {
          expenseIndex,
          ...updatedFields
        });
  
        if (response.status === 200) {
          setIsEditing(false);
          onEdit();
        }
        setTimeout(() => {setIsLoading(false)}, 500)
      } catch (error) {
        console.error("Error updating expense:", error);
        setIsEditing(false);
        setIsLoading(false);
      }
    };
  
    const handleDelete = async () => {
      setIsDeleting(true);
      setIsLoading(true);
  
      try {
        const response = await axios.delete(`/api/projects/${projId}/${userId}/expense`, {
          data: { expenseIndex }
        });
  
        if (response.status === 200) {
          setIsDeleting(false);
          onEdit();
          setTimeout(() => {setIsLoading(false)}, 500)
        }
          
      } catch (error) {
        console.error("Error deleting expense:", error);
        setIsLoading(false);
        setIsDeleting(false);
      }
    };

    if (isLoading) {
        return <div className="loading-message">Loading...</div>;
      }

      return (
        <div className="costs-card">
          {isEditing ? (
            <div className="editing-section">
              <form className="edit-form">
                <input
                  type="text"
                  value={updatedExpenseName}
                  onChange={(e) => setUpdatedExpenseName(e.target.value)}
                />
                <input
                  type="number"
                  value={updatedCost}
                  onChange={(e) => setUpdatedCost(e.target.value)}
                />
                <input
                  type="text"
                  value={updatedTaskReference}
                  onChange={(e) => setUpdatedTaskReference(e.target.value)}
                />
                <button onClick={handleEdit} disabled={isDeleting}>
                  {isDeleting ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </form>
            </div>
          ) : (
            <div className="display-section">
              <p>{expense.expenseName}</p>
              <p className="expense-cost">{expense.cost}</p>
              {expense.taskReference && <p>{expense.taskReference}</p>}
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      );
    };

export default Costs;
