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

module.exports = authenticateUser;
