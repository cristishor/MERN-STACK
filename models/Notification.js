const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Common properties for all notifications
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },


}, {timestamps : true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
