require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')

const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const authMiddleware = require('./middleware/authMiddleware');

const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500 //get port from global variables if exists

connectDB()

// custom middlware for logs
app.use(logger)

// third-party middleware for CORS web browser security features
app.use(cors(corsOptions))

// built-in middleware for the ability to process json's in our app
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// TEMP // built in middlware 
app.use((req, res, next) => {
    console.log('Request body:', req.body);
    next();
  });
  
app.use(cookieParser())

// built-in middleware for serving static files like HTML, CSS, images and client-side JavaScript files
// <=> app.use(express.static('public')); the one in use one is more explicit, the other works because it's relative to where your server file is
app.use('/', express.static(path.join(__dirname, 'public'))) 

// built-in middlware for root handling 
app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))
app.use('/projects', require('./routes/projectRoutes'))
app.use('/register', require('./routes/registerRoutes'))
app.use('/login', require('./routes/loginRoutes'))
app.use('/home', require('./routes/homeRoutes'))

app.all('*', (req, res) => { //all pages 
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) { //if the request is a json 
        res.json({message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
} )

app.use(errorHandler)

// mongo listener for connecting to the db
mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

