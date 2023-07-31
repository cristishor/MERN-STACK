const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler') //module used to help with not having too many try catch blocks as we use async methods with mongoose to save or delete data or even find data from mongodb
const bcrypt = require('bcrypt') //module used to hash the password before we save it
const { checkEmailFormat, checkPasswordFormat } = require('../utilities/regexCheck');

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
    const { email, password, firstName, lastName/*, contactInformation*/ } = req.body
    let profilePicture = req.body.profilePicture ? req.body.profilePicture : null
    //const phone = contactInformation.phone ? contactInformation.phone : null
    //const address = contactInformation.address ? contactInformation.address : null

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
        //phone: phone || null,
        //address: address || null
    }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) { //created
        res.status(201).json({ message: `New user ${email} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async(req, res) => {
    const {id, username, role, active, password} = req.body

    //confirm data
    if(!id || !username || !Array.isArray(role) || !role.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const user = await User.findById(id).exec() //exec() because we pass a value and we have to recieve a promise

    if(!user){
        return res.status(400).json({ message: 'User not found'})
    }

    //check for duplicate
    const duplicate = await User.findOne({username}).lean().exec()
    //allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    user.username = username
    user.role = role
    user.active = active

    if(password){
        //hash password 
        user.password = await bcrypt.hash(password, 10) //salt rounds -> gpt salt rounds
    }

    const updatedUser = await user.save() //if any error -> caught by the async handler tho we use no try and catch 

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a users
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async(req, res) => {
    const { id } = req.body
    
    if (!id) {
        return res.status(400).json({ message: 'User ID Required'}) 
    }

    const notes = await Note.findOne({ user: id }).lean().exec()
    if(notes?.length) {
        return res.status(400).json({ message: `User has assigned notes`})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({ message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

// regex check email
// @route POST /check/email
// @access Private?



module.exports = {
    createNewUser, 
    updateUser,
    deleteUser,
    regexCheckEmail,
    regexCheckPassword
}
/*
// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').lean() //find method, do not return the password with the user data and lean: mongoose would return a doc that has methods and other stuff in it 
    if(!users){
        return res.status(400).json({ message: 'No users found'})
    }
    res.json(users)
})

*/