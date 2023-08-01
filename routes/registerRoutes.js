const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const path = require('path')



router.route('/(.html)?').post(usersController.createNewUser) //add redirect to /tutorial or something then to /home

router.get('/(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname,'..','views','register.html'))
})
 
  module.exports = router