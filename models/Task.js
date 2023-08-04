const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  status: { type: String, enum: ['todo', 'in_progress', 'urgent', 'completed'], default: 'todo' },

  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },     // optioanl
  dependencies: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // optional: reference to another task representing the dependency
  
  endDate: { type: Date },
  estimatedTime: { type: Number }, // In hours, days, etc.
}, {timestamps : true});


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;