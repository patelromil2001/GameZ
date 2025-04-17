const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;

  // If token is missing, redirect to login page
  if (!token) {
    return res.redirect("/auth/loginpage");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request
    next();
  } catch (err) {
    // If token is invalid or expired
    return res.redirect("/auth/loginpage");
  }
};

// Middleware to restrict access to login/register if already authenticated
const restrictToGuests = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // If token is valid, redirect to dashboard or home
      return res.redirect("/");
    } catch (err) {
      // Invalid token → treat as guest
      return next();
    }
  } else {
    // No token → treat as guest
    return next();
  }
};

module.exports = {
  authenticateUser,
  restrictToGuests,
};
