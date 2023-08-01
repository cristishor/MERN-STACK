const express = require('express')
const router = express.Router()

const usersController = require('../controllers/usersController')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')

// Redirect to /home/:userId without using the authMiddleware
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

router.get('/:userId', authMiddleware, usersController.getHome);

module.exports = router