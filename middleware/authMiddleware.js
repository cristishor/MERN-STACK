const jwt = require('jsonwebtoken');
//const cookieParser = require('cookie-parser')
const User = require('../models/User');
const {verifyToken} = require('../utilities/jwt')
const path = require('path')

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied, missing token' });      // ADD REDIRECTS res.redirect('/login');
  }

  try {
    // Check if the route is /users/logout -> delete the cookie = logout
    if (req.path === '/logout') { 
      res.clearCookie('jwt');

      return next();
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' }); // ADD REDIRECTS .redirect('/login');
    }

    // Find the user in the database using the decoded user ID from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' }); // ADD REDIRECTS .redirect('/register');
    }

    if (req.params.userId !== decoded.userId) {
      res.status(403);
      if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '..', 'views', 'notYourWorkspace.html'));
      } else if (req.accepts('json')) {
        res.json({ message: '403: This is not your workspace :/' });
      } else {
        res.type('txt').send('403 Forbidden');
      }
    } else {
      
      req.userId = decoded.userId // send it in the req.body so that i dont have to get it out each time, its already there.
      next();
    }
  } catch (error) { 
      return res.status(500).json({ message: 'Internal server error' });
  }
}


module.exports = authMiddleware;