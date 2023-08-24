import React, { useEffect, useState } from 'react';
import axios from 'axios';

import "../Styles/Notes.css"

const Notes = ({ projId, userId, onDataRefresh }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [addingNote, setAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`/api/projects/${projId}/${userId}/note`);
        setNotes(response.data.notes);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError('Error fetching notes');
      }
    };

    fetchNotes();
  }, [projId, userId]);


  const handleNewNoteClick = () => {
    setAddingNote(true);
  };
  const handleCancelNote = () => {
    setAddingNote(false);
    setNewNoteContent("");
  };

  const handleSubmitNote = async () => {
    setIsLoading(true);
    
    try {
        const response = await axios.post(`/api/projects/${projId}/${userId}/note`, {
          content: newNoteContent, // Include the newNoteContent in the request body
        });
    
        setAddingNote(false);
        setNewNoteContent("");
        onDataRefresh(); // refresh content
      } catch (error) {
        console.error("Error creating note:", error);
      } finally {
        setIsLoading(false);
  };
}

const handleEditNote = (note) => {

}
const handleDeleteNote = (noteId) => {

}


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h2>Notes</h2>
        {!addingNote && (
          <button className="add-note-button" onClick={handleNewNoteClick}>
            + Add Note
          </button>
        )}
      </div>

      {addingNote && (
        <div className="add-note-form">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Enter your new note here..."
          />
          <div className="button-group">
            <button className="cancel-button" onClick={handleCancelNote}>
              Cancel
            </button>
            <button className="submit-button" onClick={handleSubmitNote}>
              Submit
            </button>
          </div>
        </div>
      )}

      {notes.map((note, index) => (
        <div key={index} className="note">
          <p>{note.content}</p>
          <p>Created by:{" "}
            {note.createdBy._id === userId ? (
            <span className="me-text">Me</span>) : (`${note.createdBy.firstName} ${note.createdBy.lastName}`)}
          </p>
          <p>Created at: {note.createdAt}</p>

          {note.createdBy._id === userId && (
            <div className="note-buttons">
            <button className="edit-button" onClick={() => handleEditNote(note)}>Edit</button>
            <button className="delete-button" onClick={() => handleDeleteNote(note._id)}>Delete</button>
      </div>
    )}
        </div>
      ))}
    </div>
  );
};

export default Notes;
