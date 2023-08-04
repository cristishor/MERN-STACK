const User = require('../models/User')
const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler') //module used to help with not having too many try catch blocks as we use async methods with mongoose to save or delete data or even find data from mongodb
const bcrypt = require('bcrypt') //module used to hash the password before we save it
const { checkEmailFormat, checkPasswordFormat } = require('../utilities/regexCheck');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { createToken } = require('../utilities/jwt')

//controllers have a req and a res, not a next because it should be the end of the line where we process the final data and process a res back

//TABLE OF CONTENTS:
// 1. regexCheckEmail
// 2. regexCheckPassword
// 3. createNewUser
// 4.
//

const regexCheckEmail = (req, res) => {
    const { email } = req.body;
  
    if (checkEmailFormat(email)) {
      return res.status(200).json({ message: 'Valid email format.' });
    } else {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
  };

// regex check password
// @route POST /check/password
// @access Private?
const regexCheckPassword = (req, res) => {
    const { password } = req.body;
  
    if (checkPasswordFormat(password)) {
      return res.status(200).json({ message: 'Valid password format.' });
    } else {
      return res.status(400).json({ message: 'Invalid password format.' });
    }
};

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async(req, res) => {
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

//LOG IN USER
//@route POST /login
//@access All
const logInUser = asyncHandler(async(req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  // Find the user in the database by email
  const user = await User.findOne({ email }).select('+password');;

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
  res.status(200).json({success: true, token });
})

//NOT USED -> awthMiddleware handles it!
const logOutUser = asyncHandler(async (req, res) => {
  // Clear the authentication cookie by setting it to an empty value and expiring it immediately
  res.cookie('jwt', '', { maxAge: 0 });

  res.status(200).json({ message: 'Logout successful' });
});



const getUser = async (req, res) => {

  // Get the userId from the URL params
  const userId = req.userId;

  // You can access the authenticated user's information from req.user, as the authMiddleware sets it
  const authenticatedUser = await User.findById(userId);

  // Assuming you want to send back some data to the client
  const responseData = {
    message: `Welcome to the home page, ${authenticatedUser.firstName} ${authenticatedUser.lastName}!`,
    userId: userId,
    firstName: authenticatedUser.firstName,
    lastName: authenticatedUser.lastName,
    profilePicture: authenticatedUser.profilePicture,
    contactInformation: {
        phone: authenticatedUser.contactInformation.phone,
        address: authenticatedUser.contactInformation.address,
    },
    notifications: authenticatedUser.notifications,
    projectsOwned: authenticatedUser.projectsOwned,
    projectsInvolved: authenticatedUser.projectsInvolved,
    tasksAssigned: authenticatedUser.tasksAssigned
  };
  res.json(responseData);
};

//////////////////


// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async(req, res) => {
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

    // Check if all fields are empty
    if (!newPassword && !firstName && !lastName && !profilePicture && !phone && !address) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    // Save the updated user
    await user.save();
    returnUser = await User.findById(req.userId).select('-password');

    return res.status(200).json({ message: 'User updated successfully.', returnUser });
  } catch (error) {
  return res.status(500).json({ message: 'Error updating user.', error: error.message });
}
});

// @desc Delete a users
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async(req, res) => {
  const { password } = req.body
  const userId = req.userId
    
  const user = await User.findById(userId).select('+password');
  try{ 
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

      // Delete all projects owned by the user
    for (const projectId of user.projectsOwned) {
      await Project.findByIdAndDelete(projectId);
    }

      // Find all projects where the user is a member
    const projects = user.projectsInvolved
      // Update the members array in each project to remove the user
    await Promise.all(
      projects.map(project => Project.findByIdAndUpdate(project._id, { $pull: { members: userId } }))
    );

    // If needed, update tasks to remove the user from the assignee field
    await Task.updateMany({ assignee: userId }, { $unset: { assignee: 1 } });


    // Finally, delete the user
    await User.findByIdAndDelete(userId);
    
  
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }

  return res.status(200).json({ message: 'User deleted successfully' });
})

// regex check email
// @route POST /check/email
// @access Private?



module.exports = {
    createNewUser, 
    regexCheckEmail,
    regexCheckPassword,
    logInUser,
    logOutUser,
    getUser,
    updateUser,
    deleteUser
}
