const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  filename: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true }, // Path where the attachment is stored on the server
  // Other attachment-specific fields, if needed
}, {timestamps : true});

const Attachment = mongoose.model('Attachment', attachmentSchema);

module.exports = Attachment;