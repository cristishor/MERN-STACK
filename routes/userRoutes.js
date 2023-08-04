const express = require('express')
const router = express.Router()
const path = require('path')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')
const { regexCheckEmail, regexCheckPassword } = require('../controllers/usersController')

const usersController = require('../controllers/usersController')

// *** ALL ROUTES START AT /users *** 

router.route('/regexEmail').post(regexCheckEmail)
router.route('/regexPassword').post(regexCheckPassword)

router.route('/register(.html)?')
  .post(usersController.createNewUser)
  .get( (req, res) => {
    console.log('we in the routes')
    res.sendFile(path.join(__dirname,'..','views','register.html'))
})

router.route('/login(.html)?')
  .post(usersController.logInUser)
  .get( (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','login.html'))
})
router.delete('/logout(.html)?', authMiddleware)  //the authMiddleware handle the logout
 
router.route('/:userId')
  .get(authMiddleware, usersController.getUser)
  .put(authMiddleware, usersController.updateUser)
  .delete(authMiddleware, usersController.deleteUser)


module.exports = router