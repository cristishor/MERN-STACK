const express = require('express')
const router = express.Router()
const path = require('path');

const projectController = require('../controllers/projectController')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')



router.route('/new/:userId')
  .post(authMiddleware, projectController.createProject)
  .get(authMiddleware, (req, res) => {
    const filePath = path.join(__dirname, '..','views','newProject.html')
    res.sendFile(filePath)
  })

//test projectAccess middleware 
router.route('/:projectId/:userId')
.get(authMiddleware, projectAccess, /*some controller here*/)


module.exports = router