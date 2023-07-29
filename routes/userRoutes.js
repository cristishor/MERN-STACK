const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')

router.route('/') // this will match the /users; we are at the route of /users; we can chain different methods here
    .get(usersController.getAllUsers) //read //every get request that comes at the rest API at /users we would have a response here direct to a controller
    .post(usersController.createNewUser) //create
    .patch(usersController.updateUser) //update
    .delete(usersController.deleteUser) //delete

    module.exports = router