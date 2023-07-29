const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler') //module used to help with not having too many try catch blocks as we use async methods with mongoose to save or delete data or even find data from mongodb
const bcrypt = require('bcrypt') //module used to hash the password before we save it

//controllers have a req and a res, not a next because it should be the end of the line where we process the final data and process a res back

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

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async(req, res) => {
    const { username, password, roles} = req.body

    // Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({ message: 'All fields are required'})
    }

    // Check for duplicate
    const duplicate = await User.findOne ({ username }).lean().exec() // if you pass something in (unlike find) call exec() at end

    if(duplicate) {
        return res.status(409).json({ message: 'Duplicate username'})
    }

    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = {username, "password": hashedPwd, roles}

    // Create and store new user
    const user = await User.create(userObject)

    if (user) { //created
        res.status(201).json({ message: 'New user ${username} created' })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async(req, res) => {
    const {id, username, roles, active, password} = req.body

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
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
    user.roles = roles
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

module.exports = {
    getAllUsers,
    createNewUser, 
    updateUser,
    deleteUser
}