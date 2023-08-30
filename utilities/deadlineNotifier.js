const cron = require('node-cron');
const mongoose = require('mongoose');
const Notification = require('./models/Notification'); // Replace with the actual path to your Notification model
const Task = require('./models/Task'); // Replace with the actual path to your Task model
const User = require('./models/User')
const { createNotification } = require('./notificationController'); // Replace with the actual path to your notification controller

// Schedule the task to run every day at a specific time
cron.schedule('0 0 * * *', async () => {
  try {
    // Calculate the date 7 days from now
    const currentDate = new Date();
    const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find tasks with deadlines within the next 7 days
    const approachingTasks = await Task.find({
      deadline: { $gte: currentDate, $lte: nextWeek },
    });

    for (const task of approachingTasks) {
      // Get the project managers' user IDs (replace 'projectManagers' with the actual field name)
      let user
      if(task.assignee) {
        //user = User.findBy ceva
      }

      // Create and send notifications to project managers
      for (const managerId of projectManagersIds) {
        const message = `Task "${task.title}" in project "${task.projectTitle}" is approaching its deadline.`;
        await createNotification(managerId, message);
      }
    }

    console.log('Deadline notifications sent successfully.');
  } catch (error) {
    console.error('Error sending deadline notifications:', error);
  }
});
