// Authentication middleware for user session
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this feature');
    res.redirect('/users/login');
  };
  
  // Admin check middleware (if needed in the future)
  const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
      return next();
    }
    req.flash('error_msg', 'You do not have permission to access this resource');
    res.redirect('/games');
  };
  
  // Export middleware
  module.exports = {
    isAuthenticated,
    isAdmin
  };