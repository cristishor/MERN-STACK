const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied, missing token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key used to sign the tokens

    // Find the user in the database using the decoded user ID from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set the authenticated user to req.user
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;