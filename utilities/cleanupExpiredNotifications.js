const User = require('../models/User'); // Replace with the actual path

async function cleanupExpiredNotifications() {
  try {
    const usersWithExpiredNotifications = await User.find({
      notifications: {
        $elemMatch: {
          createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
    });

    for (const user of usersWithExpiredNotifications) {
      const updatedNotifications = user.notifications.filter(
        (notification) => notification.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      user.notifications = updatedNotifications;
      await user.save();
    }

    console.log('Cleanup complete');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupExpiredNotifications();
