const express = require('express')
const router = express.Router()
const path = require('path')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')
const { regexCheckEmail, regexCheckPassword } = require('../controllers/usersController')

const usersController = require('../controllers/usersController')
const notificationController = require('../controllers/notificationController')

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

router.delete('/:userId/logout(.html)?', authMiddleware)  //the authMiddleware handle the logout
 
router.route('/:userId')
  .get(authMiddleware, usersController.getUser)
  .put(authMiddleware, usersController.updateUser)
  .delete(authMiddleware, usersController.deleteUser)

router.route('/:userId/:notifId')
  .get(authMiddleware, notificationController.getNotification)
  .put(authMiddleware, notificationController.updateNotification)
  .delete(authMiddleware, notificationController.deleteNotification)
module.exports = router