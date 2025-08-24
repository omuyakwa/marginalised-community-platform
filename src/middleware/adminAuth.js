const auth = require('./auth');

const adminAuth = (req, res, next) => {
  // First, run the standard authentication middleware
  auth(req, res, () => {
    // Then, check the user's role
    const allowedRoles = ['ADMIN', 'SUPERADMIN'];
    if (allowedRoles.includes(req.user.role)) {
      next(); // User has the required role, proceed
    } else {
      res.status(403).send({ error: 'Access denied. Administrator privileges required.' });
    }
  });
};

module.exports = adminAuth;
