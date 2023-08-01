const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const path = require('path')


//server.js will have router('/login')
router.route('/(.html)?').post(usersController.logInUser)

router.get('/(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','login.html'))
})

module.exports = router
