const User = require('../models/User')
const Project = require('../models/Project')
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler')
const { addActivityLogEntry } = require('../utilities/activityLog')

const sortNotifications = async (user) => {

  const notificationObjects = await Notification.find({ _id: { $in: user.notifications } }).exec();

  const unseenNotifications = notificationObjects.filter((notif) => !notif.seen);
  const seenNotifications = notificationObjects.filter((notif) => notif.seen);

  // Sort seen and unseen notifications by newest first
  unseenNotifications.sort((a, b) => b.createdAt - a.createdAt);
  seenNotifications.sort((a, b) => b.createdAt - a.createdAt);

  const sortedNotifications = [...unseenNotifications, ...seenNotifications]

  user.notifications = sortedNotifications.map((notif) => notif._id); // Only store IDs
    
  await user.save();
};
  

const getNotification = asyncHandler(async (req, res) => {
  const notificationId = req.params.notifId;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const user = await User.findById(req.userId).select('notifications').exec()
    const notifExists = user.notifications.some(notifId => notifId.equals(notificationId) )

    if(!notifExists){
      return res.status(404).json({ message: 'Notification not found' })
    }

    const { title, body, proposal } = notification;

    res.status(200).json({ title, body, proposal });

});


const createNotification = async (req) => {
  const { targetUserId, title, body, proposal } = req.body;

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error('Target user not found');
  }
  
  const notification = new Notification({
    title: title,
    body: body,
    proposal: proposal || null,
  });

  await notification.save();

  targetUser.notifications.unshift(notification._id); //add it first in the array as it is the latest.
  await targetUser.save();

  return { message: 'Notification sent successfully' };
}
  

const updateNotification = asyncHandler( async (req, res) => {
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

        const project = await Project.findById(projectId).exec();

        if (notification.proposal.message === 'joinProject' && project && !project.members.includes(userId)) {
          
          project.members.push(userId);
          await project.save();

          user.projectsInvolved.push(projectId)
          await user.save()

          targetUserId = project.owner

          const newTitle = 'A new member joined your project!'
          const newBody = `${user.firstName} ${user.lastName} has joined your project: ${project.title}`

          const notificationData = {
            targetUserId,
            title: newTitle,
            body: newBody
          };
        
          await createNotification({body: notificationData});

          const activityType = 'New member added'
          const description = `${user.firstName} ${user.lastName} joined the project.`
          addActivityLogEntry(project, activityType, description)

        } else if (notification.proposal.message === 'managerAskJoinProject') {
          

        } else {
          return res.status(400).json({ message: 'No project || Target user already a member || Invalid proposal.' })
        }

    // delete notification here!
    user.notifications.pull(notificationId);
    await user.save();

    await Notification.findByIdAndDelete(notificationId);

  } else  if (response === false) {
    user.notifications.pull(notificationId);
    await user.save();

    await Notification.findByIdAndDelete(notificationId);

  } else if (wasSeen) {
    notification.seen = true;
    await notification.save()
    await sortNotifications(user);

  } else {
    return res.status(400).json({ message: 'Notification not updated. '})
  }

  return res.status(200).json({ message: 'Notification updated successfully' });
})

  
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const notificationId = req.params.notifId;

  // Find the user and remove the reference to the notification
  const user = await User.findById(userId).exec();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.notifications.includes(notificationId)) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  user.notifications.pull(notificationId);
  await user.save();

  // Delete the notification
  const deletedNotification = await Notification.findByIdAndDelete(notificationId);
  if (!deletedNotification) {
    return res.status(404).json({ message: 'Notification not found+' });
  }

  return res.status(200).json({ message: 'Notification deleted successfully' });
});


module.exports = {
  createNotification,
  updateNotification,
  getNotification,
  deleteNotification
};