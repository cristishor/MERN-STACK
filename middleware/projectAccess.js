const User = require('../models/User');
const Project = require('../models/Project');


const projectAccess = async (req, res, next) => { 
    const userId = req.userId;
    const projectId = req.params.projectId

    try {
      const user = await User.findById(userId).populate('projectsInvolved').exec()
      const project = await Project.findById(projectId).populate('owner').populate('projectManagers').exec()

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const projectsInvolved = user.projectsInvolved.map((proj) => proj.toString());

      if (projectsInvolved.includes(projectId)) {
        
        req.projId = projectId;

        if (project.owner && project.owner.equals(userId)) {
          req.userRole = 'owner';
        } else {
          const isProjectManager = project.projectManagers.some((manager) => manager.equals(userId));
          req.userRole = isProjectManager ? 'manager' : 'regular';
        }

        next();

      } else {
        return res.status(403).json({ message: 'Unauthorized access to project' });
      }

    } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = projectAccess;

  //middleware pentru a putea accesa un proiect <=> userul are dreptul la acel proiect.