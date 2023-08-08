const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: { type: String }, // URL or file path for profile picture (PNG, JPG, JPEG)
  contactInformation: {
    phone: { type: Number },
    address: { type: String }
  },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  projectsOwned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  projectsInvolved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;