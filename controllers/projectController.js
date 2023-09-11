const Project = require('../models/Project');
const User = require('../models/User');
const Note = require('../models/Note')
const Task = require('../models/Task')
const Notification = require('../models/Notification')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt') 

const { checkEmailFormat } = require('../utilities/regexCheck');
const { createNotification } = require('./notificationController')
const { addActivityLogEntry } = require('../utilities/activityLog');


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
    if (members) {
      for (const member of members) {
          //first check if the email is a valid email
          if (!checkEmailFormat(member)) {
              return res.status(400).json({ message: 'Invalid member email format.' });
          }      
      }
    }

      // Create the project
      const project = await Project.create({
        title,
        description: description || '',
        owner,
        projectManagers: `${owner}`,
        members: `${owner}`, 
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
  
      // Send notifications to existing users
      if (members) {
        for (const member of members) {
          const existingUser = await User.findOne({ email: member }).exec();

          if (existingUser) {
            // SEND AN INVITATION w/ IN-APP NOTIFICATION -> registered users only!
            const title = 'Join my team!';
            const body = `${user.firstName} ${user.lastName} has invited you to join the project ${project.title}`;
            const proposal = {
              sender: owner,
              targetId: project._id,
              message: 'joinProject'
            };
    
            const notificationData = {
              targetUserId: existingUser._id,
              title,
              body,
              proposal
            };
    
            await createNotification({ body: notificationData });
          }
        } 
      }
      return res.status(201).json({  success: true, message: 'Project created successfully', projectId:project._id });
  });

// GET PROJECT INFORMATION
const getProject = asyncHandler(async (req, res) => {
  const projId = req.projId;

  const project = await Project.findById(projId)
  .select('tasks title notes authorlessNotes -_id')
  .populate({
    path:'tasks',
    populate: {
      path: 'assignee',
      select: 'firstName lastName',
    },
  })
  .populate('notes authorlessNotes')


  if (!project) {
      return res.status(404).json({ message: 'Project not found' });
  }

  const tasks = project.tasks;
  

  const independentTasks = tasks.filter(task =>
    !tasks.some(otherTask => otherTask.dependent && otherTask.dependent.equals(task._id))
  );
  

  const getChainWithCentralTask = (startTask, tasks) => {
    const chain = [];
    let currentTask = startTask;
    let centralTaskIndex = 0
    let centralTask
  
    // Traverse down the chain
    while (currentTask) {
      chain.push(currentTask);
  
      if (currentTask.status === 'urgent' || currentTask.status === 'in_progress') { 
        centralTaskIndex = chain.length - 1;
        centralTask = currentTask
      }
  
      const dependentTaskId = currentTask.dependent;
      if (!dependentTaskId) {
        break; // No more dependent tasks, stop the loop
      }
      currentTask = tasks.find(task => task._id.equals(dependentTaskId))    
    }
    chain.reverse();

    centralTaskIndex = chain.length - 1 - centralTaskIndex;

    return { centralTaskIndex, chain, centralTask };
  };
  
  const chainsWithCentralTasks = independentTasks.map(independentTask => {
    return getChainWithCentralTask(independentTask, tasks);
  });


  // Separate chains with and without centralTask
  const completedChains = [];
  const upcomingChains = [];
  const sortedChains = [];

  chainsWithCentralTasks.forEach(chainObj => {
    if (!chainObj.centralTask) {
      const hasCompletedTask = chainObj.chain.some(task => task.status === 'completed');
      if (hasCompletedTask) {
        completedChains.push(chainObj);
      } else {
        upcomingChains.unshift(chainObj);
      }
    } else {
      sortedChains.push(chainObj);
    }
  });
  
  // Sort chains with centralTask
  sortedChains.sort((chainA, chainB) => {
  const taskA = chainA.centralTask;
  const taskB = chainB.centralTask;

  if (taskA.status !== taskB.status) {
    return taskA.status === 'urgent' ? -1 : 1;
  }

  if (taskA.deadline && taskB.deadline) {
    if (taskA.deadline !== taskB.deadline) {
      return taskA.deadline - taskB.deadline;
    }
  } else if (taskA.deadline) {
    return -1; // taskA has a deadline, taskB doesn't, taskA comes first
  } else if (taskB.deadline) {
    return 1; // taskB has a deadline, taskA doesn't, taskB comes first
  }
  return taskB.createdAt - taskA.createdAt;
  });

  const notes = project.notes
  const authorlessNotes = project.authorlessNotes

  const notesWithAuthorData = await Promise.all(notes.map(async note => {
    const author = await User.findById(note.createdBy).select('firstName lastName').exec();
    return {
      content: note.content,
      updatedAt: note.updatedAt,
      firstName: author.firstName,
      lastName: author.lastName
    };
  }));

  res.status(200).json({ title:project.title, notesWithAuthorData, authorlessNotes, sortedChains, upcomingChains, completedChains, userRole: req.userRole });

});

// GET PROJECT PLUS
const getProjectPlus = asyncHandler(async (req, res) => {
  const projId = req.projId;

  const project = await Project.findById(projId)
      .populate('members', 'firstName lastName profilePicture')
      .exec();

  if (!project) {
      return res.status(404).json({ message: 'Project not found' });
  }

  const projectWithDetails = {
      _id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      endDate: project.endDate,
      members: project.members.map(member => ({
          id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          profilePicture: member.profilePicture
      })),
      createdAt: project.createdAt
  };

  res.status(200).json({ project: projectWithDetails, userRole: req.userRole });
});
// +
// GET PROJECT USER INFO
const getUserProjectData = asyncHandler(async (req, res) => {
  const projId = req.projId;
  const targetUserId = req.body.targetUserId;

  if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID cannot be empty' });
  }

  // Check if the targetUserId belongs to a member of the project
  const project = await Project.findById(projId)
      .populate('members', '_id')
      .exec();

  if (!project) {
      return res.status(404).json({ message: 'Project not found' });
  }

  const targetUserIsMember = project.members.some(member => member._id.equals(targetUserId));

  if (!targetUserIsMember) {
      return res.status(403).json({ message: 'Target user is not a member of the project' });
  }

  // Determine the role of the target user
  let targetUserRole = 'member';

  if (project.owner.equals(targetUserId)) {
      targetUserRole = 'owner';
  } else if (project.projectManagers.some(manager => manager.equals(targetUserId))) {
      targetUserRole = 'manager';
  }

  // Retrieve userProject data for all members except the target user
  const userProjectData = await User.findOne({
      _id: { $in: targetUserId }
  }).select('firstName lastName email contactInformation');

  res.status(200).json({ userProjectData, targetUserRole });
});

// GET PROJECT MEMBERS
const getMembers = asyncHandler(async (req, res) => {
  const projId = req.projId;


  // Check if the targetUserId belongs to a member of the project
  const project = await Project.findById(projId)
    .select('_members')
    .populate({
      path: 'members',
      select: '_id firstName lastName profilePicture', 
    })

  if (!project) {
      return res.status(404).json({ message: 'Project not found' });
  }



  res.status(200).json({ members: project.members });
});

// GET PROJECT MANAGER DATA
const getProjectManagerData = asyncHandler(async (req, res) => {
  const userRole = req.userRole;
  const projId = req.projId;

  if (userRole !== 'manager' && userRole !== 'owner') {
      return res.status(403).json({ message: 'Access denied.' });
  }

  const project = await Project.findById(projId)
      .select('budget expenses activityLog tasks')
      .populate({
          path: 'tasks',
          select: 'title deadline createdAt dependent',
          match: { deadline: { $ne: null } }, // Only tasks with deadlines
          options: { sort: { deadline: 1 } }, // Sort by deadline in ascending order
          populate: { path: 'dependent' },
      })
      .exec();

  res.status(200).json({ project, userRole: req.userRole });

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

    // Check if the targetUserId exists and is a manager of the project
    const targetUser = await User.findById( targetUserId ).exec()
    const project = await Project.findById(projId).exec();

    if (!targetUser || !project.projectManagers.includes(targetUserId)) {
      return res.status(404).json({ message: 'Invalid target user ID or user is not a project manager of the project.' });
    }
    
    if (!password) {
      return res.status(401).json({ message: 'Password is required' });
    }

    // Check if the password matches the owner's password
    const owner = await User.findById(userId).select('+password').exec();
    const isPasswordValid = await bcrypt.compare(password, owner.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password. Ownership not transferred.' });
    }

    // Remove the project from the previous owner's projectsOwned array
    owner.projectsOwned.pull(projId);
    await owner.save();

    // Add the project to the new owner's projectsOwned array
    targetUser.projectsOwned.push(projId);
    await targetUser.save()

    // Update the owner field in the project document
    await Project.findByIdAndUpdate(projId, { owner: targetUserId });

    // Send notification to the targeted user if not already present in the team
      const title = 'You have been promoted to owner!';
      const body = `Congratulations! ${owner.firstName} ${userId.lastName}, owner of ${project.title} has made you the predecessor of his team! `;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req);

    const activityType = 'Ownership Changed'
    const description = `${targetUser.firstName} ${targetUser.lastName} is the new owner.`
    addActivityLogEntry(project, activityType, description)
    await project.save();

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

    let descriptionLog = ''
    let endDateChanged

    if (status) {
      if(status !== 'in_progress' && status !=='completed' && status !=='on_hold'){
        return res.status(400).json({ message: 'Wrong status value. '})
      }
      project.status = status;
      descriptionLog += `New status: ${status}\n`
    }
    if (title) {
      project.title = title;
      descriptionLog += `New title: ${title}\n`
    }
    if (description) {
      project.description = description;
      descriptionLog += `New description: ${description}\n`
    }
    if (budget) {
      project.budget = budget;
      descriptionLog += `New budget: ${budget}\n`
    }
    if (endDate) {
      project.endDate = endDate;
      descriptionLog += `New closing date: ${endDate}\n`;
    } else if (project.endDate && endDate === null) {
      project.endDate = null
      descriptionLog += `Project closing date removed`;
      endDateChanged = true
    }

    if (!title  && !description && !status && !budget && !endDate && !endDateChanged) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    // Save the updated project
    await project.save();

    const activityType = 'Project Updated'
    const log = `The owner has made the following changes:\n ${descriptionLog}`
    addActivityLogEntry(project, activityType, log )
    await project.save();

    res.status(200).json({ message: 'Project updated successfully.' });
});

// POST NEW MANAGER
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

    const targetUser = await User.findById(targetUserId).exec()

    if (!targetUser || !project.members.includes(targetUserId)) {
      return res.status(400).json({ message: 'Invalid target user.' });
    }

    project.projectManagers.push(targetUserId);

    await project.save();

    // Send notification to the targeted user if not already present in the team
    const owner = await User.findById(project.owner).select('firstName lastName').exec() 
    const title = 'You have been promoted to manager!';
    const body = `Congratulations! ${owner.firstName} ${owner.lastName}, owner of ${project.title} has made you the project manager of his team! `;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req);

    const activityType = 'New Manager'
    const description = `${targetUser.firstName} ${targetUser.lastName} has been named manager.`
    addActivityLogEntry(project, activityType, description)
    await project.save();

    res.status(200).json({ message: 'Project manager added successfully.' });
});

// DELETE REMOVE MANAGER
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

    const targetUser = await User.findById(targetUserId).exec()

    if (!targetUser || !project.projectManagers.includes(targetUserId)) {
      return res.status(400).json({ message: 'Invalid target user or not a project manager.' });
    }

    project.projectManagers = project.projectManagers.filter(managerId => !managerId.equals(targetUserId));

    await project.save();

    // Send notification to the targeted user if not already present in the team
    const owner = await User.findById(project.owner).select('firstName lastName').exec() 
    const title = 'You have been demoted.';
    const body = `Unfortunatelly, ${owner.firstName} ${owner.lastName} has decided to remove your project manager status from the ${project.title}`;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req);

    const activityType = 'Removed Manager'
    const description = `${targetUser.firstName} ${targetUser.lastName} is no longer manager`
    addActivityLogEntry(project, activityType, description)
    await project.save();

    res.status(200).json({ message: 'Project manager removed successfully.' });
});

// POST ADD MEMBER
const addMember = asyncHandler(async (req, res) => {
    const { targetEmail } = req.body;

    const userId = req.userId
    const userRole = req.userRole
    const projId = req.projId

    if (userRole !== 'owner' && userRole !=='manager') {
      return res.status(403).json({ message: 'Only managers can add members to the project.' });
    }

    const project = await Project.findById(projId).exec()
    const user = await User.findById(userId).select('firstName lastName').exec();

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetUser = await User.findOne({ email: targetEmail }).exec()
    if (!targetUser) {
      return res.status(400).json({ message: 'Invalid target user.' });
    }

    // Check if a similar proposal notification already exists
    const existingNotification = await Notification.findOne({
    'proposal.sender': userId,
    'proposal.targetId': projId,
    'proposal.message': 'joinProject'
    });

    if (existingNotification) {
      return res.status(400).json({ message: 'Similar proposal notification already exists.' });
    }
    const targetUserId = targetUser._id
    // Send notification to the targeted user if not already present in the team
    if (!project.members.includes(targetUserId)) {
      const title = 'Join my team!';
      const body = `${user.firstName} ${user.lastName}, manager of ${project.title} has asked you to join his team`;
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
    await createNotification(req);

    const activityType = 'Sent add member notification'
    const description = `${targetUser.firstName} ${targetUser.lastName} has been asked to join by ${user.firstName} ${user.lastName}.`
    addActivityLogEntry(project, activityType, description)
    await project.save();

    res.status(200).json({ message: 'Member added successfully' })

});

// DELETE REMOVE MEMBER
const removeMember = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;
    const projId = req.projId
    const userRole = req.userRole
    console.log(targetUserId)

    const caller = await User.findById(req.userId).select('firstName lastName').exec();
    console.log(caller._id)


    if (userRole !== 'owner' && targetUserId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized: Only owners can remove members' });
    }

    if (userRole === 'owner' && targetUserId === caller._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: you must pass down the ownership before leaving the project.' });
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

    const authorlessNotes = await Note.find({
      createdBy: targetUserId,
      _id: { $in: project.notes }, // Assuming project.authorlessNotes contains IDs of associated notes
    }).exec();

    // Send them notes to authorlessNotes
    const formattedAuthorlessNotes = authorlessNotes.map(note => ({
    removedCreator: `${targetUser.firstName} ${targetUser.lastName}`,
    noteBody: note.content,
    }));  
    project.authorlessNotes = project.authorlessNotes.concat(formattedAuthorlessNotes);

    const deletedNotes = await Note.deleteMany({
      createdBy: targetUserId,
      _id: { $in: project.notes },
    }).exec();

    // Remove the targetUserId from the project members array and managers array
    const indexToRemove = project.members.indexOf(targetUserId);
    if (indexToRemove !== -1) {
      project.members.splice(indexToRemove, 1);
    }
    const isUserManager = project.projectManagers.includes(targetUserId)
    if(isUserManager) {
      const indexToRemoveFromManagers = project.projectManagers.indexOf(targetUserId);
      if (indexToRemoveFromManagers !== -1) {
      project.projectManagers.splice(indexToRemoveFromManagers, 1);
      }
    }

    // Remove projId from the targetUser.projectsInvolved array
    const indexToRemoveFromUser = targetUser.projectsInvolved.indexOf(projId);
    if (indexToRemoveFromUser !== -1) {
      targetUser.projectsInvolved.splice(indexToRemoveFromUser, 1);
    }
    await targetUser.save();

    // Send notification to the targeted user if not already present in the team
    if ( targetUserId !== caller._id ) {
    const title = 'You have been kicked out of the team.';
    const body = `Unfortunatelly, ${caller.firstName} ${caller.lastName} has decided to remove you from ${project.title}`;

    // Pass the notification data to the createNotification controller
    req.body = { targetUserId, title, body };
    await createNotification(req);
    }

    const activityType = 'Removed Member'
    const description = `${targetUser.firstName} ${targetUser.lastName} has been removed by ${caller.firstName} ${caller.lastName}.`
    addActivityLogEntry(project, activityType, description)
    await project.save();

    return res.status(200).json({ message: 'Member removed successfully' });
});

// POST CREATE EXPENSE
const createExpense = asyncHandler(async (req, res) => {
  
  const userRole = req.userRole
  const projId = req.projId
  
  // Check if the userRole is 'manager'
  if (userRole !== 'manager' && userRole !== 'owner') {
    return res.status(403).json({ message: 'You are not authorized to perform this action.' });
  }

  const { expenseName, cost, taskReference } = req.body;

  const project = await Project.findById(projId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  let newExpense

  // Create the expense object
  if ( !expenseName || !cost ) {
    return res.status(400).json({ message: 'Expense name or cost invalid! Please fill in the fields.'})
  } else {
    newExpense = { expenseName, cost };
  }

  // If taskReference is provided, find the task and add its title to the expense
  if (taskReference) {
    newExpense.taskReference = taskReference;
  }

  // Add the new expense to the project's expenses array
  project.expenses.unshift(newExpense);
  await project.save();

  const user = await User.findById(req.userId).select('firstName lastName').exec();
  const activityType = 'New Expense'
  const description = `${user.firstName} ${user.lastName} added ${expenseName}`
  if (taskReference) {
    description += ` in reference to ${taskReference}`
  }
  addActivityLogEntry(project, activityType, description)
  await project.save();

  return res.status(200).json({ message: 'Expense created successfully', expense: newExpense });
});

// UPDATE UPDATE EXPENSE
const updateExpense = asyncHandler(async (req, res) => {

  const userRole = req.userRole;
  const projId = req.projId;

  // Check if the userRole is 'manager' or 'owner'
  if (userRole !== 'manager' && userRole !== 'owner') {
    return res.status(403).json({ message: 'You are not authorized to perform this action.' });
  }

  const { expenseIndex, expenseName, cost, taskReference } = req.body;

  if ( expenseIndex === undefined || expenseIndex === null || (!expenseName && !cost)) {
    return res.status(400).json({ message: 'expenseIndex missing or no fields to update'})
  }

  const project = await Project.findById(projId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Check if the provided expenseIndex is within bounds
  if (expenseIndex < 0 || expenseIndex >= project.expenses.length) {
    return res.status(400).json({ message: 'Invalid expense index.' });
  }

  const updatedExpense = project.expenses[expenseIndex];

  // Update the expense properties if provided
  if (expenseName) {
    updatedExpense.expenseName = expenseName;
  }
  if (cost) {
    updatedExpense.cost = cost;
  }
  if (taskReference) {
    updatedExpense.taskReference = taskReference;
  }

  await project.save();

  const user = await User.findById(req.userId).select('firstName lastName').exec();
  const activityType = 'Updated Expense'
  const description = `${user.firstName} ${user.lastName} updated ${expenseName}`
  if (taskReference) {
    description += ` in reference to ${taskReference}`
  }
  addActivityLogEntry(project, activityType, description)
  await project.save();

  return res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
});

// DELETE EXPENSE
const deleteExpense = asyncHandler(async (req, res) => {

  const userRole = req.userRole;
  const projId = req.projId;
  const { expenseIndex } = req.body; // Assuming you're sending the index in the request body

  // Check if the userRole is 'manager' or 'owner'
  if (userRole !== 'manager' && userRole !== 'owner') {
    return res.status(403).json({ message: 'You are not authorized to perform this action.' });
  }

  const project = await Project.findById(projId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if ( expenseIndex === undefined || expenseIndex === null) {
    return res.status(400).json({ message: 'expenseIndex missing'})
  }

  // Check if the provided expenseIndex is within bounds
  if (expenseIndex < 0 || expenseIndex >= project.expenses.length) {
    return res.status(400).json({ message: 'Invalid expense index.' });
  }

  const expenseName = project.expenses[expenseIndex].expenseName

  // Remove the expense from the project's expenses array
  const removedExpense = project.expenses.splice(expenseIndex, 1)[0];
  await project.save();

  const user = await User.findById(req.userId).select('firstName lastName').exec();
  const activityType = 'Deleted Expense'
  const description = `${user.firstName} ${user.lastName} deleted ${expenseName}`
  addActivityLogEntry(project, activityType, description)
  await project.save();

  return res.status(200).json({ message: 'Expense removed successfully', expense: removedExpense });
});

// DELETE PROJECT
const deleteProject = asyncHandler(async (req, res) => {
  const userRole = req.userRole;
  const userId = req.userId;
  const projId = req.projId;
  const { password } = req.body;

  if (userRole !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can delete the project.' });
  }

  const project = await Project.findById(projId).select('tasks notes members title').exec();

  if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
  }

  const owner = await User.findById(userId).select('+password').exec();

  if (!owner) {
      return res.status(404).json({ message: 'User not found.' });
  }

  if (!password) {
    return res.status(404).json({ message: 'Please fill in the password for confirmation.'})
  }

  const passwordMatches = await bcrypt.compare(password, owner.password);

  if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect password.' });
  }

  // Delete all notes from the project
  await Note.deleteMany({ _id: { $in: project.notes } }).exec();

  // Delete all tasks from the project
  await Task.deleteMany({ _id: { $in: project.tasks } }).exec();

  // Remove projId from members' projectsInvolved and send notifications
  const updatedMembers = project.members.filter(memberId => memberId !== userId);
  for (const memberId of updatedMembers) {
      const member = await User.findById(memberId).select('projectsInvolved').exec();

      if (member) {
          member.projectsInvolved = member.projectsInvolved.pull(projId)
          await member.save();

          // Send notification to the assignee
          const title = 'Project closed!';
          const body = `The project - ${project.title} - has been closed. Thank you for your participation!`;

          // Pass the notification data to the createNotification controller
          req.body = { targetUserId: memberId, title, body };
          createNotification(req)
      }
  }
  await owner.save();

  // Remove projId from owner's projectsOwned
  owner.projectsOwned.pull(projId);
  await owner.save();

  // Delete the project
  await Project.findByIdAndDelete(projId)

  res.status(200).json({ message: 'Project deleted successfully.' });
});


  module.exports = { 
    createProject,
    getProject,
    passOwnership,
    updateProject,
    addManager,
    deleteManager,
    addMember,
    removeMember,
    createExpense,
    updateExpense,
    deleteExpense,
    deleteProject,
    getProjectPlus,
    getUserProjectData,
    getProjectManagerData,
    getMembers
  };