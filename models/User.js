  //user data model

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['regular_user', 'admin'], default: 'regular_user' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: { type: String }, // URL or file path for profile picture (PNG, JPG, JPEG)
  contactInformation: {
    phone: { type: Number }, // Numerical phone number
    address: { type: String }
  },
  notifications: [
    {
        //nuj inca ce
    }
  ],
  projectsOwned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  projectsInvolved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
  //personalNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }], // Array of user's personal notes
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;