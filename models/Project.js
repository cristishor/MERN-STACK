const mongoose = require('mongoose');

// Define the Project schema
const projectSchema = new mongoose.Schema({

  // Project Information
  title: { type: String, required: true },
  description: { type: String },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    validator: async function (value) {
      // Fetch the user by ID to check if it's a project manager
      const user = await mongoose.model('User').findById(value);
      if (!user || user.role !== 'project_manager') {
        return false;
      }
      return true;
    },
    message: 'Only project managers can be owners.'
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['in_progress', 'completed', 'on_hold'], default: 'in_progress' },

  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
  cluster: {type: mongoose.Schema.Types.ObjectId, ref: 'ProjectCluster'},

  // Additional Project Information 
  budget: { type: Number },
  totalCosts: {type: Number }, 
  endDate: { type: Date },
 
  activityLog: [
    {
      activityDate: { type: Date, required: true },
      activityType: { type: String, required: true },
      description: { type: String }
    }
  ],

  /* deadlines, alarms
   userDeadlines: [
    {
      deadlineDate: { type: Date, required: true },
      isPermanentlyShown: { type: Boolean, default: false },
      isHidden: { type: Boolean, default: false }
    }
  ],
  */
}, {timestamps : true});

// Create the Project model
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;