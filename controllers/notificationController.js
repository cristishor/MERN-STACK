const User = require('../models/User')
const Project = require('../models/Project')
const Notification = require('../models/Notification');


const sortNotifications = (notifications) => {
    // Separate seen and unseen notifications
    const unseenNotifications = notifications.filter((notif) => !notif.seen);
    const seenNotifications = notifications.filter((notif) => notif.seen);
  
    // Sort unseen notifications by newest first
    unseenNotifications.sort((a, b) => b.createdAt - a.createdAt);
  
    // Sort seen notifications by newest first
    seenNotifications.sort((a, b) => b.createdAt - a.createdAt);
  
    // Combine unseen and seen notifications
    const sortedNotifications = [...unseenNotifications, ...seenNotifications];
  
    return sortedNotifications;
  };
  

const createNotification = async (req, res, next) => {
    try {
      const { targetUserId, title, body, proposal } = req.body;
  
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Target user not found' });
      }
  
      const notification = new Notification({
        title,
        body,
        proposal: null,
      });
  
    if (proposal) { 
       notification.proposal = proposal
    }

      targetUser.notifications.unshift(notification); //add it first in the array as it is the latest.
      await targetUser.save();

      return res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
      return next(error);
    }
  };
  

const updateNotification = async (req, res, next) => {
    try {
      const { notificationId, wasSeen, response } = req.body;
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

            if (notification.proposal.message === 'joinProject') {
                const newTitle = 'A new member joined your project!'
                const newBody = `${user.firstName} ${user.lastName} has joined your project: ${project.title}`
            }
            
            targetUserId = project.owner

            req.body = { targetUserId, newTitle, newBody };
            await createNotification(req, res, next);

          }
        }
    }
      
      if (wasSeen === true) {
        notification.seen = true;
      }
  
      await user.save();
  
      user.notifications = sortNotifications(user.notifications);
      await user.save();
  
      return res.status(200).json({ message: 'Notification updated successfully' });
    } catch (error) {
      return next(error);
    }
  };
  
  

  module.exports = {
    createNotification,
    updateNotification
  };