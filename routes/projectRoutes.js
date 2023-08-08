const express = require('express')
const router = express.Router()
const path = require('path');

const projectController = require('../controllers/projectController')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')



router.route('/new/:userId')
  .post(authMiddleware, projectController.createProject)

//test projectAccess middleware 
router.route('/:projectId/:userId')
.get(authMiddleware, projectAccess, projectController.getProject)


module.exports = router