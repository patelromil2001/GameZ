const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// Register Route - Process Registration
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;

      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ error: "Email already in use" });

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const user = new User({ name, email, password: hashedPassword });
      await user.save();

      res.redirect("/auth/loginpage");
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }
);

// Login Route - Process Login (with validation)
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Compare password with stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Store token in cookie and redirect to dashboard
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        secure: process.env.NODE_ENV === "production", // true in production
      });

      res.redirect("/home");
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }
);

// Logout Route - Destroy Session
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/loginpage");
});

// Register Page
router.get("/registerpage", async (req, res) => {
  res.render("main.ejs", { title: "Home", body: "./pages/register" });
});
// Login Page
router.get("/loginpage", async (req, res) => {
  res.render("main.ejs", { title: "Home", body: "./pages/login" });
});



module.exports = router;
