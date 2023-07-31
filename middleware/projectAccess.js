const projectAccess = (req, res, next) => {
    const { id } = req.params;
    const { projects } = req.user; // Assuming you have the user data available in req.user
  
    if (!projects.includes(id)) {
      return res.status(403).json({ message: 'Unauthorized access to project.' });
    }
  
    next();
  };
  
  module.exports = projectAccess;

  //middleware pentru a putea accesa un proiect <=> userul are dreptul la acel proiect.