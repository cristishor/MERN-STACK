const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const path = require('path')


router.route('/(.html)?')
  .post(async (req, res) => {
    await usersController.createNewUser(req, res);
    //res.redirect("/");
  })
  .get((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'register.html'));
  });

  module.exports = router