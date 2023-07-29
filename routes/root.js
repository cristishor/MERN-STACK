    const express = require('express')
    const router = express.Router()
    const path = require('path')

    router.get('^/$|/index(.html)?', (req, res) => {  //http method: user could request just the '/' or '/index' or '/index.html' + request and response to our function
        res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
    })

    module.exports = router