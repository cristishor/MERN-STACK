const jwt = require('jsonwebtoken');
//const cookieParser = require('cookie-parser')
const User = require('../models/User');
const {verifyToken} = require('../utilities/jwt')
const path = require('path')

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    const errorResponse = {
      status: 401,
      message: 'Authorization denied, missing token',
      errorCode: 'NEEDS_LOGIN',
    };
    return res.status(401).json(errorResponse);    
  }

  try {

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      const errorResponse = {
        status: 401,
        message: 'Invalid token!',
        errorCode: 'NEEDS_LOGIN',
      };
      return res.status(401).json(errorResponse);    
    }

    // Find the user in the database using the decoded user ID from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      const errorResponse = {
        status: 401,
        message: 'User not found!',
        errorCode: 'NEEDS_LOGIN',
      };
      return res.status(401).json(errorResponse);    
    }

    if (req.params.userId !== decoded.userId) {
      const errorResponse = {
        status: 403,
        message: "This is not your workspace :/",
        errorCode: "FORBIDDEN_USER",
      };
      res.status(403).json(errorResponse);
    } else {
      // Check if the route is /users/logout -> delete the cookie = logout
      if (req.path === `/${decoded.userId}/logout`) { 
      res.clearCookie('jwt');

      return res.status(200).json({ message: 'Log out succesful!' });
    }
      req.userId = decoded.userId // send it in the req.body so that i dont have to get it out each time, its already there.
      req.isAuthenticated = true
      next();
    }
  } catch (error) { 
      return res.status(500).json({ message: 'Internal server error' });
  }
}


module.exports = authMiddleware;