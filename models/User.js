//user data model

const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['regular_user', 'project_manager', 'admin'], default: 'regular_user' },
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
  projectsInvolved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  tasksAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  //personalNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }], // Array of user's personal notes
  /*userDeadlines: [
    {
      deadlineDate: { type: Date, required: true },
      isPermanentlyShown: { type: Boolean, default: false },
      isHidden: { type: Boolean, default: false }
    }
  ],
  */
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;