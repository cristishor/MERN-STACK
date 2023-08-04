const mongoose = require('mongoose');

// Define the Project schema
const projectSchema = new mongoose.Schema({

  // Project Information
  title: { type: String, required: true },
  description: { type: String },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectManagers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Additional Project Information 
  status: { type: String, enum: ['in_progress', 'completed', 'on_hold'], default: 'in_progress' },
  budget: { type: Number, default: 0 },
  expenses: [{
    expenseName: {type: String, required: true},
    cost: {type: Number, required: true},
    taskRefference: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }], 
  endDate: { type: Date },
 
  activityLog: [{
    activityType: { type: String, required: true },
    description: { type: String }
  }],

}, {timestamps : true});

// Create the Project model
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;