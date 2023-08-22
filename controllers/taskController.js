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

// CREATE TASK
const createTask = asyncHandler(async (req, res) => {
  const userRole = req.userRole;
  const projId = req.projId;
  const userId = req.userId;
  
  if (userRole !== 'manager' && userRole !== 'owner') {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
  }

  const { title, description, assignee, dependent, deadline } = req.body;

  if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
  }

  const project = await Project.findById(projId).select('title members tasks activityLog').exec();
  
  if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
  }

  // Check if assignee is a valid member of the project
  if (assignee && !project.members.includes(assignee)) {
      return res.status(400).json({ message: 'Invalid assignee. Assignee must be a project member.' });
  }

  // Check if dependent is a valid task in the project
  if (dependent) {
      const dependentTask = await Task.findById(dependent).exec();
      if (!dependentTask || !project.tasks.includes(dependent)) {
          return res.status(400).json({ message: 'Invalid dependent task. Dependent task must be part of the same project.' });
      }
  }

  // Handle deadline logic
  if (deadline) {
    const currentTime = new Date();
    if (deadline < currentTime) {
      return res.status(400).json({ message: 'Deadline cannot be in the past.' });
    }
  }

  // Create a new task
  const newTask = new Task({
      title,
      description,
      assignee,
      status: 'todo', // Default to 'todo' 
      dependent,
      deadline // Initialize deadline to null, to be updated if needed
  });

  // Save the task
  await newTask.save();

  // Update the project's tasks array with the new task's ID
  project.tasks.push(newTask._id);
  await project.save();

  // Send notification to the assignee
  if (assignee) {
    const title = 'You have been given a new task!';
    const body = `You have been assigned a new task on the ${project.title}: ${newTask.title}`;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId: assignee, title, body };
    await createNotification(req);
  }

  // Activity log
  const user = await User.findById(userId).select('firstName lastName').exec();
  const activityType = 'New Task';
  const logDescription = `${user.firstName} ${user.lastName} has created a new task: ${title}`;
  addActivityLogEntry(project, activityType, logDescription);
  await project.save();

  res.status(201).json({ message: 'Task created successfully', task: newTask });
});

// GET ALL TASKS
const getTasks = asyncHandler(async (req, res) => {
  const projId = req.projId;

  // Fetch the project with populated tasks
  const project = await Project.findById(projId).populate({
    path: 'tasks',
    populate: [
      { path: 'assignee', select: 'firstName lastName' },
      { path: 'dependent', select: 'title' }
    ]
  }).exec();

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Extract the tasks from the project
  const tasks = project.tasks;

  res.status(200).json({ tasks: tasks });
});

// UPDATE TASK
const updateTask = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const projId = req.projId;
  const userRole = req.userRole;

  const targetTaskId = req.params.taskId; // Assuming taskId is in the URL parameters
  const {
    title,
    description,
    status,
    assignee,
    dependent,
    deadline
  } = req.body;

  // Fetch the project and target task
  const project = await Project.findById(projId).exec();
  const targetTask = await Task.findById(targetTaskId).exec();

  if (!project || !targetTask) {
    return res.status(404).json({ message: 'Project or task not found' });
  }

  // Check if the userRole is 'manager' or 'owner'
  if (userRole !== 'manager' && userRole !== 'owner') {
    return res.status(403).json({ message: 'You are not authorized to perform this action.' });
  }

  // Check if the assignee is eligible (member of the project)
  if (assignee) {
    if (!project.members.includes(assignee)) {
      return res.status(400).json({ message: 'Assignee is not a member of the project.' });
    }
  }

  // Check if the dependent task is eligible (belongs to project.tasks)
  if (dependent) {
    if (!project.tasks.includes(dependent)) {
      return res.status(400).json({ message: 'Dependent task does not belong to the project.' });
    }
  }

  // Check if status is valid
  if (status && !['todo', 'in_progress', 'urgent', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  // Handle deadline logic
  if (deadline) {
    const currentTime = new Date();
    if (deadline < currentTime) {
      return res.status(400).json({ message: 'Deadline cannot be in the past.' });
    }
  }

  if (!title && !description && !status && !assignee && !dependent && !deadline) {
    return res.status(400).json({ message: 'No fields provided for update.' });
  }
  
  // Update the fields of the target task
  if (title) {
    targetTask.title = title;
  }
  if (description) {
    targetTask.description = description;
  }
  if (status) {
    if (targetTask.dependent) {
      const dependingTask = await Task.findById(targetTask.dependent).select('status')
      if (dependingTask.status !== 'completed') {
        return res.status(400).json({ message: 'Status cannot be changed for dependend tasks.' });
      }
    }
    targetTask.status = status;
    if (status === 'completed') {
      targetTask.deadline = null
    }
  }
  if (assignee) {
    targetTask.assignee = assignee;

    // Send notification to the assignee
    const title = 'You have been given a new task!';
    const body = `You have been assigned a new task on the ${project.title}: ${targetTask.title}`;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId: assignee, title, body };
    await createNotification(req);
  }
  if (dependent) {
    targetTask.dependent = dependent;
  }
  if (deadline) {
    // Add additional checks if necessary
    targetTask.deadline = deadline;
  }

  await targetTask.save();

  // Send notification to the assignee with the updates
  if (targetTask.assignee) {
    const titleNew = 'Your task has been updated!';
    const bodyNew = `${targetTask.title} has been updated. Latest status: ${targetTask.status}`;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId: targetTask.assignee, title: titleNew, body: bodyNew };
    await createNotification(req);
  }

  // Activity log
  const user = await User.findById(userId).select('firstName lastName').exec();
  const activityType = 'Task Updated';
  const logDescription = `${user.firstName} ${user.lastName} has updated the task: ${targetTask.title}`;
  addActivityLogEntry(project, activityType, logDescription );
  await project.save();

  res.status(200).json({ message: 'Task updated successfully', task: targetTask });
});

// DELETE TASK
const deleteTask = asyncHandler(async (req, res) => {
  const projId = req.projId
  const targetTaskId = req.params.taskId
  const userRole = req.userRole

  if (userRole !== 'manager' && userRole !== 'owner') {
    return res.status(403).json({ message: 'Only managers and owners can delete tasks.' });
  }

  // Get the project
  const project = await Project.findById(projId).populate('tasks').select('activityLog').exec();
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Get the task to delete
  const taskToDelete = await Task.findById(targetTaskId).exec();
  if (!taskToDelete) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if the task has any dependencies (is a dependent)
  if (taskToDelete.dependent) {
    // Find a task that depends on the taskToDelete
    const dependentTask = project.tasks.find(task => task.dependent && task.dependent.equals(targetTaskId));

    // Update the dependent task's dependency
    if (dependentTask) {
      dependentTask.dependent = taskToDelete.dependent;
      await dependentTask.save();
    }
  }

  // Remove the task ID from the project's tasks array
  project.tasks = project.tasks.filter(taskId => !taskId.equals(taskToDelete._id));
  await project.save();

  // Delete the task from the database
  await Task.findByIdAndDelete(targetTaskId).exec();

  // Activity log
  const user = await User.findById(req.userId).select('firstName lastName').exec();
  const activityType = 'Task Deleted';
  const logDescription = `${user.firstName} ${user.lastName} has deleted task: ${taskToDelete.title}`;
  addActivityLogEntry(project, activityType, logDescription);
  await project.save();

  res.status(200).json({ message: 'Task deleted successfully' });
});


module.exports = { 
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    createTask,
    getTasks,
    updateTask,
    deleteTask
};
