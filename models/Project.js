const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({

  // Project Information
  title: { type: String, required: true },
  description: { type: String },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectManagers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  authorlessNotes: [{
    removedCreator: {type: String},
    noteBody: {type: String}
  }],

  // Additional Project Information 
  status: { type: String, enum: ['in_progress', 'completed', 'on_hold'], default: 'in_progress' },
  budget: { type: Number, default: 0 },
  expenses: [{
    expenseName: {type: String, required: true},
    cost: {type: Number, required: true},
    taskRefference: {type: String}
  }], 
  endDate: { type: Date },
 
  activityLog: [{
    activityType: { type: String, required: true },
    description: { type: String }
  }],

}, {timestamps : true});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;