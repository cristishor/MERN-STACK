const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { checkEmailFormat } = require('../utilities/regexCheck');


// CREATE NEW PROJECT
// @route POST /projects/new/:userID 
// @access Private?
const createProject = asyncHandler(async (req, res) => {
    const { title, description, members } = req.body;
    const owner = req.user._id; // Assuming you have a middleware that sets req.user to the authenticated user
  
    // Check if title is provided
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
  
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
        members: [], 
        activityLog: [{
          activityType: 'Project created',
          description: `${req.user.firstName} ${req.user.lastName} has opened the ${title} project!`
        }]
      });
  
      // Add the project to the owner's projects array
      await User.findByIdAndUpdate(owner, { $push: { projects: project._id } });
  
      for (const email of members) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // SEND AN INVITATION EMAIL TO JOIN / IN-APP NOTIFICATION -> registered users only!
        } 
      }

      return res.status(201).json({ message: 'Project created successfully', project });

    } catch (error) {
      return res.status(500).json({ message: 'Error creating project', error: error.message });
    }
  });
  
  module.exports = { createProject };