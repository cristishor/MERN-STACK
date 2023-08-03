const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  cost: { type: Number }, // Optional if using the `costs` array from the Project model

  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  endDate: { type: Date },
  estimatedTime: { type: Number }, // In hours, days, etc.
  actualTime: { type: Number }, // In hours, days, etc.

  dependencies: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // Reference to another task representing the dependency

  taskLine: [{ type: String }],
});

// Middleware to update lastUpdated timestamp before saving the task
taskSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;