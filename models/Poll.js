const mongoose = require("mongoose");

const pollOptionsSchema = new mongoose.Schema({
  optionText: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollsSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  options: [pollOptionsSchema],
}, {timestamps : true});

const Polls = mongoose.model("Polls", pollsSchema);

module.exports = Polls;