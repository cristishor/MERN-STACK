const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { checkEmailFormat } = require('../utilities/regexCheck');


// CREATE NEW PROJECT
// @route POST /projects/new/:userID 
// @access Private?
const createProject = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    let { members } = req.body

    const user = await User.findById(req.userId);
    const owner = user._id
    // Check if title is provided
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    members = members ?? [];
    
    for (const email of members) {
        //first check if the email is a valid email
        if (!checkEmailFormat(email)) {
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
  
      for (const email of members) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // SEND AN INVITATION w/ IN-APP NOTIFICATION -> registered users only!
        } 
      }

      return res.status(201).json({ message: 'Project created successfully', project });

    } catch (error) {
      return res.status(500).json({ message: 'Error creating project', error: error.message });
    }
  });

const getNewProjectForm = asyncHandler(async (req, res) => {
  try {
      const initialData = {
        message: 'This is the new project form',
        userId: req.params.userId,
      };

      res.status(200).json(initialData);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  })
  
  module.exports = { 
    createProject,
    getNewProjectForm
  };