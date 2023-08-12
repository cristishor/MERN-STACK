const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  status: { type: String, enum: ['completed', 'todo', 'in_progress', 'urgent'], default: 'todo' },

  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },     // optioanl
  dependent: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // optional: reference to another task representing the dependency
  
  deadline: { type: Date }
}, {timestamps : true});


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;