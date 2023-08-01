const jwt = require('jsonwebtoken')
require('dotenv').config() // Load environment variables

const createToken = (payload) => {
    try {
        return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1d' }) // default header encoding: HS256
    } catch (error) {
        console.error('Error creating JWT token:', error)
        throw new Error('Error creating JWT token')
    }
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY)
  } catch (error) {
    return null
  }
}

module.exports = { createToken, verifyToken }