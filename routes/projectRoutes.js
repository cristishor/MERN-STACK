const express = require('express')
const router = express.Router()
const path = require('path');

const projectController = require('../controllers/projectController')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')


// custom middlware that requires users to be autheticated and have access to the project you are targeting
/*const userIdMiddleware = (req, res, next) => {
    if (req.route.path.includes(':projectId/:userId')) 
    {
        authMiddleware(req, res, () => projectAccess(req, res, next));
    } else if (req.route.path.includes(':userId')) 
    {
      return authMiddleware(req, res, next);
    }
    next();
  };*/

  router.get('/new', (req, res) => {
    if (req.cookies.jwt) {
      // If the jwt cookie exists, extract userId from the token and redirect
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
      const userId = decoded.userId;
      res.redirect(`/projects/new/${userId}`);
    } else {
      // If no jwt cookie, redirect to the login page
      res.redirect('/login');
    }
  });

//test authMiddleware -> has jwt
router.route('/new/:userId')
  .get(authMiddleware, (req, res) => {
    const filePath = path.join(__dirname, '..','views','newProject.html')
    res.sendFile(filePath)
  })
  .post(authMiddleware, projectController.createProject)

//test projectAccess middleware 
router.route('/:projectId/:userId')
.get(authMiddleware, projectAccess, /*some controller here*/)





module.exports = router