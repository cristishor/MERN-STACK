const mongoose = require('mongoose');

// Define the Project schema
const projectSchema = new mongoose.Schema({

  // Project Information
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectManagers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['in_progress', 'completed', 'on_hold'], default: 'in_progress' },

  cluster: {type: mongoose.Schema.Types.ObjectId, ref: 'ProjectCluster'},

  // Additional Project Information 
  budget: { type: Number },
  totalCosts: {type: Number }, 
  endDate: { type: Date },
 
  activityLog: [
    {
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