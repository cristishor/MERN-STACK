const mongoose = require('mongoose');

const projectClusterSchema = new mongoose.Schema({
  name: {type: String, required: true, default: () => `NewCluster-${Date.now()}`},
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function (userId) {
        return User.findOne({ _id: userId, role: 'admin' })
          .then((user) => !!user)
          .catch(() => false);
      },
      message: 'User with the specified ID must be an admin.'
    }
  },
  description: {String},
}, {timestamps : true});

const ProjectCluster = mongoose.model('ProjectCluster', projectClusterSchema);

module.exports = ProjectCluster;