const express = require('express')
const router = express.Router()
const path = require('path')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')
const { regexCheckEmail, regexCheckPassword } = require('../controllers/usersController')

const usersController = require('../controllers/usersController')

// *** ALL ROUTES START AT /users *** 

router.route('/check/email').post(regexCheckEmail)
router.route('/check/password').post(regexCheckPassword)

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

router.get('/home/:userId', authMiddleware, usersController.getHome);
 




/* // /home REDIRECT to /home/:userId -> move to frontend
router.get('/', (req, res) => {
    if (req.cookies.jwt) {
      // If the jwt cookie exists, extract userId from the token and redirect
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
      const userId = decoded.userId;
      res.redirect(`/home/${userId}`);
    } else {
      // If no jwt cookie, redirect to the login page
      res.redirect('/login');
    }
  });
  */

module.exports = router