const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" , required: true },
  content: { type: String },
}, {timestamps : true});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
