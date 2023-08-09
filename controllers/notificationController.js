const User = require('../models/User')
const Project = require('../models/Project')
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler')

const sortNotifications = async (user) => {

  const notificationObjects = await Notification.find({ _id: { $in: user.notifications } }).exec();

    const unseenNotifications = notificationObjects.filter((notif) => !notif.seen);
    const seenNotifications = notificationObjects.filter((notif) => notif.seen);

    // Sort seen and unseen notifications by newest first
    unseenNotifications.sort((a, b) => b.createdAt - a.createdAt);
    seenNotifications.sort((a, b) => b.createdAt - a.createdAt);

    const sortedNotifications = [...unseenNotifications, ...seenNotifications]
    console.log(sortedNotifications)
    user.notifications = sortedNotifications.map((notif) => notif._id); // Only store IDs
    
    await user.save();
    };
  
const getNotification = async (req, res) => {

}

const createNotification = async (req) => {
      const { targetUserId, title, body, proposal } = req.body;

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new Error('Target user not found');
      }
  
      const notification = new Notification({
        title,
        body,
        proposal: null,
      });

    if (proposal) { 
       notification.proposal = proposal
    }

    await notification.save();

    targetUser.notifications.unshift(notification._id); //add it first in the array as it is the latest.
    await targetUser.save();

    return { message: 'Notification sent successfully' };
    }
  

const updateNotification = async (req, res) => {
    try {
      const { wasSeen, response } = req.body;
      const notificationId = req.params.notifId;
      const userId = req.userId;
  
      const user = await User.findById(userId).exec();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const notification = await Notification.findById(notificationId).exec()
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
 
      // If the notification has proposal set to true and there's a response, update the "seen" status
      if (notification.proposal && response) {

        notification.seen = true;
        const projectId = notification.proposal.targetId;

        if (response === true) {
          const project = await Project.findById(projectId);
          if (project) {
            project.members.push(userId);
            await project.save();

            const newTitle = ''
            const newBody = ''

            if (notification.proposal.message === 'joinProject') {
                newTitle = 'A new member joined your project!'
                newBody = `${user.firstName} ${user.lastName} has joined your project: ${project.title}`
            }
            
            targetUserId = project.owner

            req.body = { targetUserId, newTitle, newBody };
            await createNotification(req, res, next);

          }
        }
    }
      
      if (wasSeen) {
        notification.seen = true;
      }
  
      await notification.save()
  
      await sortNotifications(user);
  
      return res.status(200).json({ message: 'Notification updated successfully' });
    } catch (error) {
      return (error);
    }
  };
  
  

  module.exports = {
    createNotification,
    updateNotification,
    getNotification
  };