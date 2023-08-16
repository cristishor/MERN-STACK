const express = require('express')
const router = express.Router()
const path = require('path')

const authMiddleware = require('../middleware/authMiddleware')
const { regexCheckEmail, regexCheckPassword } = require('../controllers/usersController')

const usersController = require('../controllers/usersController')
const notificationController = require('../controllers/notificationController')

// *** ALL ROUTES START AT /users *** 

router.route('/regexEmail').post(regexCheckEmail)
router.route('/regexPassword').post(regexCheckPassword)

router.route('/register')
  .post(usersController.createNewUser)
router.route('/login')
  .post(usersController.logInUser)

router.delete('/:userId/logout', authMiddleware)  //the authMiddleware handle the logout
 
router.route('/:userId')
  .get(authMiddleware, usersController.getUser)
  .put(authMiddleware, usersController.updateUser)
  .delete(authMiddleware, usersController.deleteUser)
router.route('/:userId/profile')
  .get(authMiddleware, usersController.getUserPlus)

router.route('/:userId/notifications')
  .get(authMiddleware, notificationController.getNotifications)
router.route('/:userId/:notifId')
  .put(authMiddleware, notificationController.updateNotification)
  .delete(authMiddleware, notificationController.deleteNotification)

 module.exports = router