const express = require('express')
const router = express.Router()

const usersController = require('../controllers/usersController')

const authMiddleware = require('../middleware/authMiddleware')
const projectAccess = require('../middleware/projectAccess')

router.get('/', authMiddleware, (req, res) => {
    res.redirect(`/${req.user._id}`);
  });
router.get('/:userId', authMiddleware, usersController.getHome);

module.exports = router