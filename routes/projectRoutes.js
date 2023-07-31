const express = require('express')
const router = express.Router()

const projectController = require('../controllers/projectController')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')


// custom middlware that requires users to be autheticated and have access to the project you are targeting
const userIdMiddleware = (req, res, next) => {
    if (req.route.path.includes(':projectId/:userId')) 
    {
        authMiddleware(req, res, () => projectAccess(req, res, next));
    } else if (req.route.path.includes(':userId')) 
    {
      return authMiddleware(req, res, next);
    }
    next();
  };


//test authMiddleware -> has jwt
router.route('/projects/new/:userId').post(projectController.createProject)

//test projectAccess middleware 
router.route('/projects/:projectId/:userId').get( /*some controller here*/)





module.exports = router