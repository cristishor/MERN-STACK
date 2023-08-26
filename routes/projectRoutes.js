const express = require('express')
const router = express.Router()
const path = require('path');

const projectController = require('../controllers/projectController')
const taskController = require('../controllers/taskController')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')


// create Project
router.route('/new/:userId')
  .post(authMiddleware, projectController.createProject)

// get Project
router.route('/:projectId/:userId')
  .get(authMiddleware, projectAccess, projectController.getProject)
  .put(authMiddleware, projectAccess, projectController.updateProject)
  .delete(authMiddleware, projectAccess, projectController.deleteProject)
router.route('/:projectId/:userId/projectInfo')
  .get(authMiddleware, projectAccess, projectController.getProjectPlus)
router.route('/:projectId/:userId/userInfo')
  .post(authMiddleware, projectAccess, projectController.getUserProjectData)
router.route('/:projectId/:userId/managerInfo')
  .get(authMiddleware, projectAccess, projectController.getProjectManagerData)


// update Owner
router.route('/:projectId/:userId/owner')
  .put(authMiddleware, projectAccess, projectController.passOwnership)

// update manager list
router.route('/:projectId/:userId/manager')
  .post(authMiddleware, projectAccess, projectController.addManager)
  .delete(authMiddleware, projectAccess, projectController.deleteManager)

// update mmember list
router.route('/:projectId/:userId/member')
  .get(authMiddleware, projectAccess, projectController.getMembers)
  .post(authMiddleware, projectAccess, projectController.addMember)
  .delete(authMiddleware, projectAccess, projectController.removeMember)

// expense routes 
router.route('/:projectId/:userId/expense')
  .post(authMiddleware, projectAccess, projectController.createExpense)
  .put(authMiddleware, projectAccess, projectController.updateExpense)
  .delete(authMiddleware, projectAccess, projectController.deleteExpense)


// note routes 
router.route('/:projectId/:userId/note')
  .post(authMiddleware, projectAccess, taskController.createNote)
  .get(authMiddleware, projectAccess, taskController.getNotes)
router.route('/:projectId/:userId/note/:noteId')
  .put(authMiddleware, projectAccess, taskController.updateNote)
  .delete(authMiddleware, projectAccess, taskController.deleteNote)

// task routes
router.route('/:projectId/:userId/task')
  .post(authMiddleware, projectAccess, taskController.createTask)
  .get(authMiddleware, projectAccess, taskController.getTasks)
router.route('/:projectId/:userId/task/:taskId')
  .put(authMiddleware, projectAccess, taskController.updateTask)
  .delete(authMiddleware, projectAccess, taskController.deleteTask)
router.route('/tasks/:taskId')
  .get(authMiddleware, taskController.findProjectOfTask)




module.exports = router