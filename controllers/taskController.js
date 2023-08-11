const Project = require('../models/Project')
const User = require('../models/User')
const Note = require('../models/Note')
const Task = require('../models/Task')
const Notification = require('../models/Notification')

const asyncHandler = require('express-async-handler')

const { createNotification } = require('./notificationController')
const { addActivityLogEntry } = require('../utilities/activityLog')


// CREATE NOTE
const createNote = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const projId = req.projId;
    const { content } = req.body;
  
    if(!content) {
        return res.status(400).json({ message: 'Content is required! '})
    }

    // Create a new note
    const newNote = new Note({
      createdBy: userId,
      content: content,
    });
  
    // Save the note
    await newNote.save();
  
    // Update the project's notes array with the new note's ID
    const project = await Project.findById(projId).select('notes').exec();
    project.notes.unshift(newNote._id);
    await project.save();

    // Activity log
    const user = await User.findById(userId).select('firstName lastName').exec()
    const activityType = 'New Note'
    const description = `${user.firstName} ${user.lastName} has added a note; ref: ${newNote._id}`
    addActivityLogEntry(project, activityType, description)
    await project.save();
  
    res.status(201).json({ message: 'Note created successfully', note: newNote });
  });
  
// GET ALL NOTES
const getNotes = asyncHandler(async (req, res) => {
    const projId = req.projId;

    // Find the project by its ID and populate the notes array
    const project = await Project.findById(projId)
    .populate({
      path: 'notes',
      select: 'createdBy content updatedAt', // Select the desired fields
      populate: {
        path: 'createdBy',
        select: 'firstName lastName', // Select the user's name fields
      },
    })
    .exec();

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ notes: project.notes });
});

// UPDATE NOTE
const updateNote = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const noteId = req.params.noteId;
    const { content } = req.body;
  
    // Find the note by noteId and populate the 'createdBy' field
    const note = await Note.findById(noteId).populate('createdBy').exec();
  
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
  
    // Check if the logged-in user is the creator of the note
    if (note.createdBy._id.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this note' });
    }
  
    // Update the content if provided in the request body
    if (content) {
      note.content = content;
      await note.save();
  
      // Update activity log
      const project = await Project.findById({ _id: req.projId }).exec();
      const activityType = 'Note Updated';
      const description = `${note.createdBy.firstName} ${note.createdBy.lastName} updated a note; ref: ${noteId}`;
      addActivityLogEntry(project, activityType, description);
      await project.save();
  
      return res.status(200).json({ message: 'Note updated successfully', note });
    } else {
      return res.status(400).json({ message: 'Content is required for updating the note' });
    }
  });

// DELETE NOTE
const deleteNote = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const projId = req.projId;
    const noteId = req.params.noteId;

    const project = await Project.findById(projId).exec();
    if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
    }

    const note = await Note.findById(noteId).exec();
    if (!note) {
        return res.status(404).json({ message: 'Note not found.' });
    }

    // Check if the user has permission to delete the note
    if (note.createdBy.toString() !== userId && userRole !== 'manager' && userRole !== 'owner') {
        return res.status(403).json({ message: 'You do not have permission to delete this note.' });
    }

    // Remove the note from the project's notes array
    const noteIndex = project.notes.indexOf(noteId);
    if (noteIndex !== -1) {
        project.notes.splice(noteIndex, 1);
        await project.save();
    }

    // Delete the note from the database
    await Note.findByIdAndDelete(noteId);

    // Update activity log
    const user = await User.findById(userId).select('firstName lastName').exec()
    const activityType = 'Note Deleted';
    const description = `${user.firstName} ${user.lastName} deleted a note; ref: ${noteId}`;
    addActivityLogEntry(project, activityType, description);
    await project.save();

    res.status(200).json({ message: 'Note deleted successfully' });
});

  

module.exports = { 
    createNote,
    getNotes,
    updateNote,
    deleteNote   
};
