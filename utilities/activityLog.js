const MAX_LOG_ENTRIES = 100; // Max number of log entries

const addActivityLogEntry = (project, activityType, description) => {
  if (!project.activityLog) {
    project.activityLog = [];
  }

  // Limit the activity log entries to MAX_LOG_ENTRIES
  if (project.activityLog.length >= MAX_LOG_ENTRIES) {
    project.activityLog.pop(); // Remove the oldest entry (FILO)
  }

  const timestamp = new Date().toLocaleString(); 
  const fullDescription = `${timestamp}: ${description}`;

  project.activityLog.unshift({
    activityType,
    description: fullDescription,
  });

};

module.exports = { addActivityLogEntry }