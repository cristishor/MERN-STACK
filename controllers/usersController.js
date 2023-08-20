const User = require('../models/User')
const Project = require('../models/Project');
const Task = require('../models/Task');
const Note = require('../models/Note')
const Notification = require('../models/Notification')
const asyncHandler = require('express-async-handler') //module used to help with not having too many try catch blocks as we use async methods with mongoose to save or delete data or even find data from mongodb
const bcrypt = require('bcrypt') //module used to hash the password before we save it
const { checkEmailFormat, checkPasswordFormat } = require('../utilities/regexCheck'); 
const { createToken, verifyToken } = require('../utilities/jwt')


// regex check email
const regexCheckEmail = (req, res) => {
    const { email } = req.body;
  
    if (checkEmailFormat(email)) {
      return res.status(200).json({ message: 'Valid email format.' });
    } else {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
  };

// regex check password
const regexCheckPassword = (req, res) => {
    const { password } = req.body;
  
    if (checkPasswordFormat(password)) {
      return res.status(200).json({ message: 'Valid password format.' });
    } else {
      return res.status(400).json({ message: 'Invalid password format.' });
    }
};

// CREATE NEW USER
const createNewUser = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, contactInformation } = req.body
    let profilePicture = req.body.profilePicture ?? null
    let {phone, address} = contactInformation ?? {phone: null, address: null}
  

    // Confirm data
    const requiredFields = ['email', 'password', 'firstName', 'lastName'];
    if (requiredFields.some((field) => !req.body[field])) {
        console.log('Missing required fields:', requiredFields.filter((field) => !req.body[field]));
        return res.status(400).json({ message: 'Please fill in all required fields' });
      }

    // Regex check format
    if (!checkEmailFormat(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }
    
    if (!checkPasswordFormat(password)) {
        return res.status(400).json({ message: 'Invalid password format.' });
      }

    // Check for duplicate

        const duplicateEmail = await User.findOne ({ email }).lean().exec() // if you pass something in (unlike find) call exec() at end

        if(duplicateEmail) {
             return res.status(409).json({ message: 'Duplicate email'})
        }


    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = {
        email,
        'password': hashedPwd,
        firstName,
        lastName,
        profilePicture: profilePicture || null,
        contactInformation: {
          phone: phone || null,
          address: address || null
        }
    }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) {
      res.status(201).json({ message: `New user ${email} created` });
  } else {
      res.status(400).json({ message: 'Invalid user data received' });
  }

    
})

// LOG IN USER
const logInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const tokenAlready = req.cookies.jwt;

  if (tokenAlready) {
    // Decode the token to get user information
    const decoded = verifyToken(tokenAlready);

    if (decoded) {
      return res.status(200).json({ success: true, userId: decoded.userId });
    }
  }

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  // Find the user in the database by email
  const user = await User.findOne({ email }).select('+password')

  // Check if the user exists in the database
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Check if the provided password matches the hashed password in the database
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // If email and password are valid, create a JWT token
  const payload = {
    userId: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    // Add any other necessary fields to the payload
  };

  const token = createToken(payload);
  
   res.cookie('jwt', token, {
    httpOnly: true, // Cookie cannot be accessed via JavaScript
    maxAge: 24 * 60 * 60 * 1000, // Token will expire in 1 day (milliseconds)
    secure: true, // Set to true if using HTTPS
  });

  // Return the token in the response
  res.status(200).json({success: true, token, userId: user._id });
})

// GET USER
const getUser = asyncHandler(async (req, res) => {

  // Get the userId from the URL params in the middleware -> userId
  const userId = req.userId;

  // You can access the authenticated user's information from req.user, as the authMiddleware sets it
  const authenticatedUser = await User.findById(userId);

  // Retrieve the projects titles with number of tasks assigned in each proj
  const userProjects = await Project.find({ _id: { $in: authenticatedUser.projectsInvolved } }, 'title tasks')
  .populate({
    path: 'tasks',
    match: { assignee: userId },
    select: 'assignee',
  })
  .lean(); // Convert documents to plain JavaScript objects
  const projects = userProjects.map(project => {
  const tasksAssigned = project.tasks ? project.tasks.length : 0;
  return {
    _id: project._id,
    title: project.title,
    tasksAssigned,
    };
  });

  const tasks = await Task.find({ assignee: userId })
    .populate('title deadline description')
    .sort({ status: -1, deadline: 1, updatedAt: 1 }) // Sort by status descending and deadline ascending
    .exec();
  
  // Assuming you want to send back some data to the client
  const responseData = {
    message: `Welcome to the home page, ${authenticatedUser.firstName}!`,
    userId: userId, // delete when finishing frontend
    profilePicture: authenticatedUser.profilePicture,
    projectsInvolved: projects,
    tasks: tasks
  };
  res.json(responseData);
})

// GET USER - additional data
const getUserPlus = asyncHandler(async (req, res) => {

  const userId = req.userId;

  const authenticatedUser = await User.findById(userId);

  const responseData = {
    firstName: authenticatedUser.firstName,
    lastName: authenticatedUser.lastName,
    profilePicture: authenticatedUser.profilePicture,
    contactInformation: {
        phone: authenticatedUser.contactInformation.phone,
        address: authenticatedUser.contactInformation.address,
    }};
  res.json(responseData);
})

// UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword, firstName, lastName, profilePicture, phone, address} = req.body

  try{
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
    return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password if changing password
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Missing old password' });
      } else {
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
          return res.status(401).json({ message: 'Incorrect old password' }); 
        }
      }
    }

    // Check if all fields are empty
    if (!newPassword && !firstName && !lastName && !profilePicture && !phone && !address) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    // Update user information
    if (newPassword) {
      const hashedPwd = await bcrypt.hash(newPassword, 10)
      user.password = hashedPwd;
    }
    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }
    if (address) {
        user.contactInformation.address = address;
      }
    if (phone) {
        user.contactInformation.phone = phone;
      }

    // Save the updated user
    await user.save();
    returnUser = await User.findById(req.userId).select('-password');

    return res.status(200).json({ message: 'User updated successfully.', returnUser });
  } catch (error) {
  return res.status(500).json({ message: 'Error updating user.', error: error.message });
}
});

// DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const { password } = req.body
  const userId = req.userId
    
  const user = await User.findById(userId).select('+password').exec()

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!password) {
    return res.status(401).json({ message: 'Password needed for authorization' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

    
  // Check if there are any projects with more than one member
  const projectsOwned = await Project.find({ owner: userId });
  for (const project of projectsOwned) {
    if (project.members.length > 1) {
      return res.status(400).json({ message: 'Transfer ownership before deleting the account.' });
    }
  }

  // Update tasks
  await Task.updateMany({ assignee: userId }, { $unset: { assignee: 1 } });

  // Loop through projects involved
  for (const projId of user.projectsInvolved) {
    const project = await Project.findById(projId).exec()

    // Collect notes content and update authorlessNotes
    const authorlessNotes = [];
    for (const noteId of project.notes) {
      const note = await Note.findById(noteId).exec();
      if (note.createdBy.toString() === userId) {
        authorlessNotes.push({
          removedCreator: `${user.firstName} ${user.lastName}`,
          noteBody: note.content,
        });
      }
    }

    // Update members, and managers
    project.members = project.members.filter(memberId => memberId.toString() !== userId);
    if (project.projectManagers.includes(userId)) {
      project.projectManagers = project.projectManagers.filter(managerId => managerId.toString() !== userId);
    }

    await project.save();
  }

  // Loop through projects owned and delete
  for (const projId of user.projectsOwned) {
    await Project.findByIdAndDelete(projId);
  }

  const notificationsToDelete = user.notifications;
  await Notification.deleteMany({ _id: { $in: notificationsToDelete } });

  // Finally, delete the user
  await User.findByIdAndDelete(userId);
    

  return res.status(200).json({ message: 'User deleted successfully' });
})


module.exports = {
    createNewUser, 
    regexCheckEmail,
    regexCheckPassword,
    logInUser,
    getUser,
    updateUser,
    deleteUser,
    getUserPlus
}
