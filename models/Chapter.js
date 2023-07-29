const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // Description of the chapter
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note'}],
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment'}],
  polls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pole'}],
}, {timestamps : true});

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;