const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied, missing token' });      // ADD REDIRECTS res.redirect('/login');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Find the user in the database using the decoded user ID from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set the authenticated user to req.user
    req.user = user;
    next();
  } catch (error) { //INSTEAD OF THE FOLLOWING BODY, HAVE return res.redirect('/login')
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' }); // ADD REDIRECTS .redirect('/login');
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });                          // ADD REDIRECTS .redirect('/login');
    } else {
      return res.status(500).json({ message: 'Internal server error' });                  // ADD REDIRECTS .redirect('/login');
    }
  }
};

module.exports = authMiddleware;