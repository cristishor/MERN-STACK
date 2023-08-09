const Project = require('../models/Project');
const User = require('../models/User');
const Note = require('../models/Note')
const Task = require('../models/Task')
const asyncHandler = require('express-async-handler');
const { checkEmailFormat } = require('../utilities/regexCheck');
const { createNotification } = require('./notificationController')


// CREATE NEW PROJECT
// @route POST /projects/new/:userID 
const createProject = asyncHandler(async (req, res) => {
    const { title, description, members } = req.body;

    const user = await User.findById(req.userId).exec();
    const owner = user._id
    // Check if title is provided
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    for (const member of members) {
        //first check if the email is a valid email
        if (!checkEmailFormat(member.email)) {
            return res.status(400).json({ message: 'Invalid member email format.' });
        }      
    }
    try {
      // Create the project
      const project = await Project.create({
        title,
        description: description || '',
        owner,
        projectManagers: `${user._id}`,
        members: [], 
        activityLog: [{
          activityType: 'Project created',
          description: `${user.firstName} ${user.lastName} has opened the ${title} project!`
        }]
      });
  
      // Add the project to the owner's projects array
      await User.findByIdAndUpdate(owner, { 
        $push: { 
            projectsOwned: project._id,
            projectsInvolved: project._id
          } 
        });
  
      for (const member of members) {
        const email = member.email
        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
            // SEND AN INVITATION w/ IN-APP NOTIFICATION -> registered users only!
        } 
      }

      return res.status(201).json({ message: 'Project created successfully', project });

    } catch (error) {
      return res.status(500).json({ message: 'Error creating project', error: error.message });
    }
  });

// GET PROJECT INFORMATION
const getProject = asyncHandler (async (req, res) => {
    const userRole = req.userRole
    const projId = req.projId

    let project = await Project.findById(projId).exec();

    if (userRole === 'manager' || userRole === 'owner') {
      res.status(200).json({ project });
    } else if (userRole === 'regular') {
      // Create a new object with only the allowed fields for regular users
      project = {
        _id: project._id,
        title: project.title,
        description: project.description,
        owner: project.owner,
        projectManagers: project.projectManagers,
        members: project.members,
        projectTasks: project.tasks,
        projectNotes: project.notes,
        authorlessNotes: project.authorlessNotes,
        status: project.status,
        endDate: project.endDate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
      res.status(200).json({ project });
    }
});

// UPDATE OWNER
const passOwnership = asyncHandler(async (req, res) => {
    const { targetUserId, password } = req.body

    const userId = req.userId
    const userRole = req.userRole
    const projId = req.projId

    if (userRole !== 'owner') {
      return res.status(403).json({ message: 'Only owners can pass ownership.' });
    }

    // Check if the targetUserId exists and is a member of the project
    const targetUser = await User.findById(targetUserId).exec();
    const project = await Project.findById(projId).exec();

    if (!targetUser || !project.projectManagers.includes(targetUserId)) {
      return res.status(404).json({ message: 'Invalid target user ID or user is not a project manager of the project.' });
    }

    // Check if the password matches the owner's password
    const owner = await User.findById(userId).select('+password').exec();
    const isPasswordValid = await bcrypt.compare(password, owner.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password. Ownership not transferred.' });
    }

    // Update the owner field in the project document
    await Project.findByIdAndUpdate(projId, { owner: targetUserId });

    // Send notification to the targeted user if not already present in the team
      const title = 'You have been promoted to owner!';
      const body = `Congratulations! ${owner.firstName} ${userId.lastName}, owner of ${project.title} has made you the predecessor of his team! `;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req, res, next);

    res.status(200).json({ message: 'Ownership transferred successfully.' });

});

// UPDATE PROJECT
const updateProject = asyncHandler(async (req, res) => {
    const { title, description, status, budget, endDate } = req.body;

    const userRole = req.userRole
    const projId = req.projId

    if (userRole !== 'owner') {
      return res.status(403).json({ message: 'Only owners can update the project.' });
    }

    const project = await Project.findById(projId).exec();

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (title) {
      project.title = title;
    }
    if (description) {
      project.description = description;
    }
    if (status) {
      project.status = status;
    }
    if (budget) {
      project.budget = budget;
    }
    if (endDate) {
      project.endDate = endDate;
    }

    if (!title  && !description && !status && !budget && !endDate) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    // Save the updated project
    await project.save();

    res.status(200).json({ message: 'Project updated successfully.' });
});

// POST NEWMANAGER
const addManager = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;

    const userRole = req.userRole
    const projId = req.projId

    if (userRole !== 'owner') {
      return res.status(403).json({ message: 'Only owners can add project managers.' });
    }

    const project = await Project.findById(projId).exec();

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetUser = await User.findById(targetUserId).exec();
    if (!targetUser || !project.members.includes(targetUserId)) {
      return res.status(400).json({ message: 'Invalid target user.' });
    }

    project.projectManagers.push(targetUserId);

    await project.save();

    // Send notification to the targeted user if not already present in the team
    const title = 'You have been promoted to manager!';
    const body = `Congratulations! ${owner.firstName} ${userId.lastName}, owner of ${project.title} has made you the project manager of his team! `;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req, res, next);

    res.status(200).json({ message: 'Project manager added successfully.' });
});

// DELETE MANAGER
const deleteManager = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;

    const userRole = req.userRole
    const projId = req.projId

    if (userRole !== 'owner') {
      return res.status(403).json({ message: 'Only owners can remove project managers.' });
    }

    const project = await Project.findById(projId).exec();

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetUser = await User.findById(targetUserId).exec();
    if (!targetUser || !project.projectManagers.includes(targetUserId)) {
      return res.status(400).json({ message: 'Invalid target user or not a project manager.' });
    }

    project.projectManagers = project.projectManagers.filter(managerId => managerId.toString() !== targetUserId);

    await project.save();

    // Send notification to the targeted user if not already present in the team
    const title = 'You have been demoted.';
    const body = `Unfortunatelly, ${owner.firstName} ${userId.lastName} has decided to remove your project manager status from the ${project.title}`;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req, res, next);

    res.status(200).json({ message: 'Project manager removed successfully.' });
});

// POST ADD MEMBER
const addMember = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;

    const userId = req.userId
    const userRole = req.userRole
    const projId = req.projId
    
    if (userRole !== 'owner') {
      return res.status(403).json({ message: 'Only owners can add members to the project.' });
    }

    const project = await Project.findById(projId).exec()
    const owner = await User.findById(userId).select('firstName lastName').exec();

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(400).json({ message: 'Invalid target user.' });
    }

    // Send notification to the targeted user if not already present in the team
    if (!project.members.includes(targetUserId)) {
      const title = 'Join my team!';
      const body = `${owner.firstName} ${userId.lastName}, owner of ${project.title} has asked you to join his team`;
      const proposal = {
        sender : userId,
        targetId : projId,
        message : 'joinProject'
      }
    
      req.body = { targetUserId, title, body, proposal };

    } else {
      return res.status(400).json({ message: 'Target user already in team. '})
    }

    // Pass the notification data to the createNotification controller
    try {
      await createNotification(req);
      res.status(200).json({ message: 'Member added successfully' })
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'An error occurred while adding the member' });
    }
});

// DELETE REMOVE MEMBER
const removeMember = asyncHandler(async (req, res, next) => {
    const { targetUserId } = req.body;
    const projId = req.projId
    const userRole = req.userRole

    if (userRole !== 'owner') {
      return res.status(403).json({ message: 'Unauthorized: Only owners can remove members' });
    }

    const project = await Project.findById(projId).exec();
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const targetUser = await User.findById(targetUserId).populate('firstName lastName').exec()
    if (!targetUser) {
      return res.status(400).json({ message: 'Invalid target user.' });
    }

    await Task.updateMany({ project: projId, assignee: targetUserId }, { $unset: { assignee: 1 } });

    // Loop through all notes, and if createdBy is targetUserId, add to authorlessNotes
    const authorlessNotes = [];
    for (const noteId of project.notes) {
      const note = await Note.findById(noteId).exec();
      if (note.createdBy.toString() === targetUserId) {
        authorlessNotes.push({
          removedCreator: ` ${targetUser.firstName} ${targetUser.lastName}`,
          noteBody: note.content,
        });
      }
    }

    // Update the project with the modified authorlessNotes
    await Project.findByIdAndUpdate(projId, { $set: { authorlessNotes } });

    // Remove the targetUserId from the project members array
    const indexToRemove = project.members.indexOf(targetUserId);
    if (indexToRemove !== -1) {
      project.members.splice(indexToRemove, 1);
    }

    await project.save();

    // Send notification to the targeted user if not already present in the team
    const title = 'You have been kicked out of the team.';
    const body = `Unfortunatelly, ${owner.firstName} ${userId.lastName} has decided to remove you from ${project.title}`;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req, res, next);

    return res.status(200).json({ message: 'Member removed successfully' });
});

// POST CREATE EXPENSE
const createExpense = asyncHandler(async (req, res, next) => {
  try {
    const { projId, userRole } = req.body;
    
    // Check if the userRole is 'manager'
    if (userRole !== 'manager' || userRole !== 'owner') {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    const { expenseName, cost, taskReference } = req.body;

    const project = await Project.findById(projId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Create the expense object
    if ( !expenseName || !cost ) {
      res.status(400).json({ message: 'Expense name or cost invalid! Please fill in the fields.'})
    } else {
      const newExpense = { expenseName, cost };
    }

    // If taskReference is provided, find the task and add its title to the expense
    if (taskReference) {
      const task = await Task.findById(taskReference);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      newExpense.taskReference = task.title;
    }

    // Add the new expense to the project's expenses array
    project.expenses.unshift(newExpense);
    await project.save();

    return res.status(200).json({ message: 'Expense created successfully', expense: newExpense });
  } catch (error) {
    return next(error);
  }
});

  
  module.exports = { 
    createProject,
    getProject,
    passOwnership,
    updateProject,
    addManager,
    deleteManager,
    addMember,
    removeMember
  };