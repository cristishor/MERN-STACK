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

const cron = require ('node-cron')
const { exec } = require('child_process')

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
// app.use('/', express.static(path.join(__dirname, 'client'))) -> MOVED TO FRONTEND

// built-in middlware for root handling 
//BACK END
app.use('/api', require('./routes/root'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/projects', require('./routes/projectRoutes'))
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// FRONTEND
app.use(express.static("client/build"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});


app.use(errorHandler)

// Schedule the cleanup script to run every day at midnight - for cleaning old notifications from users
cron.schedule('0 0 * * *', () => {
    const cleanupScriptPath = path.join(__dirname, 'utilities', 'cleanupExpiredNotifications.js');
    exec(`node ${cleanupScriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error during cleanup script:', error);
        return;
      }
      console.log('Cleanup script executed:', stdout);
    });
  });

// mongo listener for connecting to the db
mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

