const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, requird: true},
  proposal: {
    type: {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      message: { type: String },
    }, default: null, },
  seen: {type: Boolean, required: true, default: false}


}, {timestamps : true});

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days in seconds

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
