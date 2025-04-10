// DEVWRAT RAVAL 
module.exports = {
  // Ensure user is logged in
  ensureAuth: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      req.session.returnTo = req.originalUrl;
      res.redirect('/auth/login');
    }
  },
  
  // Ensure user is not logged in
  ensureGuest: (req, res, next) => {
    if (!req.session.user) {
      return next();
    } else {
      res.redirect('/');
    }
  }
};