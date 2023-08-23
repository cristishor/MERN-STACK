const User = require('../models/User');
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler')


const projectAccess = asyncHandler(async (req, res, next) => { 
    const userId = req.userId;
    const projectId = req.params.projectId

      const user = await User.findById(userId)
        .select('firstName lastName projectsInvolved')
        .populate('projectsInvolved')
        .exec();
      const project = await Project.findById(projectId)
        .select('owner projectManagers')
        .populate('owner projectManagers')
        .exec();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const projectsInvolved = user.projectsInvolved.map((proj) => proj._id);
      
      if (projectsInvolved.some((projId) => projId.equals(projectId))) {
        
        req.projId = projectId;

        if (project.owner.equals(userId)) {
          req.userRole = 'owner';
        } else {
          const isProjectManager = project.projectManagers.some((manager) => manager.equals(userId));
          req.userRole = isProjectManager ? 'manager' : 'regular';
        }

        next();

      } else {
        const errorResponse = {
          status: 403,
          message: "This is not your workspace :/",
          errorCode: "FORBIDDEN_USER_PROJECT",
        };
        return res.status(403).json(errorResponse);
      }

  });
  
  module.exports = projectAccess;

  //middleware pentru a putea accesa un proiect <=> userul are dreptul la acel proiect.