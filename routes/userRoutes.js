const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const { regexCheckEmail, regexCheckPassword } = require('../controllers/usersController')

 // every get request that comes at the rest API at /users we would have a response here direct to a controller
router.route('/') // this will match the /users; we are at the route of /users; we can chain different methods here
    .post(usersController.createNewUser) //create

router.route('/check/email').post(regexCheckEmail)
router.route('/check/password').post(regexCheckPassword)

module.exports = router