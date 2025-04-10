const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  // Extract the token by splitting 'Bearer <token>'
  const bearerToken = token.split(" ")[1]; // Get token part after "Bearer"
  if (!bearerToken) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token." });
  }
};