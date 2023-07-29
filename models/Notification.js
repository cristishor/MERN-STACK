const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Common properties for all notifications
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },

  // Object-related properties
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: false },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
  note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: false },
  message: { type: String }, // Notification message for task-related notifications

  // Alarm-related properties
  alarmBool: {type: Boolean, default: false}, // Is it an alarm?
  alarmDate: { type: Date }, // Date and time when the alarm is triggered
  // recurring: { type: Boolean, default: false }, // Whether the alarm is recurring or one-time

    relatedObject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnyModel', // Use any one model name that is relevant to your use case
    required: true,
    validate: {
      validator: function (value) {
        const validModels = ['Project', 'Chapter', 'Task', 'Note'];
        return validModels.includes(this.relatedObjectType);
      },
      message: 'Invalid relatedObject type',
    },
  },
  relatedObjectType: {
    type: String,
    enum: ['Project', 'Chapter', 'Task', 'Note'],
    required: true,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
